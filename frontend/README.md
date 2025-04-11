# Chat Application Frontend

A real-time chat application frontend built with React, Socket.IO, and Context API.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- Room-based chat system
- Responsive design
- Form validation
- Error handling

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

Create a `.env` file in the root directory with the following variables:

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
│   │   ├── auth/       # Authentication components
│   │   ├── chat/       # Chat components
│   │   └── common/     # Common UI components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
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

- React - UI library
- Socket.IO Client - Real-time communication
- Axios - HTTP client
- PropTypes - Runtime type checking

## Best Practices Implemented

- Component composition and reusability
- Context API for state management
- Custom hooks for shared logic
- Proper error handling
- Form validation
- Responsive design
- Environment configuration
- Code organization by feature
- Consistent naming conventions
- PropTypes for type checking