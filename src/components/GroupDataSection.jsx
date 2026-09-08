import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchDraft } from '../lib/bankImportDrafts'
import { ImportIcon, TagIcon } from './icons'

// `isPersonal` comes from the shell (GroupSettings.jsx) — it already
// fetches it once to decide which nav tabs even apply, so this is the one
// section that takes a prop instead of fetching everything itself, rather
// than a second round-trip just for a boolean the shell already has.
export default function GroupDataSection({ isPersonal }) {
  const { groupId } = useParams()

  // { reviewedCount, totalReviewable } for an unfinished bank statement
  // import, or null — see bank_import_drafts in schema.sql. Only fetched
  // for a personal space (the only place the feature's offered).
  const [bankImportDraft, setBankImportDraft] = useState(null)

  const loadBankImportDraft = useCallback(async () => {
    const draft = await fetchDraft(groupId)
    if (!draft) {
      setBankImportDraft(null)
      return
    }
    const totalReviewable = draft.transactions.filter((t) => t.direction === 'debit').length
    const reviewedCount = draft.review.filter((r, i) => draft.transactions[i].direction === 'debit' && r.reviewed).length
    setBankImportDraft({ reviewedCount, totalReviewable })
  }, [groupId])

  useEffect(() => {
    if (isPersonal) loadBankImportDraft()
  }, [isPersonal, loadBankImportDraft])

  return (
    <>
      <h2 className="settings-section-title">Data</h2>
      <p className="muted">
        Bring in a group's spending history from another app — realistically a one-time thing, so
        it lives here rather than cluttering the group page itself.
      </p>

      <div className="settings-action-list">
        <Link to={`/groups/${groupId}/import`} className="settings-action-row">
          <span className="settings-action-icon">
            <ImportIcon size={20} />
          </span>
          <span className="settings-action-body">
            <span className="settings-action-title">Import bills from Splitwise</span>
            <p className="settings-action-desc">
              Upload a CSV export from Splitwise — matched to this group's members, with a balance
              check before anything's actually added.
            </p>
          </span>
          <span className="chevron">→</span>
        </Link>

        <Link to={`/groups/${groupId}/categorize`} className="settings-action-row">
          <span className="settings-action-icon">
            <TagIcon size={20} />
          </span>
          <span className="settings-action-body">
            <span className="settings-action-title">Categorize uncategorized bills</span>
            <p className="settings-action-desc">
              Go through older bills that don't have a category yet, one at a time.
            </p>
          </span>
          <span className="chevron">→</span>
        </Link>

        {/* Personal-space only, for now — a bank statement genuinely covers
            your own account either way, but a shared group's statement
            import (whose account, who's the payer, splitting a shared bill
            apart from the raw transaction list) is a different, bigger
            feature than this one, not yet built. */}
        {isPersonal && (
          <Link to={`/groups/${groupId}/import-bank-statement`} className="settings-action-row">
            <span className="settings-action-icon">
              <ImportIcon size={20} />
            </span>
            <span className="settings-action-body">
              <span className="settings-action-title">
                {bankImportDraft ? 'Resume bank statement import' : 'Import a bank statement'}
              </span>
              <p className="settings-action-desc">
                {bankImportDraft
                  ? `${bankImportDraft.totalReviewable - bankImportDraft.reviewedCount} of ${bankImportDraft.totalReviewable} transactions left to review.`
                  : 'Turn a bank or credit-card statement (CSV, Excel, or PDF) into bills, reviewed one at a time before anything is added.'}
              </p>
            </span>
            <span className="chevron">→</span>
          </Link>
        )}
      </div>
    </>
  )
}
