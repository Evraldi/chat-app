# Chat Application Backend

A real-time chat application backend built with Express.js, Socket.IO, and MongoDB.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT (including socket connection auth)
- Room-based chat system
- MongoDB for data persistence (with indexes for performance)
- RESTful API for messages, rooms, and users
- Cursor-based pagination for messages
- Rate limiting on auth & API endpoints
- Input validation with Joi
- Comprehensive error handling and logging with Winston
- Toast notifications & Error Boundary on frontend

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
- `.env` jangan di-commit ke git
- Jangan commit file `.env` ke git

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

- `POST /auth/register` - Register a new user (username min 3, password min 6)
- `POST /auth/login` - Login and get JWT token (rate limited: 10 attempts/15min)
- `GET /auth/me` - Get current user info (requires authentication)

### Rooms

- `GET /rooms` - Get all rooms
- `POST /rooms` - Create a new room (requires authentication)

### Messages

- `GET /messages?room=roomName&cursor=id&limit=50` - Get messages (cursor-based pagination, max 100)
- `POST /messages` - Create a new message (requires authentication)
- `DELETE /messages?room=roomName` - Delete all messages in a room (requires authentication)

### Profile

- `GET /profile/:userId` - Get user profile by ID
- `PUT /profile` - Update own profile (requires authentication)

## Socket.IO Events

### Client to Server

- `joinRoom` - Join a specific chat room (requires auth via socket handshake)
- `leaveRoom` - Leave a chat room
- `sendMessage` - Send a message to a room (username taken from JWT)

### Server to Client

- `receiveMessage` - Receive a new message
- `previousMessages` - Receive previous messages when joining a room

## Socket Authentication

All socket connections are authenticated via JWT token sent in the handshake auth object:

```js
const socket = io('/chat', {
  auth: { token: 'your-jwt-token' }
});
```

## Project Structure

```
backend/
├── config/             # Configuration files (db.js)
├── controllers/        # Route controllers
├── middleware/         # Express middleware (auth, errorHandler, validateInput)
├── models/             # Mongoose models (User, Message, Room)
├── routes/             # Express routes
├── socketHandlers/     # Socket.IO event handlers
├── utils/              # Utility functions (logger, responseHandler)
├── logs/               # Log files (gitignored)
├── .env                # Environment variables (gitignored)
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
