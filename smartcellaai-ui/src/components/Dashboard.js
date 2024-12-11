import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <Box className="dashboard">
      <Typography variant="h4" className="dashboard-title">
        Welcome to the SmartCella.AI
      </Typography>

      <Box className="dashboard-cards">
        <Paper className="dashboard-card">
          <Typography variant="h6">Total Invoices</Typography>
          <Typography variant="h4">150</Typography>
        </Paper>

        <Paper className="dashboard-card">
          <Typography variant="h6">Total Orders</Typography>
          <Typography variant="h4">300</Typography>
        </Paper>

        <Paper className="dashboard-card">
          <Typography variant="h6">Pending Orders</Typography>
          <Typography variant="h4">45</Typography>
        </Paper>

        <Paper className="dashboard-card">
          <Typography variant="h6">Monthly Revenue</Typography>
          <Typography variant="h4">$25K</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;