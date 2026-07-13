const config = {
  apiUrl: process.env.REACT_APP_API_URL || '',

  socketUrl: process.env.REACT_APP_SOCKET_URL || '/chat',
  
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
