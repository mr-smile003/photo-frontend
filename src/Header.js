import React, { useContext } from 'react';
import ThemeContext from './ThemeContext';

function Header() {
  const { theme } = useContext(ThemeContext);

  return (
    <header className="header" style={{ backgroundColor: theme.secondaryColor, color: theme.textColor }}>
      {/* Header content */}
    </header>
  );
}

export default Header;