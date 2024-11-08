import React, { useContext } from 'react';
import ThemeContext from './ThemeContext';

function MainContent() {
  const { theme } = useContext(ThemeContext);

  return (
    <main className="main-content" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
      {/* Main content */}
    </main>
  );
}

export default MainContent;