import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchMessages = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch messages');
  }
};

export const postMessage = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/messages`, message);
    return response.data;
  } catch (error) {
    throw new Error('Failed to post message');
  }
};
