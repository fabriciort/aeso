import React, { useState, useEffect } from "react";
import Header from "./Header";
import AstroView from "./AstroView";
import { Sun, Moon } from "lucide-react";

function MainView() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("");
  const [showAstroView, setShowAstroView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSearch = () => {
    setTarget(query);
  };

  const toggleAstroView = () => {
    setShowAstroView(!showAstroView);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode");
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAstroView(false);
    }
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showAstroView) {
        setShowAstroView(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showAstroView]);

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="background-gradient"></div>
      <Header query={query} setQuery={setQuery} handleSearch={handleSearch} />
      <main className="content">
        <div className="glass-card">
          <h2>Welcome to MAST Viewer</h2>
          <p>Explore the cosmos with our advanced tools and data.</p>
        </div>
      </main>
      <button
        className="floating-button astroview-toggle"
        onClick={toggleAstroView}
      >
        {showAstroView ? "Hide AstroView" : "Show AstroView"}
      </button>
      {showAstroView && (
        <div className="astroview-overlay active" onClick={handleOverlayClick}>
          <div className="astroview-container glass-card">
            <AstroView target={target} />
          </div>
        </div>
      )}
      <button className="floating-button theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </div>
  );
}

export default MainView;
