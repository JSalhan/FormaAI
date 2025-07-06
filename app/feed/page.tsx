'use client';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Post, DBUser } from '../../types';
import PostCard from '../../components/PostCard';
import CreatePostForm from '../../components/CreatePostForm';
import { ArrowPathIcon, UserPlusIcon } from '../../components/icons';
import useAuth from '../../hooks/useAuth';

const fetchFeed = async (): Promise<Post[]> => {
    const { data } = await api.get('/social/feed');
    return data;
};

const fetchDiscoverUsers = async (): Promise<DBUser[]> => {
    const { data } = await api.get('/social/users/discover');
    return data;
};


const DiscoverUsers: React.FC = () => {
    const { data: users, isLoading } = useQuery<DBUser[], Error>({
        queryKey: ['discoverUsers'],
        queryFn: fetchDiscoverUsers,
    });
    const { user, setUser } = useAuth();
    const queryClient = useQueryClient();

    const followMutation = useMutation({
        mutationFn: (userId: string) => api.put(`/social/follow/${userId}`),
        onSuccess: (data, userId) => {
            if(user) {
                const newFollowing = [...user.following, userId];
                setUser({...user, following: newFollowing });
            }
            queryClient.invalidateQueries({ queryKey: ['discoverUsers'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        }
    });

    if (isLoading) return <div className="p-4 text-center">Loading users...</div>;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Discover People</h3>
            <div className="space-y-3">
                {users?.map(discoverUser => (
                    <div key={discoverUser._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={discoverUser.profilePicUrl || `https://ui-avatars.com/api/?name=${discoverUser.name.replace(' ', '+')}`} alt={discoverUser.name} className="w-10 h-10 rounded-full object-cover"/>
                            <div>
                                <p className="font-semibold text-sm">{discoverUser.name}</p>
                                <p className="text-xs text-gray-400">{discoverUser.followers.length} followers</p>
                            </div>
                        </div>
                        <button
                            onClick={() => followMutation.mutate(discoverUser._id)}
                            disabled={followMutation.isPending && followMutation.variables === discoverUser._id}
                            className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                        >
                            <UserPlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}


const FeedPage: React.FC = () => {
    const { data: posts, isLoading, error } = useQuery<Post[], Error>({
        queryKey: ['feed'],
        queryFn: fetchFeed,
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-6">
                <CreatePostForm />
                
                {isLoading && (
                    <div className="text-center p-10">
                        <ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                        <p className="mt-2 text-gray-500">Loading feed...</p>
                    </div>
                )}
                {error && <div className="text-center p-10 bg-red-50 text-red-600 rounded-lg">{error.message}</div>}
                
                {posts && posts.length > 0 && (
                    <div className="space-y-6">
                        {posts.map(post => <PostCard key={post._id} post={post} queryKeyToInvalidate={['feed']} />)}
                    </div>
                )}
                
                {posts && posts.length === 0 && (
                     <div className="text-center p-10 bg-white rounded-2xl shadow-md">
                        <h3 className="font-semibold text-lg">Your Feed is Quiet</h3>
                        <p className="text-gray-500 mt-1">Follow people from the "Discover People" section to see their posts here.</p>
                    </div>
                )}
            </div>
            <div className="md:col-span-4">
                <div className="sticky top-24 space-y-6">
                    <DiscoverUsers />
                </div>
            </div>
        </div>
    );
};

export default FeedPage;