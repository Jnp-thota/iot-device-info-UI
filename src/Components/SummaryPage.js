import React from 'react';
import { Box, Typography } from '@mui/material';
import DeviceSummary from './deviceSummary';

function SummaryPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Device Distribution Summary
      </Typography>
      <DeviceSummary />
    </Box>
  );
}

export default SummaryPage;