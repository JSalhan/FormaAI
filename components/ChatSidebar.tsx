'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { useChatStore } from '../stores/chatStore';
import api from '../lib/api';
import { Conversation, ChatMessage, UserReference } from '../types';
import { PaperAirplaneIcon, ArrowPathIcon } from './icons';

const fetchConversations = async (): Promise<Conversation[]> => {
    const { data } = await api.get('/chat/conversations');
    return data;
};

const fetchMessages = async (partnerId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get(`/chat/messages/${partnerId}`);
    return data;
}

const ChatSidebar: React.FC = () => {
    const { isAuthenticated, token, user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const { isSidebarOpen, closeSidebar, activeChatPartner, openSidebar, connectSocket, disconnectSocket, sendMessage } = useChatStore();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const onMessageReceived = useCallback((message: ChatMessage) => {
        const activePartner = useChatStore.getState().activeChatPartner;
        // Add to active chat if it's the right conversation
        if (message.from._id === activePartner?._id || message.from._id === currentUser?._id) {
             setMessages(prev => [...prev, message]);
        }
        // Invalidate conversations to update the last message preview
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }, [queryClient, currentUser]);

    useEffect(() => {
        if (isAuthenticated && token) {
            connectSocket(token, onMessageReceived);
        } else {
            disconnectSocket();
        }
        return () => disconnectSocket();
    }, [isAuthenticated, token, connectSocket, disconnectSocket, onMessageReceived]);

    const { data: conversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
        queryKey: ['conversations'],
        queryFn: fetchConversations,
        enabled: isAuthenticated && isSidebarOpen,
    });

    const { data: messageHistory, isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery<ChatMessage[]>({
        queryKey: ['messages', activeChatPartner?._id],
        queryFn: () => fetchMessages(activeChatPartner!._id),
        enabled: false, // only fetch manually
    });

    useEffect(() => {
        if (activeChatPartner) {
            refetchMessages();
        } else {
            setMessages([]);
        }
    }, [activeChatPartner, refetchMessages]);
    
    useEffect(() => {
        if(messageHistory) {
            setMessages(messageHistory);
        }
    }, [messageHistory]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && activeChatPartner) {
            sendMessage(activeChatPartner._id, newMessage);
            setNewMessage('');
        }
    };
    
    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/30 z-[59]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[60] flex flex-col"
                    >
                        <header className="p-4 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold">Chat</h2>
                            <button onClick={closeSidebar} className="p-2 rounded-full hover:bg-gray-100">&times;</button>
                        </header>

                        <AnimatePresence mode="wait">
                        {!activeChatPartner ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 overflow-y-auto"
                            >
                               {isLoadingConversations ? (
                                   <div className="flex items-center justify-center h-full"><ArrowPathIcon className="h-6 w-6 animate-spin text-gray-400"/></div>
                               ) : (
                                   conversations && conversations.length > 0 ? (
                                      conversations.map(convo => (
                                          <div key={convo.partner._id} onClick={() => openSidebar(convo.partner)} className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b">
                                               <img src={convo.partner.profilePicUrl || `https://ui-avatars.com/api/?name=${convo.partner.name.replace(' ', '+')}`} alt="" className="w-12 h-12 rounded-full object-cover"/>
                                               <div className="flex-1 overflow-hidden">
                                                   <p className="font-semibold">{convo.partner.name}</p>
                                                   <p className="text-sm text-gray-500 truncate">{convo.lastMessage.from === currentUser?._id && "You: "}{convo.lastMessage.message}</p>
                                               </div>
                                          </div>
                                      ))
                                   ) : (
                                       <p className="p-4 text-center text-gray-500">No conversations yet. Chat with someone from the community feed.</p>
                                   )
                               )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col overflow-hidden"
                            >
                                <div className="p-3 border-b flex items-center gap-3">
                                    <button onClick={() => openSidebar()} className="p-2 rounded-full hover:bg-gray-100">←</button>
                                    <img src={activeChatPartner.profilePicUrl || `https://ui-avatars.com/api/?name=${activeChatPartner.name.replace(' ', '+')}`} alt="" className="w-10 h-10 rounded-full object-cover"/>
                                    <p className="font-semibold">{activeChatPartner.name}</p>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                     {isLoadingMessages ? (
                                        <div className="flex items-center justify-center h-full"><ArrowPathIcon className="h-6 w-6 animate-spin text-gray-400"/></div>
                                     ) : (
                                         messages.map(msg => (
                                             <div key={msg._id} className={`flex ${msg.from._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-xs p-3 rounded-2xl ${msg.from._id === currentUser?._id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                    <p>{msg.message}</p>
                                                </div>
                                             </div>
                                         ))
                                     )}
                                     <div ref={messagesEndRef} />
                                </div>
                                <div className="p-2 border-t bg-gray-50">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                                        />
                                        <button type="submit" className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400" disabled={!newMessage.trim()}>
                                            <PaperAirplaneIcon className="h-6 w-6" />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatSidebar;