import React from "react";

function Header({ query, setQuery, handleSearch }) {
  return (
    <header>
      <h1>MAST Viewer</h1>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an object..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
    </header>
  );
}

export default Header;
