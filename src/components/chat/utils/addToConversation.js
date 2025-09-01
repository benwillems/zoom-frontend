import axios from 'axios'

/**
 * Sends a POST request to the specified conversation endpoint with the provided body data, then updates the conversation context with the response data.
 *
 * @param {Array<Objects>} originalData - Contains previous conversation answers.
 * @param {Object} body - The data to be sent in the body of the POST request.
 * @param {Function} setConversation - The context function to update the conversation state.
 * @returns {Object} Answer to the users question.
 *
 * @example
 * const body = {
 *   message: "Your message here"
 * };
 *
 * const endpoint = "http://domain.com/conversation";
 * postConversation(endpoint, body, setConversation);
 */
export const addToConversation = async (
  originalData,
  body,
  setConversation,
  setConversationIsLoading
) => {
  try {
    let endpoint = `http://localhost:3001/query/pet`

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    setConversationIsLoading(true)
    const response = await axios.post(endpoint, body, config)
    const data = response.data

    setConversation([...originalData, data])
  } catch (error) {
    console.error('Error posting conversation:', error)
  } finally {
    setConversationIsLoading(false) // Reset the loading state regardless of success or error
  }
}
