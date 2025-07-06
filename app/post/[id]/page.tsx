'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '../../../lib/api';
import { Post, Comment } from '../../../types';
import PostCard from '../../../components/PostCard';
import useAuth from '../../../hooks/useAuth';
import { ArrowPathIcon } from '../../../components/icons';

const fetchPost = async (postId: string): Promise<Post> => {
    const { data } = await api.get(`/social/post/${postId}`);
    return data;
};

const PostPage: React.FC = () => {
    const params = useParams();
    const postId = params.id as string;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');

    const queryKey = ['post', postId];

    const { data: post, isLoading, error } = useQuery<Post, Error>({
        queryKey: queryKey,
        queryFn: () => fetchPost(postId),
        enabled: !!postId,
    });

    const commentMutation = useMutation<Comment, Error, { text: string }>({
        mutationFn: async (newComment: { text: string }) => {
            const response = await api.post(`/social/post/${postId}/comment`, newComment);
            return response.data;
        },
        onSuccess: (newComment) => {
            queryClient.setQueryData<Post | undefined>(queryKey, (oldPost) => 
                oldPost ? { ...oldPost, comments: [...oldPost.comments, newComment] } : oldPost
            );
            setCommentText('');
        }
    });

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(commentText.trim()) {
            commentMutation.mutate({ text: commentText });
        }
    };

    if (isLoading) {
        return <div className="text-center p-10"><ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-gray-400" /></div>;
    }

    if (error) {
        return <div className="text-center p-10 bg-red-50 text-red-600 rounded-lg">{error.message}</div>;
    }

    if (!post) {
        return <div className="text-center p-10">Post not found.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <PostCard post={post} queryKeyToInvalidate={queryKey} />

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Comments ({post.comments.length})</h3>

                {/* Comment Form */}
                <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
                    <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
                         <img
                            src={user?.profilePicUrl || `https://ui-avatars.com/api/?name=${user?.name.replace(' ', '+')}`}
                            alt={user?.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            rows={2}
                        />
                        <button
                            type="submit"
                            disabled={commentMutation.isPending || !commentText.trim()}
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400"
                        >
                            Post
                        </button>
                    </form>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                    {post.comments.map(comment => (
                        <div key={comment._id} className="flex items-start gap-3">
                            <img
                                src={comment.user.profilePicUrl || `https://ui-avatars.com/api/?name=${comment.user.name.replace(' ', '+')}`}
                                alt={comment.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="bg-gray-100 rounded-xl p-3 flex-1">
                                <p className="font-semibold text-sm">{comment.user.name}</p>
                                <p className="text-gray-700">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostPage;