import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeProvider } from './ThemeContext';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Users from './components/Users';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Events from './components/Events';
import Gallery from './components/Gallary';
import Profile from './components/Profile';
import EventFolders from './components/EventFolders';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  color: ${props => props.theme === 'light' ? '#333' : '#fff'};
  background-color: ${props => props.theme === 'light' ? '#f4f4f4' : '#333'};
`;

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContainer>
          <Dashboard>
            <Routes>
              <Route path='/' element={<Profile />}/>
              <Route path="/uploads" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/folders" element={<EventFolders />} />
              <Route path="/event-gallary" element={<Gallery />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Dashboard>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;