import apiClient from '../api/client.js';

/**
 * Wraps the /chatbot endpoint exposed by skillsync-notification-service.
 * Used by the "Elaichi" general-purpose AI bot.
 */
export const chatbotService = {
  ask: (message, history = []) =>
    apiClient
      .post('/chatbot/ask', { message, history })
      .then((r) => r.data)
};

export default chatbotService;
