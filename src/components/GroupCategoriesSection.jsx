import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCategories, addCategory, renameCategory, deleteCategory, updateCategoryColor, CATEGORY_COLORS } from '../lib/categories'
import ColorSwatchPicker from './ColorSwatchPicker'
import CategoryColorButton from './CategoryColorButton'

export default function GroupCategoriesSection() {
  const { groupId } = useParams()

  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0])
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')

  const loadCategories = useCallback(async () => {
    setCategories(await fetchCategories(groupId))
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
    setCategories((cats) => cats.map((c) => (c.id === categoryId ? { ...c, color } : c)))
    try {
      await updateCategoryColor(categoryId, color)
    } catch (err) {
      setCategories(previous)
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
                <span className="member-list-actions">
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setEditingCategoryId(cat.id)
                      setEditingCategoryName(cat.name)
                    }}
                  >
                    Rename
                  </button>
                  <button type="button" className="btn-link dropdown-item-warn" onClick={() => handleDeleteCategory(cat)}>
                    Delete
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={submitAddCategory} className="inline-form category-add-form">
        <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category" />
        <ColorSwatchPicker value={newCategoryColor} onChange={setNewCategoryColor} />
        <button type="submit" className="btn-primary">
          Add category
        </button>
      </form>

      {error && <p className="status-error">{error}</p>}
    </>
  )
}
