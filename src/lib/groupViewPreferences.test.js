import { afterEach, describe, it, expect } from 'vitest'
import { getGroupViewPreferences, setGroupViewPreferences } from './groupViewPreferences'

afterEach(() => {
  localStorage.clear()
})

describe('getGroupViewPreferences', () => {
  it('defaults both display preferences to visible, and sticky filters off', () => {
    expect(getGroupViewPreferences()).toEqual({
      showQuickStats: true,
      showLentBorrowedStatus: true,
      stickyFilters: false,
    })
  })

  it('persists a partial update without disturbing the other preferences', () => {
    setGroupViewPreferences({ showQuickStats: false })
    expect(getGroupViewPreferences()).toEqual({
      showQuickStats: false,
      showLentBorrowedStatus: true,
      stickyFilters: false,
    })
  })

  it('applies globally rather than per group — there is no group id involved at all', () => {
    setGroupViewPreferences({ showLentBorrowedStatus: false })
    // Same call signature, same result, regardless of which group's page
    // happens to be asking — the whole point of this preference.
    expect(getGroupViewPreferences().showLentBorrowedStatus).toBe(false)
  })

  it('persists the sticky-filters toggle independently of the others', () => {
    setGroupViewPreferences({ stickyFilters: true })
    expect(getGroupViewPreferences()).toEqual({
      showQuickStats: true,
      showLentBorrowedStatus: true,
      stickyFilters: true,
    })
  })
})
