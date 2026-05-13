import { useState, useCallback } from 'react';

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

export interface UseLocalPrefsReturn {
  wishlist: Set<string>;
  favorites: Set<string>;
  toggleWishlist: (cardId: string) => void;
  toggleFavorite: (cardId: string) => void;
  setWishlistOn: (cardId: string) => void;
}

export function useLocalPrefs(): UseLocalPrefsReturn {
  const [wishlist, setWishlist] = useState<Set<string>>(() => loadSet('rift-wishlist'));
  const [favorites, setFavorites] = useState<Set<string>>(() => loadSet('rift-favorites'));

  const toggleWishlist = useCallback((cardId: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(cardId) ? next.delete(cardId) : next.add(cardId);
      saveSet('rift-wishlist', next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((cardId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(cardId) ? next.delete(cardId) : next.add(cardId);
      saveSet('rift-favorites', next);
      return next;
    });
  }, []);

  const setWishlistOn = useCallback((cardId: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.add(cardId);
      saveSet('rift-wishlist', next);
      return next;
    });
  }, []);

  return { wishlist, favorites, toggleWishlist, toggleFavorite, setWishlistOn };
}
