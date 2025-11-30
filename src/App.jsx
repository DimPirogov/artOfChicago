import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Startpage from "./components/startpage";
import SingleArt from "./components/singleart";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Startpage />} />
				<Route path="/art/:id" element={<SingleArt />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
