import React from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { summaryApi } from './awsApiService';

const DeviceSummary = () => {
  const [summaryData, setSummaryData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadSummaryData = async () => {
      try {
        setLoading(true);
        const data = await summaryApi.getSummary();
        setSummaryData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummaryData();
  }, []);

  if (loading) return <CircularProgress size={24} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!summaryData) return <Typography>No summary data available</Typography>;

  // Calculate total devices
  const totalDevices = summaryData.buildings.reduce(
    (sum, building) => sum + building.device_count,
    0
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Device Distribution Summary
      </Typography>

      {/* Total Devices Card */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1">Total Devices</Typography>
            <Typography variant="h4">{totalDevices}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Buildings Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          By Building
        </Typography>
        <Grid container spacing={2}>
          {summaryData.buildings.map((building) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              lg={2}
              key={`building-${building.building_name}`}
            >
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {building.building_name}
                </Typography>
                <Typography variant="h5">{building.device_count}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Floors Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          By Floor
        </Typography>
        <Grid container spacing={2}>
          {summaryData.floors.map((floor) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              lg={2}
              key={`floor-${floor.floor}`}
            >
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Floor {floor.floor}
                </Typography>
                <Typography variant="h5">{floor.device_count}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Room Types Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          By Room Type
        </Typography>
        <Grid container spacing={2}>
          {summaryData.room_types.map((room) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              lg={2}
              key={`room-${room.room_type}`}
            >
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {room.room_type}
                </Typography>
                <Typography variant="h5">{room.device_count}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DeviceSummary;