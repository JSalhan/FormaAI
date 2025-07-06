'use client';
import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuth from './useAuth';
import { ChatMessage } from '../types';

interface ServerToClientEvents {
  'private-message': (message: ChatMessage) => void;
}

interface ClientToServerEvents {
  authenticate: (token: string) => void;
  'private-message': (data: { to: string; message: string }) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

const useChatSocket = (onMessageReceived: (message: ChatMessage) => void) => {
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      if (!socket || socket.disconnected) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', {
            autoConnect: false,
        });

        socket.on('connect', () => {
          console.log('Socket connected, authenticating...');
          if (socket && token) {
            socket.emit('authenticate', token);
          }
        });
        
        socket.off('private-message');
        socket.on('private-message', (message) => {
            onMessageReceived(message);
        });

        socket.connect();
      }
    } else {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    }

    // This cleanup function is tricky for sockets that should persist.
    // We only disconnect if auth state changes.
    return () => {
        if (socket && (!isAuthenticated || !token)) {
            socket.disconnect();
            socket = null;
        }
    };
  }, [isAuthenticated, token, onMessageReceived]);

  const sendMessage = useCallback((to: string, message: string) => {
    if (socket && socket.connected) {
      socket.emit('private-message', { to, message });
    } else {
      console.error("Socket not connected. Cannot send message.");
    }
  }, []);

  return { sendMessage };
};

export default useChatSocket;