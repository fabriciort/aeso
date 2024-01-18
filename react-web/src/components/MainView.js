import React, { useState, useEffect, useCallback } from "react";
import { useSpring, animated } from "react-spring";
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

  const spotlightSpring = useSpring({
    left: spotlightPosition.x,
    top: spotlightPosition.y,
    config: { tension: 500, friction: 40 },
  });

  const astroViewSpring = useSpring({
    opacity: showAstroView ? 1 : 0,
    transform: showAstroView ? "translateY(0%)" : "translateY(100%)",
    config: { tension: 300, friction: 26 },
  });

  return (
    <div className="App">
      <animated.div className="spotlight" style={spotlightSpring} />
      <Header query={query} setQuery={setQuery} handleSearch={handleSearch} />
      <div className="content">{/* Main content, search results, etc. */}</div>
      <button className="astroview-toggle" onClick={toggleAstroView}>
        {showAstroView ? "Hide AstroView" : "Show AstroView"}
      </button>
      {showAstroView && (
        <animated.div className="astroview-container" style={astroViewSpring}>
          <AstroView target={target} />
        </animated.div>
      )}
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </div>
  );
}

export default MainView;
