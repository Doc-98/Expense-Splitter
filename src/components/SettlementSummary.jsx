import { useEffect, useState } from 'react'
import { parseNumber } from '../lib/parseNumber'
import { useCurrency } from '../context/CurrencyContext'
import Pagination from './Pagination'

// Same page size as the bill list (GroupView.jsx) — no reason for these to
// differ, and it keeps "how many rows before this paginates" one number to
// remember across the app rather than two.
const PAYMENTS_PAGE_SIZE = 15

function RecordPaymentForm({ members, onRecordPayment }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  function submit(e) {
    e.preventDefault()
    const amt = parseNumber(amount)
    if (!from || !to || from === to || !amt) return
    onRecordPayment(from, to, amt)
    setAmount('')
  }

  return (
    <form onSubmit={submit} className="payment-form">
      <select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Who paid">
        <option value="">Who paid…</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
            {m.isGuest ? ' (guest)' : ''}
          </option>
        ))}
      </select>
      <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="Who received it">
        <option value="">Paid to…</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
            {m.isGuest ? ' (guest)' : ''}
          </option>
        ))}
      </select>
      <input
        placeholder="Amount"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit" className="btn-secondary">
        Record
      </button>
    </form>
  )
}

export default function SettlementSummary({ transactions, members, payments, onRecordPayment, onDeletePayment }) {
  const { format } = useCurrency()
  const nameOf = (id) => members?.find((m) => m.id === id)?.name || 'Someone'

  // Local to this component rather than lifted to GroupView — nothing
  // outside this list cares which page of *history* is showing, unlike
  // the bill list's own page state, which GroupView needs for other
  // things (keyboard navigation, the row a realtime update should focus).
  const [paymentsPage, setPaymentsPage] = useState(0)
  const paymentsList = payments || []

  // Same clamp bills' own pagination uses — deleting enough payments (or
  // undoing one from the very last page) can leave `paymentsPage` pointing
  // past the new last page, which would render as a blank list instead of
  // snapping back to somewhere real.
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(paymentsList.length / PAYMENTS_PAGE_SIZE) - 1)
    if (paymentsPage > maxPage) setPaymentsPage(maxPage)
  }, [paymentsList.length, paymentsPage])

  if (!transactions) return null

  const visiblePayments = paymentsList.slice(
    paymentsPage * PAYMENTS_PAGE_SIZE,
    (paymentsPage + 1) * PAYMENTS_PAGE_SIZE
  )

  return (
    <div className="settlement">
      <h2 className="section-divider">Settle up</h2>
      {transactions.length === 0 ? (
        <p className="empty-state">Everyone's even — nothing to settle.</p>
      ) : (
        <ul className="settlement-list">
          {transactions.map((t, i) => (
            <li key={i}>
              <span className="debtor">{nameOf(t.from)}</span>
              <span className="settlement-verb">owes</span>
              <span className="creditor">{nameOf(t.to)}</span>
              <span className="settlement-action">
                <span className="mono amount">{format(t.amount)}</span>
                <button
                  type="button"
                  className="btn-secondary mark-paid-btn"
                  onClick={() => onRecordPayment(t.from, t.to, t.amount)}
                >
                  Mark paid
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="payment-form-title section-divider">Record a payment</h3>
      <RecordPaymentForm members={members || []} onRecordPayment={onRecordPayment} />

      {paymentsList.length > 0 && (
        <details className="payment-history">
          <summary>Payment history ({paymentsList.length})</summary>
          <ul className="settlement-list">
            {visiblePayments.map((p) => (
              <li key={p.id}>
                <span className="debtor">{nameOf(p.from_member)}</span>
                <span className="settlement-verb">paid</span>
                <span className="creditor">{nameOf(p.to_member)}</span>
                <span className="settlement-action">
                  <span className="mono amount">{format(p.amount)}</span>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => onDeletePayment(p.id)}
                    aria-label="Undo this payment"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <Pagination
            page={paymentsPage}
            setPage={setPaymentsPage}
            totalItems={paymentsList.length}
            pageSize={PAYMENTS_PAGE_SIZE}
            floating={false}
          />
        </details>
      )}
    </div>
  )
}
