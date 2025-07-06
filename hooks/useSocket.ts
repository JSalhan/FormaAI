'use client';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuth from './useAuth';
import { PlanData } from '../types';

// Define event types for type safety
interface ServerToClientEvents {
  'plan-updated': (data: { message: string; newPlan: PlanData; }) => void;
}

interface ClientToServerEvents {
  'authenticate': (token: string) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

const useSocket = (onPlanUpdate: (data: { message: string; newPlan: PlanData }) => void) => {
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001');

        socket.on('connect', () => {
          console.log('Socket connected, authenticating...');
          socket?.emit('authenticate', token);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        // Clean up previous listener before adding a new one
        socket.off('plan-updated');
        socket.on('plan-updated', (data) => {
            console.log('Received plan-updated event:', data);
            onPlanUpdate(data);
        });
      }
    } else {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    }

    return () => {
      if (socket) {
        console.log('Disconnecting socket on cleanup');
        socket.disconnect();
        socket = null;
      }
    };
  }, [isAuthenticated, token, onPlanUpdate]);
};

export default useSocket;
