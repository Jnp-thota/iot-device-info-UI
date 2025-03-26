const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://p2j8b8o7k0.execute-api.us-east-1.amazonaws.com/dev';

async function makeApiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export const devicesApi = {
  getAll: async () => {
    const data = await makeApiRequest('devices');
    return Array.isArray(data) 
      ? data.map(item => ({ 
          id: item.id || item.device_id,
          ...item 
        }))
      : data;
  },
  
  getOne: (id) => makeApiRequest(`devices/${id}`),
  
  create: (data) => {
    // Remove id from the request body if it exists
    const { id, ...requestData } = data;
    return makeApiRequest('devices', 'POST', requestData);
  },
  
  update: (id, data) => {
    // Remove id from the request body if it exists
    const { id: _, ...requestData } = data;
    return makeApiRequest(`devices/${id}`, 'PUT', requestData);
  },
  
  delete: (id) => makeApiRequest(`devices/${id}`, 'DELETE'),
};

export const timeSeriesApi = {
  getByDevice: async (deviceId) => {
    const data = await makeApiRequest(`timeseries?deviceId=${deviceId}`);
    return Array.isArray(data)
      ? data.map(item => ({
          id: item.id || `${deviceId}-${item.timestamp}`,
          ...item
        }))
      : data;
  },
  
  create: (data) => {
    // Remove id from the request body if it exists
    const { id, ...requestData } = data;
    return makeApiRequest('timeseries', 'POST', requestData);
  },
  
  update: (id, data) => {
    // Remove id from the request body if it exists
    const { id: _, ...requestData } = data;
    return makeApiRequest(`timeseries/${id}`, 'PUT', requestData);
  },
  
  delete: (id) => makeApiRequest(`timeseries/${id}`, 'DELETE'),
};