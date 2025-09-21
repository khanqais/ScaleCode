const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Make authenticated API calls using Clerk
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // This will be used from components where useAuth is available
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    window.location.href = '/login'
    return
  }

  return response.json()
}

// Helper function to make API calls with token from useAuth hook
export const makeAuthenticatedCall = async (
  getToken: () => Promise<string | null>,
  endpoint: string, 
  options: RequestInit = {}
) => {
  const token = await getToken()
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (response.status === 401) {
    window.location.href = '/login'
    return
  }

  return response.json()
}

// // Example usage functions
// export const getProblems = async (getToken: () => Promise<string | null>) => {
//   return makeAuthenticatedCall(getToken, '/api/problems')
// }