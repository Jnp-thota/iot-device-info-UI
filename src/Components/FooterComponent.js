import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import SensorsIcon from '@mui/icons-material/Sensors';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Crud, DataSourceCache } from '@toolpad/core/Crud';
import { useDemoRouter } from '@toolpad/core/internal';

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

        // Apply filters (demo only)
        if (filterModel?.items?.length) {
          filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
              return;
            }

            processedDevices = processedDevices.filter((device) => {
              const deviceValue = device[field];

              switch (operator) {
                case 'contains':
                  return String(deviceValue)
                    .toLowerCase()
                    .includes(String(value).toLowerCase());
                case 'equals':
                  return deviceValue === value;
                case 'startsWith':
                  return String(deviceValue)
                    .toLowerCase()
                    .startsWith(String(value).toLowerCase());
                case 'endsWith':
                  return String(deviceValue)
                    .toLowerCase()
                    .endsWith(String(value).toLowerCase());
                case '>':
                  return deviceValue > value;
                case '<':
                  return deviceValue < value;
                default:
                  return true;
              }
            });
          });
        }

        // Apply sorting
        if (sortModel?.length) {
          processedDevices.sort((a, b) => {
            for (const { field, sort } of sortModel) {
              if (a[field] < b[field]) {
                return sort === 'asc' ? -1 : 1;
              }
              if (a[field] > b[field]) {
                return sort === 'asc' ? 1 : -1;
              }
            }
            return 0;
          });
        }

        // Apply pagination
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

        if (deviceToShow) {
          resolve(deviceToShow);
        } else {
          reject(new Error('Device not found'));
        }
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

        if (updatedDevice) {
          resolve(updatedDevice);
        } else {
          reject(new Error('Device not found'));
        }
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

    if (!formValues.device_id) {
      issues = [...issues, { message: 'Device ID is required', path: ['device_id'] }];
    }
    if (!formValues.building_name) {
      issues = [...issues, { message: 'Building name is required', path: ['building_name'] }];
    }
    if (!formValues.room_name) {
      issues = [...issues, { message: 'Room name is required', path: ['room_name'] }];
    }

    return { issues };
  },
};

const devicesCache = new DataSourceCache();

function matchPath(pattern, pathname) {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

function CrudBasic(props) {
  const { window } = props;

  const router = useDemoRouter('/devices');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const title = React.useMemo(() => {
    if (router.pathname === '/devices/new') {
      return 'New Device';
    }
    const editDeviceId = matchPath('/devices/:deviceId/edit', router.pathname);
    if (editDeviceId) {
      return `Device ${editDeviceId} - Edit`;
    }
    const showDeviceId = matchPath('/devices/:deviceId', router.pathname);
    if (showDeviceId) {
      return `Device ${showDeviceId}`;
    }

    return undefined;
  }, [router.pathname]);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <PageContainer title={title}>
          {/* preview-start */}
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
          {/* preview-end */}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}

CrudBasic.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default CrudBasic;