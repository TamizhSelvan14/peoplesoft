import client from '../api/client'

const API_URL = '/api/surveys'

export const surveyService = {
  getTemplates: async () => {
    const response = await client.get(`${API_URL}/templates`)
    return response.data.data || response.data
  },

  createTemplate: async (templateData) => {
    const response = await client.post(`${API_URL}/templates`, templateData)
    return response.data.data || response.data
  },

  submitResponse: async (responseData) => {
    const response = await client.post(`${API_URL}/responses`, responseData)
    return response.data.data || response.data
  },

  getAnalytics: async (filters = {}) => {
    const response = await client.get(`${API_URL}/analytics`, { params: filters })
    return response.data
  }
}

export default surveyService

