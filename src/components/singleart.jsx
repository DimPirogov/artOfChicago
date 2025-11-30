import React from "react";
import { useParams, Link } from "react-router-dom";
import "./startpage.css";
import "./singleart.css";
import { useArt, iiifImageUrl, useFavorites } from "../hooks/useArtApi";

const SingleArt = () => {
	const { id } = useParams();
	const { art, loading, error } = useArt(id);

	const { isFavorite, toggleFavorite } = useFavorites();

	if (loading) return <div className="startpage-loading">Loading...</div>;
	if (error) return <div className="startpage-error">Error: {error}</div>;
	if (!art) return <div className="startpage-error">Artwork not found</div>;

	return (
		<main className="startpage-container">
			<Link to="/" className="startpage-back">
				← Back to list
			</Link>
			<h1 className="startpage-title">
				{art.title}
				<button
					className="favorite-btn"
					onClick={() => toggleFavorite(art.id)}
					aria-pressed={isFavorite(art.id)}
					title={isFavorite(art.id) ? "Remove favorite" : "Add favorite"}
					style={{ marginLeft: "12px", verticalAlign: "middle" }}
				>
					<span
						className={`favorite-icon ${isFavorite(art.id) ? "active" : ""}`}
					>
						♥
					</span>
				</button>
			</h1>
			<div className="singleart-layout">
				{art.image_id ? (
					<img
						src={iiifImageUrl(art.image_id, 1200)}
						alt={art.title}
						className="singleart-image"
					/>
				) : (
					<div className="startpage-no-image">No image</div>
				)}

				<div className="singleart-info">
					<div>
						<strong>Artist:</strong> {art.artist_title || "Unknown"}
					</div>
					<div>
						<strong>Date:</strong> {art.date_display || "—"}
					</div>
					<div>
						<strong>Medium:</strong> {art.medium_display || "—"}
					</div>
					<div>
						<strong>Dimensions:</strong> {art.dimensions || "—"}
					</div>
					<div>
						<strong>Credit:</strong> {art.credit_line || "—"}
					</div>
				</div>
			</div>
		</main>
	);
};

export default SingleArt;
