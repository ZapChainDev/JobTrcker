import React, { useState, useEffect } from 'react';
import { Post } from '../../types/discussion';
import { getPosts, createPost, votePost } from '../../lib/firebase/discussion';
import { useAuth } from '../../contexts/AuthContext';
import { PostCard } from './PostCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle } from 'lucide-react';

export const DiscussionBoard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [tag, setTag] = useState('');
  const [sortBy, setSortBy] = useState<'new' | 'top'>('new');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [sortBy]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await getPosts(sortBy);
      setPosts(fetchedPosts);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPost.trim() || !tag.trim()) return;

    try {
      setError(null);
      await createPost(newPost.trim(), tag.trim());
      setNewPost('');
      setTag('');
      await loadPosts();
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    }
  };

  const handleVote = async (postId: string, vote: 1 | -1 | 0) => {
    if (!currentUser) return;
    try {
      await votePost(postId, currentUser.uid, vote);
      await loadPosts();
    } catch (err) {
      console.error('Error voting on post:', err);
    }
  };

  const handleCommentCountUpdate = (postId: string, increment: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          commentCount: post.commentCount + increment
        };
      }
      return post;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="text-blue-800 font-medium mb-1">Anonymous Discussion</h3>
            <p className="text-blue-700 text-sm">
              This discussion board is completely anonymous. Your identity is never revealed, and all posts and comments are made without any personal information. Feel free to express yourself freely and respectfully.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Enter a tag (e.g., career, interview, salary)"
              className="w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="post" className="block text-sm font-medium text-gray-700 mb-1">
              Post
            </label>
            <textarea
              id="post"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
              disabled={!currentUser}
            >
              Post
            </Button>
          </div>
        </form>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Discussions</h2>
        <Select value={sortBy} onValueChange={(value: 'new' | 'top') => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Newest First</SelectItem>
            <SelectItem value="top">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No posts yet. Be the first to start a discussion!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
              onCommentCountUpdate={handleCommentCountUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 