import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './Header.css';

const Header = () => {
  return (
    <AppBar position="fixed" className="header">
      <Toolbar>
        <Typography variant="h6">SmartCella.AI</Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
