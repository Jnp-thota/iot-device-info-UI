import { devicesApi, timeSeriesApi } from './awsApiService';

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
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    try {
      const response = await devicesApi.getAll({ 
        pagination: paginationModel,
        filters: filterModel,
        sort: sortModel 
      });
      return {
        items: response.data || response,
        itemCount: response.totalCount || response.length || 0,
      };
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      return { items: [], itemCount: 0 };
    }
  },
  getOne: async (deviceId) => {
    try {
      return await devicesApi.getOne(deviceId);
    } catch (error) {
      console.error(`Failed to fetch device ${deviceId}:`, error);
      throw error;
    }
  },
  createOne: async (data) => {
    try {
      return await devicesApi.create(data);
    } catch (error) {
      console.error('Failed to create device:', error);
      throw error;
    }
  },
  updateOne: async (deviceId, data) => {
    try {
      return await devicesApi.update(deviceId, data);
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
    if (!formValues.device_id) {
      issues.push({ message: 'Device ID is required', path: ['device_id'] });
    }
    if (!formValues.building_name) {
      issues.push({ message: 'Building name is required', path: ['building_name'] });
    }
    if (!formValues.room_name) {
      issues.push({ message: 'Room name is required', path: ['room_name'] });
    }
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
  getMany: async ({ deviceId, paginationModel }) => {
    try {
      const response = await timeSeriesApi.getByDevice(deviceId, { 
        pagination: paginationModel 
      });
      return {
        items: response.data || response,
        itemCount: response.totalCount || response.length || 0,
      };
    } catch (error) {
      console.error(`Failed to fetch time series for device ${deviceId}:`, error);
      return { items: [], itemCount: 0 };
    }
  },
  createOne: async (deviceId, data) => {
    try {
      return await timeSeriesApi.create({ ...data, device_id: deviceId });
    } catch (error) {
      console.error('Failed to create time series entry:', error);
      throw error;
    }
  },
  updateOne: async (id, data) => {
    try {
      return await timeSeriesApi.update(id, data);
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