'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { DBUser, Post, UserReference } from '../../../types';
import useAuth from '../../../hooks/useAuth';
import PostCard from '../../../components/PostCard';
import { ArrowPathIcon, ChatBubbleLeftRightIcon, UserPlusIcon } from '../../../components/icons';
import { useChatStore } from '../../../stores/chatStore';

const fetchUserByUsername = async (username: string): Promise<DBUser> => {
    const { data } = await api.get(`/users/username/${username}`);
    return data;
};

const fetchPostsByUser = async (userId: string): Promise<Post[]> => {
    const { data } = await api.get(`/social/posts/user/${userId}`);
    return data;
};

const UserProfilePage = () => {
    const params = useParams();
    const username = params.username as string;
    
    const { user: currentUser, setUser: setCurrentUser } = useAuth();
    const queryClient = useQueryClient();
    const openSidebar = useChatStore((state) => state.openSidebar);


    const { data: profileUser, isLoading: isLoadingUser, error: userError } = useQuery<DBUser, Error>({
        queryKey: ['userProfile', username],
        queryFn: () => fetchUserByUsername(username),
        enabled: !!username,
    });

    const { data: userPosts, isLoading: isLoadingPosts } = useQuery<Post[], Error>({
        queryKey: ['userPosts', profileUser?._id],
        queryFn: () => fetchPostsByUser(profileUser!._id),
        enabled: !!profileUser,
    });
    
    const isFollowing = currentUser?.following.includes(profileUser?._id || '') || false;
    const isOwnProfile = currentUser?._id === profileUser?._id;

    const followMutation = useMutation({
        mutationFn: (userId: string) => api.put(`/social/follow/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
            if (currentUser && profileUser) {
                const newFollowing = isFollowing
                    ? currentUser.following.filter(id => id !== profileUser._id)
                    : [...currentUser.following, profileUser._id];
                setCurrentUser({ ...currentUser, following: newFollowing });
            }
        }
    });

    const handleMessage = () => {
        if (profileUser) {
            const partner: UserReference = {
                _id: profileUser._id,
                name: profileUser.name,
                username: profileUser.username,
                profilePicUrl: profileUser.profilePicUrl,
            };
            openSidebar(partner);
        }
    };

    if (isLoadingUser) {
        return <div className="text-center py-20"><ArrowPathIcon className="h-10 w-10 mx-auto animate-spin text-gray-500" /></div>;
    }

    if (userError) {
        return <div className="text-center py-20 bg-red-50 text-red-700 rounded-lg">Error loading profile: {(userError as any).response?.data?.message || userError.message}</div>;
    }
    
    if (!profileUser) {
        return <div className="text-center py-20">User not found.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img
                        src={profileUser.profilePicUrl || `https://ui-avatars.com/api/?name=${profileUser.name.replace(' ', '+')}&size=128`}
                        alt={profileUser.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-green-200"
                    />
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">{profileUser.name}</h1>
                        <p className="text-gray-500">@{profileUser.username}</p>
                        <p className="mt-2 text-gray-700 max-w-lg">{profileUser.bio || 'No bio yet.'}</p>
                        <div className="flex justify-center sm:justify-start gap-6 mt-4">
                            <div><span className="font-bold">{profileUser.followers.length}</span> Followers</div>
                            <div><span className="font-bold">{profileUser.following.length}</span> Following</div>
                        </div>
                    </div>
                    {!isOwnProfile && currentUser?.role === 'pro' && (
                        <div className="sm:ml-auto flex flex-col sm:flex-row gap-3">
                           <button
                                onClick={() => followMutation.mutate(profileUser._id)}
                                disabled={followMutation.isPending}
                                className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                                isFollowing
                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                <UserPlusIcon className="h-5 w-5 mr-2" />
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button onClick={handleMessage} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                                Message
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* User's Posts */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Posts</h2>
                 {isLoadingPosts && <div className="text-center py-10"><ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-gray-400" /></div>}
                 
                 {userPosts && userPosts.length > 0 ? (
                    <div className="space-y-6">
                        {userPosts.map(post => <PostCard key={post._id} post={post} queryKeyToInvalidate={['userPosts', profileUser._id]} />)}
                    </div>
                ) : (
                    !isLoadingPosts && <div className="text-center p-10 bg-white rounded-2xl shadow-md"><p>{profileUser.name} hasn't posted anything yet.</p></div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;