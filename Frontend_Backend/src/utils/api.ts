const API_BASE_URL = '/api'

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (response.status === 401) {
    window.location.href = '/login'
    return
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.message || error.error || 'API call failed')
  }

  return response.json()
}

export const makeAuthenticatedCall = async (
  getToken: () => Promise<string | null>,
  endpoint: string, 
  options: RequestInit = {}
) => {
  return apiCall(endpoint, options)
}

