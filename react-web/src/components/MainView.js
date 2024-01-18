import React, { useState } from "react";
import Header from "./Header";
import AstroView from "./AstroView";
import Sidebar from "./Sidebar";

function MainView() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("");
  const [showAstroView, setShowAstroView] = useState(false);

  const handleSearch = async () => {
    setTarget(query);
  };

  const toggleAstroView = () => {
    setShowAstroView(!showAstroView);
  };

  return (
    <div>
      <Header query={query} setQuery={setQuery} handleSearch={handleSearch} />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "20px" }}>
          {/* Conteúdo principal, resultados da pesquisa, etc. */}
        </div>
      </div>
      <button
        onClick={toggleAstroView}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {showAstroView ? "Hide AstroView" : "Show AstroView"}
      </button>
      {showAstroView && (
        <div className="astroview-container">
          <AstroView target={target} />
        </div>
      )}
    </div>
  );
}

export default MainView;
