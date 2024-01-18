import React from "react";
import { Search } from "lucide-react";

function Header({ query, setQuery, handleSearch }) {
  return (
    <header className="glass-header">
      <h1>MAST Viewer</h1>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an object..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          <Search size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
