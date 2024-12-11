import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import './SidePanel.css';

const SidePanel = () => {
  const tabs = [
    { label: 'Dashboard', path: '/' },
    { label: 'Invoice Management', path: '/invoice-management' },
    { label: 'Order Management', path: '/order-management' },
  ];

  return (
    <Drawer className="side-panel" variant="permanent">
      <List>
        {tabs.map((tab) => (
          <ListItem key={tab.label} disablePadding>
            <NavLink
              to={tab.path}
              className={({ isActive }) => (isActive ? 'selected' : '')}
              style={{ textDecoration: 'none', width: '100%' }}
            >
              <ListItemButton>
                <ListItemText primary={tab.label} />
              </ListItemButton>
            </NavLink>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SidePanel;