const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://p2j8b8o7k0.execute-api.us-east-1.amazonaws.com/dev/';

// Helper function for making API requests
async function makeApiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    // Uncomment if using API keys
    // 'x-api-key': process.env.REACT_APP_API_KEY,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': 'http://localhost:3000/',
    'Access-Control-Allow-Methods': 'GET'
  };

  // Uncomment if using AWS Cognito authentication
  // const session = await Auth.currentSession();
  // headers['Authorization'] = `Bearer ${session.getIdToken().getJwtToken()}`;

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

// Devices API
export const devicesApi = {
  getAll: async ({ pagination, filters, sort }) => {
    const params = new URLSearchParams();
    if (pagination) {
      params.append('page', pagination.page);
      params.append('size', pagination.pageSize);
    }
    // Add filters and sort parameters if your API supports them
    return makeApiRequest(`devices?${params.toString()}`);
  },
  getOne: (id) => makeApiRequest(`devices/${id}`),
  create: (data) => makeApiRequest('devices', 'POST', data),
  update: (id, data) => makeApiRequest(`devices/${id}`, 'PUT', data),
  delete: (id) => makeApiRequest(`devices/${id}`, 'DELETE'),
};

// Time Series API
export const timeSeriesApi = {
  getByDevice: async (deviceId, { pagination } = {}) => {
    const params = new URLSearchParams({ deviceId });
    if (pagination) {
      params.append('page', pagination.page);
      params.append('size', pagination.pageSize);
    }
    return makeApiRequest(`timeseries?${params.toString()}`);
  },
  create: (data) => makeApiRequest('timeseries', 'POST', data),
  update: (id, data) => makeApiRequest(`timeseries/${id}`, 'PUT', data),
  delete: (id) => makeApiRequest(`timeseries/${id}`, 'DELETE'),
};