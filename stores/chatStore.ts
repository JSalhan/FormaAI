import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { UserReference, ChatMessage } from '../types';

interface ServerToClientEvents {
  'private-message': (message: ChatMessage) => void;
}

interface ClientToServerEvents {
  authenticate: (token: string) => void;
  'private-message': (data: { to: string; message: string }) => void;
}

interface ChatState {
    isSidebarOpen: boolean;
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
    activeChatPartner: UserReference | null;
    
    openSidebar: (partner?: UserReference) => void;
    closeSidebar: () => void;
    
    connectSocket: (token: string, onMessageReceived: (message: ChatMessage) => void) => void;
    disconnectSocket: () => void;
    
    sendMessage: (to: string, message: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    isSidebarOpen: false,
    socket: null,
    activeChatPartner: null,

    openSidebar: (partner) => {
        set({ isSidebarOpen: true, activeChatPartner: partner || null });
    },
    closeSidebar: () => {
        set({ isSidebarOpen: false, activeChatPartner: null });
    },

    connectSocket: (token, onMessageReceived) => {
        if (get().socket) return;

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001');

        newSocket.on('connect', () => {
            console.log('Socket connected, authenticating...');
            newSocket.emit('authenticate', token);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected.');
        });
        
        // Remove previous listener to avoid duplicates
        newSocket.off('private-message');
        newSocket.on('private-message', onMessageReceived);

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },
    
    sendMessage: (to, message) => {
        const { socket } = get();
        if (socket && socket.connected) {
            socket.emit('private-message', { to, message });
        } else {
            console.error('Socket not connected. Cannot send message.');
        }
    },
}));