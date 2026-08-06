import { useState } from "react";
import SearchBar from "./SearchBar.jsx";
import ModelCards from "./display_cards.jsx";

export default function App() {
  const [searchStarted, setSearchStarted] = useState(false);

  return (
    <div className="main-container">
      <SearchBar setSearchStarted={setSearchStarted} />
      <ModelCards searchStarted={searchStarted} />
    </div>
  );
}