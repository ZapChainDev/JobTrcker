import React, { useState } from 'react';
import { Post } from '../../types/discussion';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { votePost } from '../../lib/firebase/discussion';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  onVote: (postId: string, vote: 1 | -1 | 0) => void;
  onCommentCountUpdate: (postId: string, increment: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onVote, onCommentCountUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const { currentUser } = useAuth();
  const userVote = currentUser ? post.votes[currentUser.uid] || 0 : 0;

  const handleVote = async (vote: 1 | -1 | 0) => {
    if (!currentUser) return;
    if (userVote === vote) {
      // If clicking the same vote button, remove the vote
      await votePost(post.id, currentUser.uid, 0);
      onVote(post.id, 0);
    } else {
      await votePost(post.id, currentUser.uid, vote);
      onVote(post.id, vote);
    }
  };

  const handleCommentAdded = () => {
    onCommentCountUpdate(post.id, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex flex-col items-center space-y-1">
            <button
              onClick={() => handleVote(1)}
              className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 ${
                userVote === 1 ? 'text-orange-500' : 'text-gray-400'
              }`}
              aria-label="Upvote"
            >
              <ArrowUpIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">{post.score}</span>
            <button
              onClick={() => handleVote(-1)}
              className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 ${
                userVote === -1 ? 'text-blue-500' : 'text-gray-400'
              }`}
              aria-label="Downvote"
            >
              <ArrowDownIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                #{post.tag}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(post.timestamp, { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-gray-900 text-base leading-relaxed mb-3">{post.content}</p>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ChatBubbleLeftIcon className="h-5 w-5 mr-1.5" />
              <span className="text-sm font-medium">{post.commentCount} comments</span>
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <div className="p-4">
            <CommentSection postId={post.id} onCommentAdded={handleCommentAdded} />
          </div>
        </div>
      )}
    </div>
  );
}; 