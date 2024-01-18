import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import AstroView from "./AstroView";
import { Sun, Moon } from "lucide-react";

function MainView() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("");
  const [showAstroView, setShowAstroView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });

  const handleSearch = async () => {
    setTarget(query);
  };

  const toggleAstroView = () => {
    setShowAstroView(!showAstroView);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode");
  };

  const handleMouseMove = useCallback((event) => {
    setSpotlightPosition({ x: event.clientX, y: event.clientY });
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div className="App">
      <div
        className="spotlight"
        style={{
          left: `${spotlightPosition.x}px`,
          top: `${spotlightPosition.y}px`,
        }}
      />
      <Header query={query} setQuery={setQuery} handleSearch={handleSearch} />
      <div className="content">{/* Main content, search results, etc. */}</div>
      <button className="astroview-toggle" onClick={toggleAstroView}>
        {showAstroView ? "Hide AstroView" : "Show AstroView"}
      </button>
      {showAstroView && (
        <div className="astroview-container">
          <AstroView target={target} />
        </div>
      )}
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </div>
  );
}

export default MainView;
