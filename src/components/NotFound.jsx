import React from "react";
import { Link } from "react-router-dom";
import "./startpage.css";

export default function NotFound() {
	return (
		<main className="startpage-container">
			<h1 className="startpage-title">404 — Page Not Found</h1>
			<p>The page you are looking for does not exist.</p>
			<p>
				<Link to="/" className="startpage-back">
					← Back to home
				</Link>
			</p>
		</main>
	);
}
