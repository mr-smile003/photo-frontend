import React, { useContext } from 'react';
import ThemeContext from './ThemeContext';

function Sidebar() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="sidebar" style={{ backgroundColor: theme.secondaryColor, color: theme.textColor }}>
      <ul>
        <li>Dashboard</li>
        <li>Analytics</li>
        <li>Settings</li>
        <li>Help</li>
      </ul>
    </div>
  );
}

export default Sidebar;