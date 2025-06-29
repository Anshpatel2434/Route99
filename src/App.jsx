import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage";
import Quant from "./Quant";
import Lrdi from "./Lrdi";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/quant" element={<Quant />} />
				<Route path="/lrdi" element={<Lrdi />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
