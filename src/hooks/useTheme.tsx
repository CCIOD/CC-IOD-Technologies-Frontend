import { useEffect, useState } from "react";

type TypeTheme = "light" | "dark";
const getInitialTheme = (): TypeTheme => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useTheme = () => {
  const initialTheme = getInitialTheme();
  const [theme, setTheme] = useState<TypeTheme>(initialTheme);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const element = document.querySelector("html");
    theme === "dark"
      ? element?.classList.add("dark")
      : element?.classList.remove("dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  return { theme, toggleTheme };
};
