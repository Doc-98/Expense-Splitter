import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCategories, addCategory, renameCategory, deleteCategory, updateCategoryColor, CATEGORY_COLORS } from '../lib/categories'
import { groupCategoriesCache } from '../lib/groupCategoriesCache'
import { useClickOutside } from '../lib/useClickOutside'
import ColorSwatchPicker from './ColorSwatchPicker'
import CategoryColorButton from './CategoryColorButton'

// The "⋮" per-row menu — same shape as GroupSubscriptionsSection.jsx's own
// TemplateMenu (Rename/Delete instead of Edit/Pause/Delete). Kept local to
// this file rather than its own component, same reasoning as that one:
// only ever used here.
function CategoryMenu({ category, onRename, onDelete }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  useClickOutside(wrapRef, () => setOpen(false), open)

  function run(action) {
    setOpen(false)
    action()
  }

  return (
    <div className="row-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="row-menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Actions for ${category.name}`}
      >
        ⋮
      </button>
      {open && (
        <div className="row-menu-popover">
          <button type="button" className="dropdown-item" onClick={() => run(onRename)}>
            Rename
          </button>
          <button type="button" className="dropdown-item dropdown-item-warn" onClick={() => run(onDelete)}>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function GroupCategoriesSection() {
  const { groupId } = useParams()

  // Seeded straight from groupCategoriesCache when there's anything there
  // — either a prefetch fired the instant the group page's own Settings
  // (gear) icon was clicked (see prefetchGroupSettings.js/GroupView.jsx)
  // or a previous visit this session.
  const [categories, setCategories] = useState(() => groupCategoriesCache.get(groupId) ?? [])
  const [error, setError] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0])
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')

  const loadCategories = useCallback(async () => {
    const data = await fetchCategories(groupId)
    setCategories(data)
    groupCategoriesCache.set(groupId, data)
  }, [groupId])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  async function submitAddCategory(e) {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setError(null)
    try {
      await addCategory(groupId, newCategoryName.trim(), newCategoryColor)
      setNewCategoryName('')
      loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  async function saveCategoryRename(categoryId) {
    if (!editingCategoryName.trim()) return
    setError(null)
    try {
      await renameCategory(categoryId, editingCategoryName.trim())
      setEditingCategoryId(null)
      loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  // Applied straight away, no confirm step — same as picking a color when
  // first adding a category, and easy enough to undo (click the dot again)
  // that a confirmation would only be friction.
  async function handleCategoryColorChange(categoryId, color) {
    setError(null)
    const previous = categories
    const optimistic = categories.map((c) => (c.id === categoryId ? { ...c, color } : c))
    setCategories(optimistic)
    groupCategoriesCache.set(groupId, optimistic)
    try {
      await updateCategoryColor(categoryId, color)
    } catch (err) {
      setCategories(previous)
      groupCategoriesCache.set(groupId, previous)
      setError(err.message)
    }
  }

  async function handleDeleteCategory(category) {
    if (
      !window.confirm(
        `Delete "${category.name}"? Any bills or items tagged with it will become uncategorized — nothing about them is deleted.`
      )
    ) {
      return
    }
    setError(null)
    try {
      await deleteCategory(category.id)
      loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h2 className="settings-section-title">Categories</h2>
      <p className="muted">
        Tag a bill (or an individual item, if it belongs somewhere else) with one of these to see
        how you spend, not just how much, on the group's stats page.
      </p>
      <ul className="member-list">
        {categories.map((cat) => (
          <li key={cat.id} className="member-list-item">
            {editingCategoryId === cat.id ? (
              <form
                className="guest-rename-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  saveCategoryRename(cat.id)
                }}
              >
                <CategoryColorButton color={cat.color} onChangeColor={(color) => handleCategoryColorChange(cat.id, color)} />
                <input value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} autoFocus />
                <button type="submit" className="btn-link">
                  Save
                </button>
                <button type="button" className="btn-link" onClick={() => setEditingCategoryId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="category-label">
                  <CategoryColorButton color={cat.color} onChangeColor={(color) => handleCategoryColorChange(cat.id, color)} />
                  {cat.name}
                </span>
                <CategoryMenu
                  category={cat}
                  onRename={() => {
                    setEditingCategoryId(cat.id)
                    setEditingCategoryName(cat.name)
                  }}
                  onDelete={() => handleDeleteCategory(cat)}
                />
              </>
            )}
          </li>
        ))}
      </ul>
      <h2 className="settings-section-title">New category</h2>
      <form onSubmit={submitAddCategory} className="stacked-form">
        <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category" />
        <ColorSwatchPicker value={newCategoryColor} onChange={setNewCategoryColor} />
        <div className="stacked-form-actions">
          <button type="submit" className="btn-primary form-submit-btn" disabled={!newCategoryName.trim()}>
            Add category
          </button>
          {/* Stands in for the button while it's faded out — same field
              gates it, so this only ever shows exactly when the button
              itself isn't there to explain its own absence. */}
          {!newCategoryName.trim() && <span className="form-submit-hint">Type a name to continue</span>}
        </div>
      </form>

      {error && <p className="status-error">{error}</p>}
    </>
  )
}
