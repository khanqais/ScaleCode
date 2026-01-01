// Use internal Next.js API routes for Vercel deployment
const API_BASE_URL = '/api'

// Make authenticated API calls using NextAuth's built-in authentication
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
    // Authentication required, redirect to login
    window.location.href = '/login'
    return
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.message || error.error || 'API call failed')
  }

  return response.json()
}

// Helper function for authenticated API calls (kept for backward compatibility)
export const makeAuthenticatedCall = async (
  getToken: () => Promise<string | null>,
  endpoint: string, 
  options: RequestInit = {}
) => {
  // Since we're using NextAuth's server-side auth with cookies, we don't need the token
  return apiCall(endpoint, options)
}

// // Example usage functions
// export const getProblems = async (getToken: () => Promise<string | null>) => {
//   return makeAuthenticatedCall(getToken, '/api/problems')
// }