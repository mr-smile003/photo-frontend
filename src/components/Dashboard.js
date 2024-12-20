import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { CloudUpload, Images, User, Camera } from 'lucide-react';
import { ThemeContext } from '../ThemeContext';

const DashboardContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: ${props => props.theme === 'light' ? '#f8f9fa' : '#1a1a1a'};
  color: ${props => props.theme === 'light' ? '#333' : '#f0f0f0'};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Sidebar = styled.div`
  width: 250px;
  flex-shrink: 0; // Prevents shrinking of sidebar
  background-color: ${props => props.theme === 'light' ? '#fff' : '#2a2a2a'};
  color: ${props => props.theme === 'light' ? '#333' : '#f0f0f0'};
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: fixed; // Keeps sidebar in place
  height: 100vh;
  z-index: 2;
  transition: transform 0.3s ease;

  transform: ${props => (props.isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  @media (min-width: 768px) {
    transform: translateX(0);
  }
`;

const ContentWrapper = styled.div`
  margin-left: 250px; // Account for sidebar width
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: ${props => props.theme === 'light' ? '#f8f9fa' : '#1a1a1a'};
  transition: background-color 0.3s ease;
`;


const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 10px;
  color: inherit;
  text-decoration: none;
  margin-bottom: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover, &.active {
    background-color: ${props => props.theme === 'light' ? '#f0f0f0' : '#333'};
  }

  svg {
    margin-right: 10px;
  }
`;

const menuItems = [
  { name: 'Profile', path: '/', icon: User },
  { name: 'Upload', path: '/uploads', icon: CloudUpload },
  { name: 'Selfie Upload', path: '/selfie-upload', icon: Camera },
  { name: 'Events', path: '/events', icon: Images },
  // You can add more menu items as needed
];

const Dashboard = ({ children }) => {
  const location = useLocation();
  const { theme } = useContext(ThemeContext);

  return (
    <DashboardContainer theme={theme}>
      <Sidebar isOpen={false} theme={theme}>
        <h2 style={{ marginBottom: '20px' }}>Photo Frontend</h2>
        <nav>
          {menuItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={location.pathname === item.path ? 'active' : ''}
              theme={theme}
            >
              <item.icon />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </Sidebar>
      <ContentWrapper>
        {/* <Header theme={theme}>
          <ToggleSidebarButton 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            theme={theme}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </ToggleSidebarButton>
          <IconButton onClick={toggleTheme} theme={theme}>
            {theme === 'light' ? <Moon /> : <Sun />}
          </IconButton>
        </Header> */}
        <Content theme={theme}>
          {children}
        </Content>
      </ContentWrapper>
    </DashboardContainer>
  );
};

export default Dashboard;
