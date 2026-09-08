import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { advanceDate, computeDueOccurrences } from './recurringBills'

describe('advanceDate', () => {
  it('adds exactly 7 days for a weekly template', () => {
    expect(advanceDate(new Date(2026, 8, 1), 'weekly', 1)).toEqual(new Date(2026, 8, 8))
  })

  it('advances one calendar month, keeping the same day-of-month', () => {
    expect(advanceDate(new Date(2026, 0, 15), 'monthly', 15)).toEqual(new Date(2026, 1, 15))
  })

  it('clamps to the last day of a short month rather than overflowing into the next one', () => {
    // Jan 31 -> Feb has only 28 days in 2026 (not a leap year).
    expect(advanceDate(new Date(2026, 0, 31), 'monthly', 31)).toEqual(new Date(2026, 1, 28))
  })

  it('recovers to the original target day once a longer month allows it, instead of drifting permanently', () => {
    // targetDay (31) is passed in fresh each call rather than derived from
    // the previous, clamped result — March has 31 days, so this lands back
    // on the 31st instead of compounding down from Feb's clamped 28th.
    const feb = advanceDate(new Date(2026, 0, 31), 'monthly', 31)
    expect(advanceDate(feb, 'monthly', 31)).toEqual(new Date(2026, 2, 31))
  })

  it('advances one calendar year, keeping the same month and day', () => {
    expect(advanceDate(new Date(2026, 5, 10), 'yearly', 10)).toEqual(new Date(2027, 5, 10))
  })

  it('clamps Feb 29 to Feb 28 in a non-leap year', () => {
    expect(advanceDate(new Date(2028, 1, 29), 'yearly', 29)).toEqual(new Date(2029, 1, 28))
  })
})

describe('computeDueOccurrences', () => {
  it('returns nothing when the next due date is still in the future', () => {
    const { dueDates, newNextDueDate } = computeDueOccurrences(
      new Date(2026, 8, 15),
      'monthly',
      15,
      new Date(2026, 8, 1)
    )
    expect(dueDates).toEqual([])
    expect(newNextDueDate).toEqual(new Date(2026, 8, 15))
  })

  it('includes the due date itself (inclusive), not just strictly-past ones', () => {
    const due = new Date(2026, 8, 1)
    expect(computeDueOccurrences(due, 'monthly', 1, due).dueDates).toEqual([due])
  })

  it('catches up every missed occurrence in order, not just the most recent one', () => {
    const { dueDates, newNextDueDate } = computeDueOccurrences(
      new Date(2026, 7, 4),
      'weekly',
      4,
      new Date(2026, 7, 25)
    )
    expect(dueDates).toEqual([
      new Date(2026, 7, 4),
      new Date(2026, 7, 11),
      new Date(2026, 7, 18),
      new Date(2026, 7, 25),
    ])
    expect(newNextDueDate).toEqual(new Date(2026, 8, 1))
  })

  // The actual bug this guards against: `new Date('2026-09-08')` parses as
  // midnight *UTC*, not midnight local. In any timezone ahead of UTC,
  // that's a few hours *later* than local midnight the same calendar day
  // — so re-checking a template's freshly-fetched next_due_date string
  // (see processDueRecurringBills) against `asOf` (today, at local
  // midnight) came out as "still in the future" for the entire day it was
  // actually due, and the first occurrence of a bill starting "today"
  // silently didn't get created until a day late.
  //
  // This only reproduces under a real non-UTC timezone, and this repo's
  // CI/dev container runs in UTC — so, unusually for this codebase, the
  // check runs in a genuine subprocess with TZ set at spawn time, rather
  // than as a plain in-process assertion. Setting `process.env.TZ` mid-test
  // doesn't work here: vitest's worker pool caches each worker's timezone
  // the first time anything touches Date/Intl, and a later env change is
  // silently ignored for the rest of that worker's life (confirmed by hand
  // — a mid-test `process.env.TZ = 'Europe/Rome'` measurably changed
  // nothing) — the only reliable way to observe a different offset is a
  // fresh process that never saw UTC.
  it('parses a bare "YYYY-MM-DD" string as local midnight, so a template due today fires today', () => {
    // Not `fileURLToPath(import.meta.url)` — vitest runs this file through
    // its own module runner, where `import.meta.url` is a vitest-internal
    // URL scheme, not a real `file://` one. Resolved from the repo root
    // (vitest's own working directory) instead.
    const modulePath = path.resolve(process.cwd(), 'src/lib/recurringBills.js')
    const script = `
      import { computeDueOccurrences } from ${JSON.stringify(modulePath)}
      const dueToday = new Date(2026, 8, 8)
      const { dueDates } = computeDueOccurrences('2026-09-08', 'monthly', 8, dueToday)
      if (dueDates.length !== 1 || dueDates[0].getTime() !== dueToday.getTime()) {
        console.error('expected [dueToday], got', dueDates)
        process.exit(1)
      }
    `
    expect(() =>
      execFileSync(process.execPath, ['--input-type=module', '-e', script], {
        env: { ...process.env, TZ: 'Europe/Rome' }, // UTC+1/+2 — ahead of UTC, where this broke
        stdio: 'pipe',
      })
    ).not.toThrow()
  })
})
