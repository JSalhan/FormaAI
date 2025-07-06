'use client';
import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import useAuth from '../hooks/useAuth';
import { ArrowPathIcon } from './icons';

const MAX_FILES = 4;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];

const CreatePostForm: React.FC = () => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (formData: FormData) => api.post('/social', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            setContent('');
            setFiles([]);
            setError(null);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || "Failed to create post.");
        }
    });

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        setError(null);

        const newFiles = Array.from(selectedFiles);
        if (files.length + newFiles.length > MAX_FILES) {
            setError(`You can only upload a maximum of ${MAX_FILES} files.`);
            return;
        }

        const validFiles = newFiles.filter(file => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(`File type not supported: ${file.name}`);
                return false;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setError(`File is too large (max ${MAX_FILE_SIZE_MB}MB): ${file.name}`);
                return false;
            }
            return true;
        });
        
        if (error) return; // Stop if any file is invalid

        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.classList.remove('border-green-500');
        handleFileChange(event.dataTransfer.files);
    }, [files]);
    
    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.classList.add('border-green-500');
    };
    
    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.classList.remove('border-green-500');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && files.length === 0) {
            setError("Post cannot be empty.");
            return;
        }

        const formData = new FormData();
        formData.append('content', content);
        files.forEach(file => {
            formData.append('media', file);
        });
        mutation.mutate(formData);
    };

    if (!user) return null;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start gap-4">
                     <img
                        src={user.profilePicUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        rows={2}
                    />
                </div>
                
                {/* File Dropzone & Previews */}
                <div className="mt-4">
                    <div 
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors"
                    >
                        <input
                            type="file"
                            multiple
                            accept={ALLOWED_TYPES.join(',')}
                            onChange={(e) => handleFileChange(e.target.files)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <p className="text-gray-500">Drag & drop media here, or click to select files.</p>
                        <p className="text-xs text-gray-400 mt-1">Max {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each. (JPG, PNG, MP4)</p>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {files.map((file, index) => (
                                <div key={index} className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute -top-1 -right-1 z-10 bg-red-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs opacity-75 group-hover:opacity-100"
                                    >
                                        &times;
                                    </button>
                                    {file.type.startsWith('image/') ? (
                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-24 object-cover rounded-lg"/>
                                    ) : (
                                        <video src={URL.createObjectURL(file)} className="w-full h-24 object-cover rounded-lg bg-black"/>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end mt-4">
                    <button
                        type="submit"
                        disabled={mutation.isPending || (!content.trim() && files.length === 0)}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center"
                    >
                        {mutation.isPending && <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />}
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePostForm;