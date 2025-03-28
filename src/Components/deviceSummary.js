import React from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
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

  // Chart 1: Buildings Distribution (Horizontal Bar)
  const buildingsChart = {
    series: [{
      data: summaryData.buildings.map(b => b.device_count)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: summaryData.buildings.map(b => b.building_name),
        title: {
          text: 'Number of Devices'
        }
      },
      colors: ['#3f51b5']
    }
  };

  // Chart 2: Floors Distribution (Donut)
  const floorsChart = {
    series: summaryData.floors.map(f => f.device_count),
    options: {
      chart: {
        type: 'donut',
      },
      labels: summaryData.floors.map(f => `Floor ${f.floor}`),
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      colors: ['#4caf50', '#ff9800', '#e91e63', '#00bcd4', '#9c27b0']
    }
  };

  // Chart 3: Room Types (Stacked Column)
  const roomTypesChart = {
    series: [{
      name: 'Devices',
      data: summaryData.room_types.map(r => r.device_count)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        stacked: true
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%',
        }
      },
      xaxis: {
        categories: summaryData.room_types.map(r => r.room_type),
        labels: {
          rotate: -45
        }
      },
      yaxis: {
        title: {
          text: 'Number of Devices'
        }
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#2196f3']
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }} elevation={3}>
            <Typography variant="h6">Total Devices</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>{totalDevices}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }} elevation={3}>
            <Typography variant="h6">Buildings</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>{summaryData.buildings.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }} elevation={3}>
            <Typography variant="h6">Floors</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>{summaryData.floors.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }} elevation={3}>
            <Typography variant="h6">Room Types</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>{summaryData.room_types.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Buildings Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Devices by Building
            </Typography>
            <ReactApexChart 
              options={buildingsChart.options} 
              series={buildingsChart.series} 
              type="bar" 
              height={350} 
            />
          </Paper>
        </Grid>

        {/* Floors Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Devices by Floor
            </Typography>
            <ReactApexChart 
              options={floorsChart.options} 
              series={floorsChart.series} 
              type="donut" 
              height={350} 
            />
          </Paper>
        </Grid>

        {/* Room Types Chart */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Devices by Room Type
            </Typography>
            <ReactApexChart 
              options={roomTypesChart.options} 
              series={roomTypesChart.series} 
              type="bar" 
              height={350} 
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceSummary;