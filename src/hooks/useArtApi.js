import { useEffect, useState } from "react";

// Helper to return an image URL. Accepts either a full URL (from other APIs)
// or an IIIF image id (from the Art Institute); if it's a URL we return it
// directly, otherwise we build an IIIF URL.
export const iiifImageUrl = (image_id, width = 400) => {
	if (!image_id) return null;
	try {
		new URL(image_id);
		return image_id; // already a URL
	} catch (err) {
		// reference the caught error so tooling doesn't mark it unused
		void err;
		// not a URL — treat as IIIF id
		return `https://www.artic.edu/iiif/2/${image_id}/full/${width},/0/default.jpg`;
	}
};

export function useArtworks(options = {}) {
	const { limit = 12, query = "painting", includeNoImage = false } = options;
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
				// Search The Met Collection API for objects that have images.
				const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(
					query
				)}`;
				const sres = await fetch(searchUrl, { signal: controller.signal });
				if (!sres.ok) throw new Error(`HTTP ${sres.status}`);
				const sjson = await sres.json();
				// fetch a larger slice of IDs so we can filter out objects
				// that don't have images and still end up with `limit` items.
				const candidateCount = Math.max(limit * 3, limit + 10);
				const ids = Array.isArray(sjson.objectIDs)
					? sjson.objectIDs.slice(0, candidateCount)
					: [];

				const promises = ids.map((id) =>
					fetch(
						`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
						{ signal: controller.signal }
					).then((r) => {
						if (!r.ok) throw new Error(`HTTP ${r.status}`);
						return r.json();
					})
				);

				const results = await Promise.all(promises);
				const mapped = results.map((o) => ({
					id: o.objectID,
					// store an actual image URL in `image_id` so components that expect
					// `iiifImageUrl(image_id)` still work (iiifImageUrl will detect URLs)
					image_id:
						o.primaryImage ||
						o.primaryImageSmall ||
						(o.additionalImages && o.additionalImages[0]) ||
						null,
					title: o.title,
					artist_title: o.artistDisplayName,
					date_display: o.objectDate,
					medium_display: o.medium,
					dimensions: o.dimensions,
					credit_line: o.creditLine,
					thumbnail: { url: o.primaryImageSmall },
				}));

				// Optionally filter out items with no image to avoid empty cards.
				const filtered = includeNoImage
					? mapped
					: mapped.filter((a) => !!a.image_id);
				// Trim to requested limit
				const finalList = filtered.slice(0, limit);
				if (isMounted) setArtworks(finalList || []);
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
	}, [limit, query, includeNoImage]);

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
				// Use The Met Museum API for object details
				const res = await fetch(
					`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
					{ signal: controller.signal }
				);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const o = await res.json();
				const mapped = {
					id: o.objectID,
					image_id:
						o.primaryImage ||
						o.primaryImageSmall ||
						(o.additionalImages && o.additionalImages[0]) ||
						null,
					title: o.title,
					artist_title: o.artistDisplayName,
					date_display: o.objectDate,
					medium_display: o.medium,
					dimensions: o.dimensions,
					credit_line: o.creditLine,
					thumbnail: { url: o.primaryImageSmall },
				};
				if (isMounted) setArt(mapped);
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
				// Fetch details for favorite IDs from The Met API and map to our shape
				const promises = ids.map((id) =>
					fetch(
						`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
						{ signal: controller.signal }
					).then((res) => {
						if (!res.ok) throw new Error(`HTTP ${res.status}`);
						return res.json();
					})
				);

				const results = await Promise.all(promises);
				const data = results.map((o) => ({
					id: o.objectID,
					image_id:
						o.primaryImage ||
						o.primaryImageSmall ||
						(o.additionalImages && o.additionalImages[0]) ||
						null,
					title: o.title,
					artist_title: o.artistDisplayName,
					date_display: o.objectDate,
					thumbnail: { url: o.primaryImageSmall },
				}));
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
