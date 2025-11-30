import React from "react";
import { Link } from "react-router-dom";
import "./startpage.css";
import { useArtworks, iiifImageUrl, useFavorites } from "../hooks/useArtApi";

const Startpage = () => {
	const { artworks, loading, error } = useArtworks();
	const { isFavorite, toggleFavorite } = useFavorites();

	const handleToggleFavorite = (id, e) => {
		e.preventDefault();
		e.stopPropagation();
		toggleFavorite(id);
	};

	return (
		<main className="startpage-container">
			<h1 className="startpage-title">Art Institute — Artworks</h1>

			{error && <div className="startpage-error">Error: {error}</div>}
			{loading && <div className="startpage-loading">Loading artworks…</div>}

			{!loading && !error && (
				<div className="startpage-grid">
					{artworks.map((art) => (
						<Link
							to={`/art/${art.id}`}
							key={art.id}
							className="startpage-card-link"
						>
							<article className="startpage-card">
								{art.image_id ? (
									<>
										<button
											className="favorite-btn"
											aria-pressed={isFavorite(art.id)}
											onClick={(e) => handleToggleFavorite(art.id, e)}
											title={
												isFavorite(art.id) ? "Remove favorite" : "Add favorite"
											}
										>
											<span
												className={`favorite-icon ${
													isFavorite(art.id) ? "active" : ""
												}`}
											>
												♥
											</span>
										</button>
										<img
											src={iiifImageUrl(art.image_id, 600)}
											alt={art.title || "Artwork image"}
											className="startpage-image"
										/>
									</>
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
};

export default Startpage;
