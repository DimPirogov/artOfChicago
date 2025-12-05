import React from "react";
import { Link } from "react-router-dom";
import "./startpage.css";
import {
	iiifImageUrl,
	useFavorites,
	useFavoriteArtworks,
} from "../hooks/useArtApi";

export default function Favorites() {
	const { favorites } = useFavorites();
	const { arts, loading, error } = useFavoriteArtworks(favorites);

	return (
		<main className="startpage-container">
      <Link to="/" className="startpage-back">
              ← Back to list
            </Link>
			<h1 className="startpage-title">Favorites</h1>

			{error && <div className="startpage-error">Error: {error}</div>}
			{loading && <div className="startpage-loading">Loading favorites…</div>}

			{!loading && !error && arts.length === 0 && (
				<div className="startpage-empty">No favorites yet.</div>
			)}

			{!loading && !error && arts.length > 0 && (
				<div className="startpage-grid">
					{arts.map((art) => (
						<Link
							to={`/art/${art.id}`}
							key={art.id}
							className="startpage-card-link"
						>
							<article className="startpage-card">
								{art.image_id ? (
									<img
										src={iiifImageUrl(art.image_id, 600)}
										alt={art.title || "Artwork image"}
										className="startpage-image"
										onError={(ev) => {
											const t = art.thumbnail?.lqip || art.thumbnail?.url;
											if (t) ev.currentTarget.src = t;
										}}
									/>
								) : (
									<div className="startpage-no-image">No image</div>
								)}
								<div className="startpage-meta">
									<strong className="startpage-art-title">{art.title}</strong>
									<div className="startpage-artist">{art.artist_title}</div>
									<div className="startpage-date">{art.date_display}</div>
								</div>
							</article>
						</Link>
					))}
				</div>
			)}
		</main>
	);
}
