import React, { useContext } from 'react';
import ThemeContext from './ThemeContext';
import { lightTheme, darkTheme } from './ThemeProvider';
function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  return (
    <button onClick={toggleTheme}>
      {theme === lightTheme ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
}

export default ThemeToggle;