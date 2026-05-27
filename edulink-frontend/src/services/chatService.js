import api from './api'

export const chatService = {
  async getMessages(subjectId, afterId) {
    const params = {}
    if (afterId) {
      params.afterId = afterId
    }
    const response = await api.get(`/api/chat/subjects/${subjectId}/messages`, { params })
    return response.data
  },

  async sendMessage(subjectId, content, isDoubt = false) {
    const response = await api.post(`/api/chat/subjects/${subjectId}/messages`, { content, isDoubt })
    return response.data
  },

  async pingPresence(subjectId) {
    const response = await api.post(`/api/chat/subjects/${subjectId}/presence/ping`)
    return response.data
  },

  async getParticipants(subjectId) {
    const response = await api.get(`/api/chat/subjects/${subjectId}/participants`)
    return response.data
  },

  async toggleUpvote(messageId) {
    const response = await api.post(`/api/chat/messages/${messageId}/upvote`)
    return response.data
  },

  async toggleDoubt(messageId) {
    const response = await api.post(`/api/chat/messages/${messageId}/doubt`)
    return response.data
  },

  async toggleResolve(messageId) {
    const response = await api.post(`/api/chat/messages/${messageId}/resolve`)
    return response.data
  },

  async getSubjectDoubts(subjectId) {
    const response = await api.get(`/api/chat/subjects/${subjectId}/doubts`)
    return response.data
  },

  async summarizeChat(subjectId, messages = []) {
    const payload = {
      messages: messages
        .map((message) => message?.content)
        .filter((content) => typeof content === 'string' && content.trim())
        .map((content) => content.trim()),
    }

    console.info('[chatService] Requesting chat summary', {
      subjectId,
      fallbackMessageCount: payload.messages.length,
    })

    const response = await api.post(`/api/chat/subjects/${subjectId}/summary`, payload, {
      timeout: 180000,
    })
    console.info('[chatService] Chat summary response', response.data)
    return response.data
  },
}


