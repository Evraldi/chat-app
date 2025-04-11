# Chat Application Backend

A real-time chat application backend built with Express.js, Socket.IO, and MongoDB.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- Room-based chat system
- MongoDB for data persistence
- RESTful API for messages, rooms, and users
- Comprehensive error handling and logging

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies

```bash
npm install
```

4. Create a `.env` file based on `.env.example`
5. Start the development server

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info (requires authentication)

### Rooms

- `GET /rooms` - Get all rooms
- `POST /rooms` - Create a new room

### Messages

- `GET /messages?room=roomName` - Get messages for a specific room
- `POST /messages` - Create a new message
- `DELETE /messages?room=roomName` - Delete all messages in a room (requires authentication)

## Socket.IO Events

### Client to Server

- `joinRoom` - Join a specific chat room
- `sendMessage` - Send a message to a room

### Server to Client

- `receiveMessage` - Receive a new message
- `previousMessages` - Receive previous messages when joining a room

## Project Structure

```
backend/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # Express routes
├── socketHandlers/     # Socket.IO event handlers
├── utils/              # Utility functions
├── logs/               # Log files
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── server.js           # Entry point
└── package.json        # Dependencies and scripts
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run seed` - Seed the database with sample data

## License

ISC
