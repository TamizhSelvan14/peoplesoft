import client from '../api/client'

const API_URL = '/api/performance'

export const performanceService = {
  // Dashboard
  getDashboard: async () => {
    const response = await client.get(`${API_URL}/analytics/dashboard`)
    return response.data
  },

  // Cycles
  getCycles: async () => {
    const response = await client.get(`${API_URL}/cycles`)
    return response.data.data || response.data
  },

  getCycleByID: async (id) => {
    const response = await client.get(`${API_URL}/cycles/${id}`)
    return response.data.data || response.data
  },

  createCycle: async (cycleData) => {
    const response = await client.post(`${API_URL}/cycles`, cycleData)
    return response.data.data || response.data
  },

  // Goals
  getGoals: async (filters = {}) => {
    const response = await client.get(`${API_URL}/goals`, { params: filters })
    return response.data.data || response.data
  },

  createGoal: async (goalData) => {
    const response = await client.post(`${API_URL}/goals`, goalData)
    return response.data.data || response.data
  },

  updateGoal: async (goalId, updates) => {
    const response = await client.put(`${API_URL}/goals/${goalId}`, updates)
    return response.data.data || response.data
  },

  acknowledgeGoal: async (goalId) => {
    const response = await client.post(`${API_URL}/goals/${goalId}/acknowledge`)
    return response.data.data || response.data
  },

  // Reviews
  getReviews: async (filters = {}) => {
    const response = await client.get(`${API_URL}/reviews`, { params: filters })
    return response.data.data || response.data
  },

  submitSelfAssessment: async (reviewId, assessment) => {
    const response = await client.post(
      `${API_URL}/reviews/${reviewId}/self-assessment`,
      assessment
    )
    return response.data.data || response.data
  },

  submitManagerReview: async (reviewId, review) => {
    const response = await client.post(
      `${API_URL}/reviews/${reviewId}/manager-review`,
      review
    )
    return response.data.data || response.data
  },

  employeeResponse: async (reviewId, response) => {
    const res = await client.post(
      `${API_URL}/reviews/${reviewId}/response`,
      response
    )
    return res.data.data || res.data
  },

  // Reports
  getPerformanceReports: async (filters = {}) => {
    const response = await client.get(`${API_URL}/reviews/reports`, { params: filters })
    return response.data
  },

  // Trends
  getTrends: async () => {
    const response = await client.get(`${API_URL}/analytics/trends`)
    return response.data
  }
}

export default performanceService



