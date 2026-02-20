const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  socketUrl: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000/chat',
  
  defaultSettings: {
    messageLimit: 50,
    autoScroll: true,
  },
  
  features: {
    enableNotifications: true,
    enableMessageEditing: false,
    enableFileUploads: false,
  },
};

export default config;
