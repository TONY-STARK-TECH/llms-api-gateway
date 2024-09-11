import { createContext, useCallback, useContext, useState } from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const SetThemeContext = createContext(null);
export const useSetTheme = () => useContext(SetThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, _setTheme] = useState(() => {
    try {
      return 'dark';
    } catch {
      return null;
    }
  });

  // default set to dark
  const body = document.body;
  body.setAttribute('theme-mode', 'dark');
  localStorage.setItem('theme-mode', 'dark');

  const setTheme = useCallback((input) => {
    _setTheme('dark');

    const body = document.body;
    body.setAttribute('theme-mode', 'dark');
    localStorage.setItem('theme-mode', 'dark');
  }, []);

  return (
    <SetThemeContext.Provider value={setTheme}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </SetThemeContext.Provider>
  );
};
