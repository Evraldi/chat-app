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
  isLoadingMessages: false,
  error: null
};

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
        isLoadingMessages: true,
        error: null
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        isLoadingMessages: false,
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
    case 'SET_LOADING_MESSAGES':
      return {
        ...state,
        isLoadingMessages: action.payload
      };
    default:
      return state;
  }
};

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { socket, connected, joinRoom, leaveRoom, sendMessage } = useSocket();
  const { currentUser } = useAuth();

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

  useEffect(() => {
    if (socket && connected) {
      socket.on('receiveMessage', (newMessage) => {
        dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
      });
      socket.on('previousMessages', (messages) => {
        // Add minimal delay for smooth transition
        setTimeout(() => {
          dispatch({ type: 'SET_MESSAGES', payload: messages });
        }, 500);
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('previousMessages');
      };
    }
  }, [socket, connected]);

  const setRoom = useCallback((roomName) => {
    if (roomName && roomName !== state.currentRoom) {
      if (state.currentRoom) {
        leaveRoom(state.currentRoom);
      }

      dispatch({ type: 'SET_CURRENT_ROOM', payload: roomName });
      joinRoom(roomName);
    }
  }, [joinRoom, leaveRoom, state.currentRoom]);

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

  const value = {
    rooms: state.rooms,
    currentRoom: state.currentRoom,
    messages: state.messages,
    loading: state.loading,
    isLoadingMessages: state.isLoadingMessages,
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

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
