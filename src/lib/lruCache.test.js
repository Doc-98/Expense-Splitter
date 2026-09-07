import { afterEach, describe, expect, it } from 'vitest'
import { createLruCache } from './lruCache'

const STORAGE_KEY = 'test-lru-cache'

afterEach(() => {
  sessionStorage.removeItem(STORAGE_KEY)
})

describe('createLruCache', () => {
  it('evicts the least recently touched entry once past maxEntries', () => {
    const cache = createLruCache(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a') // touch 'a' so 'b' becomes least-recently-used
    cache.set('c', 3)
    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('c')).toBe(3)
  })

  it('round-trips a Map value through sessionStorage', () => {
    const write = createLruCache(5, STORAGE_KEY)
    write.set('k', { myParticipantByGroup: new Map([['g1', 'gm1'], ['g2', 'gm2']]) })

    // persistNow() is debounced (400ms) — flush it synchronously by
    // reading the cache back through a *new* instance, which only ever
    // sees what's actually landed in sessionStorage, same as a real page
    // refresh would.
    return new Promise((resolve) => {
      setTimeout(() => {
        const read = createLruCache(5, STORAGE_KEY)
        const cached = read.get('k')
        expect(cached.myParticipantByGroup).toBeInstanceOf(Map)
        expect(cached.myParticipantByGroup.get('g1')).toBe('gm1')
        // The real crash this guards against: calling a Map-only method
        // on what used to silently come back as a plain object.
        expect(() => new Set(cached.myParticipantByGroup.values())).not.toThrow()
        resolve()
      }, 450)
    })
  })

  it('round-trips a Set value through sessionStorage', () => {
    const write = createLruCache(5, STORAGE_KEY)
    write.set('k', { selectedIds: new Set(['b1', 'b2']) })

    return new Promise((resolve) => {
      setTimeout(() => {
        const read = createLruCache(5, STORAGE_KEY)
        const cached = read.get('k')
        expect(cached.selectedIds).toBeInstanceOf(Set)
        expect(cached.selectedIds.has('b1')).toBe(true)
        resolve()
      }, 450)
    })
  })

  it('starts empty rather than throwing when sessionStorage holds corrupt JSON', () => {
    sessionStorage.setItem(STORAGE_KEY, '{not valid json')
    const cache = createLruCache(5, STORAGE_KEY)
    expect(cache.get('anything')).toBeUndefined()
  })
})
