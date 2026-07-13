# Chat Application Frontend

A real-time chat application frontend built with React, Socket.IO Client, and Context API.

## Features

- Real-time messaging with Socket.IO (JWT-authenticated socket connections)
- User authentication with JWT
- Room-based chat system
- Responsive design with sidebar
- Form validation (client and server side)
- Toast notifications (replaces `alert()`)
- Error Boundary for crash prevention
- Profile editing with avatar upload (base64)
- Cursor-based pagination support

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies

```bash
npm install
```

4. Create a `.env` file based on `.env.example`
5. Start the development server

```bash
npm start
```

## Environment Variables

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000/chat
```

## Project Structure

```
frontend/
├── public/             # Static files
├── src/                # Source code
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components (LoginForm, RegisterForm)
│   │   ├── chat/       # Chat components (ChatPage, MessageList, MessageInput, RoomSelector)
│   │   ├── common/     # Common UI components (Button, Input, Loader, Toast, ErrorBoundary)
│   │   └── profile/    # Profile components (ProfileModal)
│   ├── contexts/       # React context providers (Auth, Socket, Chat)
│   ├── hooks/          # Custom React hooks (useForm)
│   ├── services/       # API services (api.js with axios interceptors)
│   ├── utils/          # Utility functions (helpers.js)
│   ├── config/         # Configuration files (config.js)
│   ├── App.js          # Main App component
│   └── index.js        # Entry point
├── .env                # Environment variables
├── .env.example        # Example environment variables
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Dependencies

- React 18 - UI library
- Socket.IO Client - Real-time communication
- Axios - HTTP client with JWT interceptor
- PropTypes - Runtime type checking
- React Router DOM - Navigation
- React Window - Virtualized list (for performance)

## Best Practices Implemented

- Component composition and reusability
- Context API + useReducer for state management
- Custom hooks for shared logic (useForm)
- Proper error handling with Error Boundary
- Form validation on both client and server
- Environment configuration via .env
- Code organization by feature
- PropTypes for type checking
- Toast notifications instead of browser alerts
