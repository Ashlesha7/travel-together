import React, { useState, useEffect } from "react";

const ThemeToggle = () => {
  // Initialize theme from localStorage (default to 'light')
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Apply the theme class to the body element on mount and whenever theme changes
  useEffect(() => {
    document.body.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  const handleToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.classList.toggle("dark-theme", newTheme === "dark");
  };

  return (
    <button onClick={handleToggle}>
      Toggle {theme === "light" ? "Dark" : "Light"} Mode
    </button>
  );
};

export default ThemeToggle;
