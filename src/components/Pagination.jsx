export default function Pagination({ page, setPage, totalItems, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  if (totalPages <= 1) return null

  return (
    <>
      {/* The pill below is `position: fixed` (see styles.css) so it never
          moves as pages of different heights are switched between — which
          also takes it out of document flow entirely. This spacer reserves
          the vertical space it used to occupy in flow, so whatever renders
          right after it (Record a payment, Quick stats, …) never ends up
          underneath it. */}
      <div className="pagination-spacer" aria-hidden="true" />
      <div className="pagination">
        <button
          type="button"
          className="btn-icon"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className="pagination-label">
          Page {page + 1} of {totalPages}
        </span>
        <button
          type="button"
          className="btn-icon"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </>
  )
}
