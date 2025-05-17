export function toggleTheme() {
  // pull your user object out of localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user._id) return;                       // if nobody’s signed in, do nothing

  // look up this user’s stored theme (fall back to "light")
  const currentTheme = localStorage.getItem(`theme_${user._id}`) || "light";
  const newTheme     = currentTheme === "light" ? "dark" : "light";

  // save back to their own slot
  localStorage.setItem(`theme_${user._id}`, newTheme);

  // actually flip the class on <body>
  document.body.classList.toggle("dark-theme", newTheme === "dark");
}

const ThemeToggle = () => null;

export default ThemeToggle;
