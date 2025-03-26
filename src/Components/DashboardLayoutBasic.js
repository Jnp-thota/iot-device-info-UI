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
import { Box, Tabs, Tab, Typography, Paper, Grid } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

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

// Sample devices data
let devicesStore = [
  { 
    id: "12345",
    device_id: "12345",
    building_name: "Main Office",
    floor: 2,
    zone: "North Wing",
    room_name: "Conference Room",
    user_notes: "Installed for monitoring",
    room_type: "Meeting Room"
  },
  { 
    id: "67890",
    device_id: "67890",
    building_name: "Research Lab",
    floor: 3,
    zone: "East Wing",
    room_name: "Lab A",
    user_notes: "Environmental monitoring",
    room_type: "Laboratory"
  }
];

// Sample time series data
let timeSeriesStore = [
  {
    id: "1",
    device_id: "12345",
    timestamp: "2025-03-24T14:30:00Z",
    temperature: 22.5,
    humidity: 60,
    pressure: 1013.25,
    co2: 450
  },
  {
    id: "2",
    device_id: "12345",
    timestamp: "2025-03-24T15:00:00Z",
    temperature: 23.1,
    humidity: 58,
    pressure: 1013.30,
    co2: 480
  },
  {
    id: "3",
    device_id: "12345",
    timestamp: "2025-03-24T15:30:00Z",
    temperature: 22.8,
    humidity: 59,
    pressure: 1013.20,
    co2: 490
  },
  {
    id: "4",
    device_id: "67890",
    timestamp: "2025-03-24T14:30:00Z",
    temperature: 21.2,
    humidity: 55,
    pressure: 1013.15,
    co2: 420
  },
  {
    id: "5",
    device_id: "67890",
    timestamp: "2025-03-24T15:00:00Z",
    temperature: 21.5,
    humidity: 56,
    pressure: 1013.10,
    co2: 430
  }
];

export const devicesDataSource = {
  fields: [
    { field: 'device_id', headerName: 'Device ID', flex: 1 },
    { field: 'building_name', headerName: 'Building', flex: 1 },
    { field: 'floor', headerName: 'Floor', type: 'number', flex: 1 },
    { field: 'zone', headerName: 'Zone', flex: 1 },
    { field: 'room_name', headerName: 'Room', flex: 1 },
    { field: 'room_type', headerName: 'Room Type', flex: 1 },
    { field: 'user_notes', headerName: 'Notes', flex: 1 },
  ],
  getMany: ({ paginationModel, filterModel, sortModel }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let processedDevices = [...devicesStore];

        if (filterModel?.items?.length) {
          filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) return;

            processedDevices = processedDevices.filter((device) => {
              const deviceValue = device[field];
              switch (operator) {
                case 'contains': return String(deviceValue).toLowerCase().includes(String(value).toLowerCase());
                case 'equals': return deviceValue === value;
                case 'startsWith': return String(deviceValue).toLowerCase().startsWith(String(value).toLowerCase());
                case 'endsWith': return String(deviceValue).toLowerCase().endsWith(String(value).toLowerCase());
                case '>': return deviceValue > value;
                case '<': return deviceValue < value;
                default: return true;
              }
            });
          });
        }

        if (sortModel?.length) {
          processedDevices.sort((a, b) => {
            for (const { field, sort } of sortModel) {
              if (a[field] < b[field]) return sort === 'asc' ? -1 : 1;
              if (a[field] > b[field]) return sort === 'asc' ? 1 : -1;
            }
            return 0;
          });
        }

        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        const paginatedDevices = processedDevices.slice(start, end);

        resolve({
          items: paginatedDevices,
          itemCount: processedDevices.length,
        });
      }, 750);
    });
  },
  getOne: (deviceId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const deviceToShow = devicesStore.find((device) => device.id === deviceId);
        deviceToShow ? resolve(deviceToShow) : reject(new Error('Device not found'));
      }, 750);
    });
  },
  createOne: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDevice = { 
          id: String(Math.floor(Math.random() * 100000)), 
          device_id: String(Math.floor(Math.random() * 100000)),
          ...data 
        };
        devicesStore = [...devicesStore, newDevice];
        resolve(newDevice);
      }, 750);
    });
  },
  updateOne: (deviceId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedDevice = null;
        devicesStore = devicesStore.map((device) => {
          if (device.id === deviceId) {
            updatedDevice = { ...device, ...data };
            return updatedDevice;
          }
          return device;
        });
        updatedDevice ? resolve(updatedDevice) : reject(new Error('Device not found'));
      }, 750);
    });
  },
  deleteOne: (deviceId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        devicesStore = devicesStore.filter((device) => device.id !== deviceId);
        resolve();
      }, 750);
    });
  },
  validate: (formValues) => {
    let issues = [];
    if (!formValues.device_id) issues.push({ message: 'Device ID is required', path: ['device_id'] });
    if (!formValues.building_name) issues.push({ message: 'Building name is required', path: ['building_name'] });
    if (!formValues.room_name) issues.push({ message: 'Room name is required', path: ['room_name'] });
    return { issues };
  },
};

export const timeSeriesDataSource = {
  fields: [
    { field: 'timestamp', headerName: 'Timestamp', flex: 1 },
    { field: 'temperature', headerName: 'Temperature (°C)', type: 'number', flex: 1 },
    { field: 'humidity', headerName: 'Humidity (%)', type: 'number', flex: 1 },
    { field: 'pressure', headerName: 'Pressure (hPa)', type: 'number', flex: 1 },
    { field: 'co2', headerName: 'CO2 (ppm)', type: 'number', flex: 1 },
  ],
  getMany: ({ deviceId }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deviceTimeSeries = timeSeriesStore.filter(ts => ts.device_id === deviceId);
        resolve({
          items: deviceTimeSeries,
          itemCount: deviceTimeSeries.length,
        });
      }, 750);
    });
  },
  createOne: (deviceId, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTimeSeries = { 
          id: String(Math.floor(Math.random() * 100000)),
          device_id: deviceId, 
          ...data 
        };
        timeSeriesStore = [...timeSeriesStore, newTimeSeries];
        resolve(newTimeSeries);
      }, 750);
    });
  },
  updateOne: (id, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedTimeSeries = null;
        timeSeriesStore = timeSeriesStore.map((ts) => {
          if (ts.id === id) {
            updatedTimeSeries = { ...ts, ...data };
            return updatedTimeSeries;
          }
          return ts;
        });
        updatedTimeSeries ? resolve(updatedTimeSeries) : reject(new Error('Time series entry not found'));
      }, 750);
    });
  },
  deleteOne: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        timeSeriesStore = timeSeriesStore.filter((ts) => ts.id !== id);
        resolve();
      }, 750);
    });
  },
};

const devicesCache = new DataSourceCache();

function matchPath(pattern, pathname) {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function DeviceMetricsSummary({ deviceId }) {
  const [metrics, setMetrics] = React.useState(null);

  React.useEffect(() => {
    timeSeriesDataSource.getMany({ deviceId }).then((result) => {
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
    });
  }, [deviceId]);

  if (!metrics) return <Typography>Loading metrics...</Typography>;

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
  const chartOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: true
      },
      toolbar: {
        show: true
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    markers: {
      size: 4
    },
    xaxis: {
      type: 'datetime',
      categories: data.map(item => item.timestamp),
      labels: {
        formatter: function(value) {
          return new Date(value).toLocaleString();
        }
      }
    },
    yaxis: [
      {
        title: {
          text: 'Temperature (°C)'
        },
      },
      {
        opposite: true,
        title: {
          text: 'Humidity (%)'
        }
      },
      {
        title: {
          text: 'Pressure (hPa)'
        }
      },
      {
        opposite: true,
        title: {
          text: 'CO2 (ppm)'
        }
      }
    ],
    tooltip: {
      x: {
        format: 'dd MMM yyyy HH:mm'
      },
      shared: true,
      intersect: false
    },
    legend: {
      position: 'top'
    }
  };

  const chartSeries = [
    {
      name: 'Temperature',
      type: 'line',
      data: data.map(item => ({
        x: item.timestamp,
        y: item.temperature
      }))
    },
    {
      name: 'Humidity',
      type: 'line',
      data: data.map(item => ({
        x: item.timestamp,
        y: item.humidity
      }))
    },
    {
      name: 'Pressure',
      type: 'line',
      data: data.map(item => ({
        x: item.timestamp,
        y: item.pressure
      }))
    },
    {
      name: 'CO2',
      type: 'line',
      data: data.map(item => ({
        x: item.timestamp,
        y: item.co2
      }))
    }
  ];

  return (
    <ReactApexChart
      options={chartOptions}
      series={chartSeries}
      type="line"
      height={350}
    />
  );
}

function DeviceDetailView({ deviceId }) {
  const [tabValue, setTabValue] = React.useState(0);
  const [timeSeriesData, setTimeSeriesData] = React.useState([]);
  const [deviceDetails, setDeviceDetails] = React.useState(null);

  React.useEffect(() => {
    // Load device details
    devicesDataSource.getOne(deviceId).then(setDeviceDetails);
    
    // Load time series data
    timeSeriesDataSource.getMany({ deviceId }).then((result) => {
      setTimeSeriesData(result.items);
    });
  }, [deviceId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!deviceDetails) return <Typography>Loading device details...</Typography>;

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
            <Typography>No time series data available for this device</Typography>
          )}
        </Box>
        
        <Crud
          dataSource={{
            ...timeSeriesDataSource,
            getMany: () => timeSeriesDataSource.getMany({ deviceId }),
            createOne: (data) => timeSeriesDataSource.createOne(deviceId, data),
          }}
          rootPath="/devices"
          mode="list"
          hideToolbar={false}
        />
      </TabPanel>
    </Box>
  );
}

function CrudBasic(props) {
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
              rootPath="/devices"
              initialPageSize={10}  
              defaultValues={{ 
                device_id: 'NEW-DEVICE',
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

CrudBasic.propTypes = {
  window: PropTypes.func,
};

export default CrudBasic;
