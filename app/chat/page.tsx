'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import useAuth from '../../hooks/useAuth';
import useChatSocket from '../../hooks/useChatSocket';
import { PopulatedDBUser, UserReference, ChatMessage } from '../../types';
import { ArrowPathIcon } from '../../components/icons';

const fetchMyProfile = async (): Promise<PopulatedDBUser> => {
    const { data } = await api.get('/auth/me');
    return data;
};


const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const userToChatWithId = searchParams.get('with');
    
    const { data: profile, isLoading: isLoadingFollowing } = useQuery<PopulatedDBUser>({
        queryKey: ['myProfile'],
        queryFn: fetchMyProfile
    });
    
    const chatContacts = profile?.following || [];

    const [activeChatUser, setActiveChatUser] = useState<UserReference | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: chatHistory, isLoading: isLoadingHistory } = useQuery<ChatMessage[]>({
        queryKey: ['chatHistory', activeChatUser?._id],
        queryFn: async () => {
            if (!activeChatUser) return [];
            const { data } = await api.get(`/chat/history/${activeChatUser._id}`);
            setMessages(data);
            return data;
        },
        enabled: !!activeChatUser,
    });
    
    const onMessageReceived = useCallback((message: ChatMessage) => {
        if (message.from._id === activeChatUser?._id || message.from._id === user?._id) {
            setMessages(prev => [...prev, message]);
        } else {
            // Handle notification for inactive chat
            alert(`New message from ${message.from.name}`);
        }
    }, [activeChatUser, user]);

    const { sendMessage } = useChatSocket(onMessageReceived);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && activeChatUser) {
            sendMessage(activeChatUser._id, newMessage);
            setNewMessage('');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
      if (chatContacts.length > 0) {
        if (userToChatWithId) {
            const targetUser = chatContacts.find(u => u._id === userToChatWithId);
            setActiveChatUser(targetUser || chatContacts[0]);
        } else if (!activeChatUser) {
            setActiveChatUser(chatContacts[0]);
        }
      }
    }, [chatContacts, activeChatUser, userToChatWithId]);

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-lg border">
            {/* User List Sidebar */}
            <aside className="w-1/3 border-r border-gray-200 overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Chats</h2>
                </div>
                {isLoadingFollowing ? (
                     <div className="p-4 text-center">Loading...</div>
                ) : (
                    <ul>
                        {chatContacts && chatContacts.length > 0 ? (
                           chatContacts.map(chatUser => (
                            <li key={chatUser._id} onClick={() => setActiveChatUser(chatUser)} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 ${activeChatUser?._id === chatUser._id ? 'bg-green-50' : ''}`}>
                                <img src={chatUser.profilePicUrl || `https://ui-avatars.com/api/?name=${chatUser.name.replace(' ', '+')}`} alt={chatUser.name} className="w-10 h-10 rounded-full object-cover"/>
                                <p className="font-semibold">{chatUser.name}</p>
                            </li>
                           ))
                        ) : (
                            <p className="p-4 text-gray-500">Follow users to start chatting.</p>
                        )}
                    </ul>
                )}
            </aside>

            {/* Main Chat Area */}
            <main className="w-2/3 flex flex-col">
                {activeChatUser ? (
                    <>
                        <header className="p-4 border-b flex items-center gap-3">
                             <img src={activeChatUser.profilePicUrl || `https://ui-avatars.com/api/?name=${activeChatUser.name.replace(' ', '+')}`} alt={activeChatUser.name} className="w-10 h-10 rounded-full object-cover"/>
                             <h3 className="font-semibold text-lg">{activeChatUser.name}</h3>
                        </header>
                        
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {isLoadingHistory && <div className="text-center"><ArrowPathIcon className="h-6 w-6 animate-spin mx-auto"/></div>}
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex ${msg.from._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${msg.from._id === user?._id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        <p>{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                             <div ref={messagesEndRef} />
                        </div>

                        <footer className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                                />
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">Send</button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Select a user to start a conversation.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatPage;