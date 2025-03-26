import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import SensorsIcon from '@mui/icons-material/Sensors';
import TimelineIcon from '@mui/icons-material/Timeline';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Crud, DataSourceCache } from '@toolpad/core/Crud';
import { useDemoRouter } from '@toolpad/core/internal';
import { Box, Tabs, Tab, Typography, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { devicesDataSource, timeSeriesDataSource } from './dataSources';

const NAVIGATION = [
  {
    segment: 'devices',
    title: 'IoT Sensor Devices',
    icon: <SensorsIcon />,
    pattern: 'devices{/:deviceId}*',
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

const devicesCache = new DataSourceCache();

function matchPath(pattern, pathname) {
  const reservedWords = ['new'];
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);

  if (match) {
    const param = match[1];
    if (reservedWords.includes(param)) return null;
    return param;
  }
  return null;
}

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function DeviceMetricsSummary({ deviceId }) {
  const [metrics, setMetrics] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const result = await timeSeriesDataSource.getMany({ deviceId });
        if (result.items.length > 0) {
          const latest = result.items[result.items.length - 1];
          setMetrics({
            temperature: latest.temperature,
            humidity: latest.humidity,
            pressure: latest.pressure,
            co2: latest.co2,
            lastUpdated: new Date(latest.timestamp).toLocaleString()
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [deviceId]);

  if (loading) return <CircularProgress size={24} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!metrics) return <Typography>No metrics available</Typography>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Temperature</Typography>
          <Typography variant="h4">{metrics.temperature} °C</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Humidity</Typography>
          <Typography variant="h4">{metrics.humidity} %</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Pressure</Typography>
          <Typography variant="h4">{metrics.pressure} hPa</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">CO2</Typography>
          <Typography variant="h4">{metrics.co2} ppm</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="caption" display="block" gutterBottom>
          Last updated: {metrics.lastUpdated}
        </Typography>
      </Grid>
    </Grid>
  );
}

function TimeSeriesChart({ data }) {
  const chartData = data.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp)
  }));

  const chartOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: { enabled: true },
      toolbar: { show: true }
    },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 4 },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: function(value) {
          return new Date(value).toLocaleString();
        }
      }
    },
    yaxis: [
      { title: { text: 'Temperature (°C)' } },
      { opposite: true, title: { text: 'Humidity (%)' } },
      { title: { text: 'Pressure (hPa)' } },
      { opposite: true, title: { text: 'CO2 (ppm)' } }
    ],
    tooltip: {
      x: { format: 'dd MMM yyyy HH:mm' },
      shared: true,
      intersect: false
    },
    legend: { position: 'top' }
  };

  const chartSeries = [
    { 
      name: 'Temperature', 
      data: chartData.map(item => ({
        x: item.timestamp,
        y: item.temperature
      })) 
    },
    { 
      name: 'Humidity', 
      data: chartData.map(item => ({
        x: item.timestamp,
        y: item.humidity
      })) 
    },
    { 
      name: 'Pressure', 
      data: chartData.map(item => ({
        x: item.timestamp,
        y: item.pressure
      })) 
    },
    { 
      name: 'CO2', 
      data: chartData.map(item => ({
        x: item.timestamp,
        y: item.co2
      })) 
    }
  ];

  return <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} />;
}

function DeviceDetailView({ deviceId }) {
  const [tabValue, setTabValue] = React.useState(0);
  const [timeSeriesData, setTimeSeriesData] = React.useState([]);
  const [deviceDetails, setDeviceDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [device, timeSeries] = await Promise.all([
          devicesDataSource.getOne(deviceId),
          timeSeriesDataSource.getMany({ 
            deviceId,
            paginationModel: { page: 0, pageSize: 10 }
          })
        ]);
        setDeviceDetails(device);
        setTimeSeriesData(timeSeries.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [deviceId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {deviceDetails.room_name} ({deviceDetails.device_id})
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {deviceDetails.building_name}, Floor {deviceDetails.floor}, {deviceDetails.zone}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {deviceDetails.user_notes}
        </Typography>
        <DeviceMetricsSummary deviceId={deviceId} />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Details" icon={<SensorsIcon />} />
          <Tab label="Time Series Data" icon={<TimelineIcon />} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Crud
          dataSource={devicesDataSource}
          dataSourceCache={devicesCache}
          getRowId={(row) => row.id || row.device_id}
          rootPath="/devices"
          mode="detail"
          id={deviceId}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 4 }}>
          {timeSeriesData.length > 0 ? (
            <TimeSeriesChart data={timeSeriesData} />
          ) : (
            <Typography>No time series data available</Typography>
          )}
        </Box>
        
        <Crud
          dataSource={{
            ...timeSeriesDataSource,
            getMany: (params) => timeSeriesDataSource.getMany({ 
              deviceId,
              ...params,
              paginationModel: params.paginationModel || { page: 0, pageSize: 10 }
            }),
            createOne: (data) => timeSeriesDataSource.createOne(deviceId, data),
          }}
          getRowId={(row) => row.id || `${deviceId}-${new Date(row.timestamp).getTime()}`}
          rootPath="/devices"
          mode="list"
          hideToolbar={false}
          initialPageSize={10}
        />
      </TabPanel>
    </Box>
  );
}

export default function Dashboard(props) {
  const { window } = props;
  const router = useDemoRouter('/devices');
  const demoWindow = window !== undefined ? window() : undefined;

  const title = React.useMemo(() => {
    if (router.pathname === '/devices/new') return 'New Device';
    const editDeviceId = matchPath('/devices/:deviceId/edit', router.pathname);
    if (editDeviceId) return `Device ${editDeviceId} - Edit`;
    const showDeviceId = matchPath('/devices/:deviceId', router.pathname);
    if (showDeviceId) return `Device ${showDeviceId}`;
    return 'IoT Devices Dashboard';
  }, [router.pathname]);

  const deviceId = matchPath('/devices/:deviceId', router.pathname) || 
                   matchPath('/devices/:deviceId/edit', router.pathname);

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme} window={demoWindow}>
      <DashboardLayout defaultSidebarCollapsed>
        <PageContainer title={title}>
          {deviceId ? (
            <DeviceDetailView deviceId={deviceId} />
          ) : (
            <Crud
              dataSource={devicesDataSource}
              dataSourceCache={devicesCache}
              getRowId={(row) => row.id || row.device_id}
              rootPath="/devices"
              initialPageSize={10}
              disableServerPagination={true}
              disableServerFiltering={true}
              disableServerSorting={true}
              defaultValues={{ 
                device_id: 1111,
                building_name: 'Main Office',
                floor: 1,
                zone: 'Main Zone',
                room_type: 'Office'
              }}
            />
          )}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

Dashboard.propTypes = {
  window: PropTypes.func,
};