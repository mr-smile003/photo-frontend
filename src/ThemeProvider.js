import React, { useState } from 'react';
import ThemeContext from './ThemeContext';

export const lightTheme = {
  backgroundColor: '#fff',
  textColor: '#000',
  primaryColor: '#skyblue',
  secondaryColor: '#fff',
};

export const darkTheme = {
  backgroundColor: '#121212',
  textColor: '#fff',
  primaryColor: '#gray',
  secondaryColor: '#fff',
};

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(lightTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;