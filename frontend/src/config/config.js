// Configuration variables for the application
const config = {
  // API URL - defaults to localhost in development
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Socket URL - defaults to localhost in development
  socketUrl: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000/chat',
  
  // Default app settings
  defaultSettings: {
    messageLimit: 50,
    autoScroll: true,
  },
  
  // Feature flags
  features: {
    enableNotifications: true,
    enableMessageEditing: false,
    enableFileUploads: false,
  },
};

export default config;
