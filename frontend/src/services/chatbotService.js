import client from '../api/client'

const API_URL = '/api/chatbot'

export const chatbotService = {
  query: async (query) => {
    const response = await client.post(`${API_URL}/query`, { query })
    return response.data
  },

  scheduleMeeting: async (meetingData) => {
    const response = await client.post(`${API_URL}/actions/schedule-meeting`, meetingData)
    return response.data
  },

  generateReport: async (reportData) => {
    const response = await client.post(`${API_URL}/actions/generate-report`, reportData)
    return response.data
  }
}

export default chatbotService

