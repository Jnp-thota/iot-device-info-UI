import { devicesApi, timeSeriesApi } from './awsApiService';

const applyClientSideOperations = (data, { 
  filterModel = {}, 
  sortModel = [], 
  paginationModel = { page: 0, pageSize: 10 }
}) => {
  // Filtering
  let filteredData = [...data];
  if (filterModel?.items?.length) {
    filteredData = filteredData.filter(item => {
      return filterModel.items.every(filter => {
        if (!filter.field || filter.value == null) return true;
        const itemValue = item[filter.field];
        const filterValue = filter.value.toString().toLowerCase();
        
        switch (filter.operator) {
          case 'contains': return String(itemValue).toLowerCase().includes(filterValue);
          // eslint-disable-next-line eqeqeq
          case 'equals': return itemValue == filter.value;
          case 'startsWith': return String(itemValue).toLowerCase().startsWith(filterValue);
          case 'endsWith': return String(itemValue).toLowerCase().endsWith(filterValue);
          case '>': return itemValue > filter.value;
          case '<': return itemValue < filter.value;
          default: return true;
        }
      });
    });
  }

  // Sorting
  if (sortModel?.length) {
    filteredData.sort((a, b) => {
      for (const sort of sortModel) {
        if (a[sort.field] < b[sort.field]) return sort.sort === 'asc' ? -1 : 1;
        if (a[sort.field] > b[sort.field]) return sort.sort === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination
  const start = paginationModel.page * paginationModel.pageSize;
  const end = start + paginationModel.pageSize;
  
  return {
    items: filteredData.slice(start, end),
    itemCount: filteredData.length
  };
};

const processTimeSeriesData = (data) => {
  return data.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp).toISOString()
  }));
};

export const devicesDataSource = {
  fields: [
    { field: 'device_id', headerName: 'Device ID', flex: 1 },
    { field: 'building_name', headerName: 'Building', flex: 1 },
    { field: 'floor', headerName: 'Floor', type: 'number', flex: 1 },
    { field: 'zone', headerName: 'Zone', flex: 1 },
    { field: 'room_name', headerName: 'Room', flex: 1 },
    { field: 'user_notes', headerName: 'Notes', flex: 1 },
    { field: 'room_type', headerName: 'Room Type', flex: 1 },
  ],
  
  getMany: async (params) => {
    try {
      const allDevices = await devicesApi.getAll();
      return applyClientSideOperations(allDevices, params);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      return { items: [], itemCount: 0 };
    }
  },

  getOne: async (deviceId) => {
    try {
      const device = await devicesApi.getOne(deviceId);
      return { id: device.id || device.device_id, ...device };
    } catch (error) {
      console.error(`Failed to fetch device ${deviceId}:`, error);
      throw error;
    }
  },

  createOne: async (data) => {
    try {
      // Remove id before sending to API
      const { id, ...apiData } = data;
      const result = await devicesApi.create(apiData);
      return { id: result.id || result.device_id, ...result };
    } catch (error) {
      console.error('Failed to create device:', error);
      throw error;
    }
  },

  updateOne: async (deviceId, data) => {
    try {
      // Remove id before sending to API
      const { id, ...apiData } = data;
      const result = await devicesApi.update(deviceId, apiData);
      return { id: result.id || result.device_id, ...result };
    } catch (error) {
      console.error(`Failed to update device ${deviceId}:`, error);
      throw error;
    }
  },

  deleteOne: async (deviceId) => {
    try {
      await devicesApi.delete(deviceId);
    } catch (error) {
      console.error(`Failed to delete device ${deviceId}:`, error);
      throw error;
    }
  },

  validate: (formValues) => {
    const issues = [];
    if (!formValues.device_id) issues.push({ message: 'Device ID is required', path: ['device_id'] });
    if (!formValues.building_name) issues.push({ message: 'Building name is required', path: ['building_name'] });
    if (!formValues.room_name) issues.push({ message: 'Room name is required', path: ['room_name'] });
    return { issues };
  },
};

export const timeSeriesDataSource = {
  fields: [
    { field: 'timestamp', headerName: 'Timestamp', flex: 1, type: 'dateTime' },
    { field: 'temperature', headerName: 'Temperature (°C)', type: 'number', flex: 1 },
    { field: 'humidity', headerName: 'Humidity (%)', type: 'number', flex: 1 },
    { field: 'pressure', headerName: 'Pressure (hPa)', type: 'number', flex: 1 },
    { field: 'co2', headerName: 'CO2 (ppm)', type: 'number', flex: 1 },
  ],

  getMany: async ({ deviceId, paginationModel = { page: 0, pageSize: 10 }, ...params }) => {
    try {
      const response = await timeSeriesApi.getByDevice(deviceId);
      const processedData = processTimeSeriesData(response);
      return applyClientSideOperations(processedData, { 
        ...params,
        paginationModel
      });
    } catch (error) {
      console.error(`Failed to fetch time series for device ${deviceId}:`, error);
      return { items: [], itemCount: 0 };
    }
  },

  createOne: async (deviceId, data) => {
    try {
      // Remove id before sending to API
      const { id, ...apiData } = data;
      const result = await timeSeriesApi.create({ 
        ...apiData, 
        device_id: deviceId,
        timestamp: new Date(data.timestamp).toISOString()
      });
      return { 
        id: result.id || `${deviceId}-${new Date(result.timestamp).getTime()}`,
        ...result 
      };
    } catch (error) {
      console.error('Failed to create time series entry:', error);
      throw error;
    }
  },

  updateOne: async (id, data) => {
    try {
      // Remove id before sending to API
      const { id: _, ...apiData } = data;
      return await timeSeriesApi.update(id, apiData);
    } catch (error) {
      console.error(`Failed to update time series entry ${id}:`, error);
      throw error;
    }
  },

  deleteOne: async (id) => {
    try {
      await timeSeriesApi.delete(id);
    } catch (error) {
      console.error(`Failed to delete time series entry ${id}:`, error);
      throw error;
    }
  },
};