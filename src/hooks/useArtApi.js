import { useEffect, useState } from "react";

export const iiifImageUrl = (image_id, width = 400) => {
	if (!image_id) return null;
	return `https://www.artic.edu/iiif/2/${image_id}/full/${width},/0/default.jpg`;
};

export function useArtworks(options = {}) {
	const { limit = 12, fields = "id,title,image_id,artist_title,date_display" } =
		options;
	const [artworks, setArtworks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		let isMounted = true;

		async function fetchArtworks() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`https://api.artic.edu/api/v1/artworks?limit=${limit}&fields=${encodeURIComponent(
						fields
					)}`,
					{ signal: controller.signal }
				);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
				if (isMounted) setArtworks(json.data || []);
			} catch (err) {
				if (err.name !== "AbortError")
					setError(err.message || "Failed to load");
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		fetchArtworks();
		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [limit, fields]);

	return { artworks, loading, error };
}

export function useArt(id) {
	const [art, setArt] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!id) return;
		const controller = new AbortController();
		let isMounted = true;

		async function fetchArt() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`https://api.artic.edu/api/v1/artworks/${id}?fields=id,title,image_id,artist_title,date_display,medium_display,dimensions,credit_line,thumbnail`,
					{ signal: controller.signal }
				);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
				if (isMounted) setArt(json.data || null);
			} catch (err) {
				if (err.name !== "AbortError")
					setError(err.message || "Failed to load");
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		fetchArt();
		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [id]);

	return { art, loading, error };
}

// Fetch multiple artworks by an iterable of IDs (used for favorites page)
export function useFavoriteArtworks(favoritesIterable) {
	const [arts, setArts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const ids = Array.from(favoritesIterable || []);
		if (!ids.length) {
			setArts([]);
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		let isMounted = true;

		async function fetchFavorites() {
			setLoading(true);
			setError(null);
			try {
				const fieldList = encodeURIComponent(
					"id,title,image_id,artist_title,date_display,thumbnail"
				);
				const promises = ids.map((id) =>
					fetch(
						`https://api.artic.edu/api/v1/artworks/${id}?fields=${fieldList}`,
						{ signal: controller.signal }
					).then((res) => {
						if (!res.ok) throw new Error(`HTTP ${res.status}`);
						return res.json();
					})
				);

				const results = await Promise.all(promises);
				const data = results.map((r) => r.data).filter(Boolean);
				if (isMounted) setArts(data);
			} catch (err) {
				if (err.name !== "AbortError")
					setError(err.message || "Failed to load");
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		fetchFavorites();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [favoritesIterable]);

	return { arts, loading, error };
}

// Favorites management (localStorage)
const FAVORITES_KEY = "artofchicago:favorites";

function loadFavoritesFromStorage() {
	try {
		const raw = localStorage.getItem(FAVORITES_KEY);
		if (!raw) return new Set();
		const arr = JSON.parse(raw);
		return new Set(Array.isArray(arr) ? arr : []);
	} catch (e) {
		console.debug("loadFavoritesFromStorage error:", e);
		return new Set();
	}
}

function saveFavoritesToStorage(set) {
	try {
		const arr = Array.from(set);
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));
	} catch (e) {
		console.debug("saveFavoritesToStorage error:", e);
	}
}

export function useFavorites() {
	const [favorites, setFavorites] = useState(() => loadFavoritesFromStorage());

	useEffect(() => {
		function onStorage(e) {
			if (e.key === FAVORITES_KEY) setFavorites(loadFavoritesFromStorage());
		}
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const isFavorite = (id) => favorites.has(String(id));

	const toggleFavorite = (id) => {
		const key = String(id);
		setFavorites((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			saveFavoritesToStorage(next);
			return next;
		});
	};

	return { favorites, isFavorite, toggleFavorite };
}
