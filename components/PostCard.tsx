'use client';
import React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';
import { Post } from '../types';
import { motion } from 'framer-motion';
import { ShareIcon, ChatBubbleLeftRightIcon } from './icons';
import { useChatStore } from '../stores/chatStore';

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement> & { isFilled?: boolean }> = ({ isFilled, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill={isFilled ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const ChatBubbleOvalLeftEllipsisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);


interface PostCardProps {
  post: Post;
  queryKeyToInvalidate: string[];
}

const PostCard: React.FC<PostCardProps> = ({ post, queryKeyToInvalidate }) => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const openSidebar = useChatStore((state) => state.openSidebar);

  const isLiked = user ? post.likes.includes(user._id) : false;
  const isFollowing = user ? user.following.includes(post.author._id) : false;
  const isOwnPost = user?._id === post.author._id;

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.put(`/social/post/${postId}/like`),
    onMutate: async (postId: string) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: queryKeyToInvalidate });
      const previousData = queryClient.getQueryData<Post[] | Post>(queryKeyToInvalidate);

      queryClient.setQueryData<any>(queryKeyToInvalidate, (oldData: any) => {
        const updater = (p: Post) => {
          if (p._id === postId) {
            const newLikes = p.likes.includes(user._id)
              ? p.likes.filter((id) => id !== user._id)
              : [...p.likes, user._id];
            return { ...p, likes: newLikes };
          }
          return p;
        };

        if (Array.isArray(oldData?.pages)) { // For infinite query data
            return {
              ...oldData,
              pages: oldData.pages.map((page: Post[]) => page.map(updater)),
            };
        } else if (Array.isArray(oldData)) { // For standard query data
            return oldData.map(updater);
        }
        return updater(oldData); // For single post query
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(queryKeyToInvalidate, context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
    },
  });

  const followMutation = useMutation({
    mutationFn: (authorId: string) => api.put(`/social/follow/${authorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverUsers'] });
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      if (user) {
        const newFollowing = isFollowing
          ? user.following.filter((id) => id !== post.author._id)
          : [...user.following, post.author._id];
        setUser({ ...user, following: newFollowing });
      }
    },
  });

  const handleShare = async () => {
      const shareUrl = `${window.location.origin}/post/${post._id}`;
      try {
          if (navigator.share) {
              await navigator.share({
                  title: `Post by ${post.author.name} on FormaAI`,
                  text: post.content,
                  url: shareUrl
              });
          } else {
              await navigator.clipboard.writeText(shareUrl);
              alert('Post link copied to clipboard!');
          }
      } catch (error) {
          console.error("Error sharing post:", error);
          alert("Could not share post.");
      }
  };

  const handleChat = () => {
      if(isOwnPost || user?.role !== 'pro') return;
      openSidebar(post.author);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
            <Link href={isOwnPost ? '/dashboard/profile' : `/user/${post.author.username}`} className="flex items-center gap-3 group">
                <img
                    src={post.author.profilePicUrl || `https://ui-avatars.com/api/?name=${post.author.name.replace(' ', '+')}`}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">{post.author.name}</p>
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </Link>
            {!isOwnPost && user && (
            <button
                onClick={() => followMutation.mutate(post.author._id)}
                disabled={followMutation.isPending}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
                isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </button>
            )}
        </div>

        <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>
      </div>

      {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-2 bg-gray-100">
              {post.mediaUrls[0].endsWith('.mp4') || post.mediaUrls[0].endsWith('.mov') ? (
                  <video src={post.mediaUrls[0]} controls className="w-full max-h-[600px] object-contain bg-black" />
              ) : (
                  <img src={post.mediaUrls[0]} alt="Post media" className="w-full max-h-[600px] object-cover" />
              )}
          </div>
      )}

      <div className="flex items-center gap-2 p-3 border-t border-gray-100">
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => user && likeMutation.mutate(post._id)}
            disabled={!user || likeMutation.isPending}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors disabled:cursor-not-allowed p-2 rounded-lg"
        >
            <HeartIcon className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
            <span className="text-sm font-medium">{post.likes.length}</span>
        </motion.button>
        <motion.div whileTap={{ scale: 0.9 }} className="flex">
            <Link href={`/post/${post._id}`} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors p-2 rounded-lg">
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                <span className="text-sm font-medium">{post.comments.length}</span>
            </Link>
        </motion.div>
        {!isOwnPost && user?.role === 'pro' && (
             <motion.button whileTap={{ scale: 0.9 }} onClick={handleChat} className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors p-2 rounded-lg ml-auto">
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </motion.button>
        )}
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className={`flex items-center gap-1.5 text-gray-500 hover:text-indigo-500 transition-colors p-2 rounded-lg ${isOwnPost || user?.role !== 'pro' ? 'ml-auto' : ''}`}>
            <ShareIcon className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};

export default PostCard;