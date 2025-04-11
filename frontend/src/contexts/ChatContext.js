import React, { createContext, useContext, useEffect, useCallback, useReducer } from 'react';
import { roomService } from '../services/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

// Initial state for chat reducer
const initialState = {
  rooms: [],
  currentRoom: '',
  messages: [],
  loading: false,
  error: null
};

// Chat reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ROOMS':
      return {
        ...state,
        rooms: action.payload,
        loading: false,
        error: null
      };
    case 'SET_CURRENT_ROOM':
      return {
        ...state,
        currentRoom: action.payload,
        messages: [],
        error: null
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { socket, connected, joinRoom, sendMessage } = useSocket();
  const { currentUser } = useAuth();

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await roomService.getAllRooms();

        if (response.data.success) {
          dispatch({ type: 'SET_ROOMS', payload: response.data.data.rooms });
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        dispatch({
          type: 'SET_ERROR',
          payload: err.response?.data?.message || 'Failed to fetch rooms'
        });
      }
    };

    if (currentUser) {
      fetchRooms();
    }
  }, [currentUser]);

  // Listen for socket events
  useEffect(() => {
    if (socket && connected) {
      // Handle receiving a new message
      socket.on('receiveMessage', (newMessage) => {
        dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
      });

      // Handle receiving previous messages when joining a room
      socket.on('previousMessages', (messages) => {
        dispatch({ type: 'SET_MESSAGES', payload: messages });
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('previousMessages');
      };
    }
  }, [socket, connected]);

  // Set current room and join it
  const setRoom = useCallback((roomName) => {
    if (roomName) {
      dispatch({ type: 'SET_CURRENT_ROOM', payload: roomName });
      joinRoom(roomName);
    }
  }, [joinRoom]);

  // Create a new room
  const createRoom = useCallback(async (roomName) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await roomService.createRoom(roomName);

      if (response.data.success) {
        const newRoom = response.data.data.room;
        dispatch({
          type: 'SET_ROOMS',
          payload: [...state.rooms, newRoom]
        });
        return newRoom;
      }
    } catch (err) {
      console.error('Error creating room:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.response?.data?.message || 'Failed to create room'
      });
      throw err;
    }
  }, [state.rooms]);

  // Send a message in the current room
  const sendChatMessage = useCallback(async (text) => {
    if (!state.currentRoom) {
      const errorMsg = 'Please select a room first';
      console.error(errorMsg);
      dispatch({
        type: 'SET_ERROR',
        payload: errorMsg
      });
      return Promise.reject(new Error(errorMsg));
    }

    try {
      console.log(`Attempting to send message in room ${state.currentRoom}`);
      const result = await sendMessage(text, state.currentRoom);
      console.log('Message sent successfully:', result);
      return result;
    } catch (err) {
      console.error('Error sending message:', err.message);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Failed to send message'
      });
      return Promise.reject(err);
    }
  }, [state.currentRoom, sendMessage, dispatch]);

  // Context value
  const value = {
    rooms: state.rooms,
    currentRoom: state.currentRoom,
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    setRoom,
    createRoom,
    sendMessage: sendChatMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
