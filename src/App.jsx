import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Startpage from "./components/startpage";
import SingleArt from "./components/singleart";
import Favorites from "./components/favorites";
import NotFound from "./components/NotFound";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Startpage />} />
				<Route path="/art/:id" element={<SingleArt />} />
				<Route path="/favorites" element={<Favorites />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
