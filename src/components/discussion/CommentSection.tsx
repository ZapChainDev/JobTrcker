import React, { useState, useEffect } from 'react';
import { Comment } from '../../types/discussion';
import { getComments, createComment, createReply, voteComment } from '../../lib/firebase/discussion';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface CommentSectionProps {
  postId: string;
  onCommentAdded: () => void;
}

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Write a comment...",
  buttonText = "Post Comment",
  initialValue = ""
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200"
        rows={3}
        required
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Posting..." : buttonText}
        </button>
      </div>
    </form>
  );
};

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  onVote: (commentId: string, vote: 1 | -1 | 0) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  currentUser: any;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies,
  onVote,
  onReply,
  currentUser,
  level = 0
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const userVote = currentUser ? comment.votes[currentUser.uid] || 0 : 0;
  const maxNestingLevel = 3;

  // Get nested replies for this comment
  const nestedReplies = replies.filter(reply => reply.parentId === comment.id);

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex flex-col items-center space-y-1">
          <button
            onClick={() => onVote(comment.id, 1)}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 ${
              userVote === 1 ? 'text-orange-500' : 'text-gray-400'
            }`}
            aria-label="Upvote"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">{comment.score}</span>
          <button
            onClick={() => onVote(comment.id, -1)}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 ${
              userVote === -1 ? 'text-blue-500' : 'text-gray-400'
            }`}
            aria-label="Downvote"
          >
            <ArrowDownIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-base leading-relaxed">{comment.content}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
            </span>
            {currentUser && level < maxNestingLevel && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center transition-colors duration-200"
              >
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className={`ml-8 mt-2 ${level > 0 ? 'border-l-2 border-gray-100 pl-4' : ''}`}>
          <CommentForm
            onSubmit={async (content) => {
              await onReply(comment.id, content);
              setShowReplyForm(false);
            }}
            placeholder="Write a reply..."
            buttonText="Post Reply"
          />
        </div>
      )}

      {nestedReplies.length > 0 && (
        <div className={`ml-8 space-y-4 ${level > 0 ? 'border-l-2 border-gray-100 pl-4' : ''}`}>
          {nestedReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={replies}
              onVote={onVote}
              onReply={onReply}
              currentUser={currentUser}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await getComments(postId);
      setComments(fetchedComments);
      setError(null);
    } catch (err) {
      setError('Failed to load comments. Please try again.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (content: string) => {
    if (!currentUser) return;

    try {
      await createComment(postId, content);
      await fetchComments();
      onCommentAdded();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!currentUser) return;

    try {
      await createReply(postId, parentId, content);
      await fetchComments();
      onCommentAdded();
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply. Please try again.');
    }
  };

  const handleVote = async (commentId: string, vote: 1 | -1 | 0) => {
    if (!currentUser) return;
    try {
      await voteComment(commentId, currentUser.uid, vote);
      await fetchComments();
    } catch (err) {
      console.error('Error voting on comment:', err);
      setError('Failed to update vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">
        {error}
      </div>
    );
  }

  // Organize comments into a tree structure
  const rootComments = comments.filter(comment => !comment.parentId);
  const repliesByParentId = comments.reduce((acc, comment) => {
    if (comment.parentId) {
      if (!acc[comment.parentId]) {
        acc[comment.parentId] = [];
      }
      acc[comment.parentId].push(comment);
    }
    return acc;
  }, {} as Record<string, Comment[]>);

  return (
    <div className="space-y-6">
      <CommentForm
        onSubmit={handleSubmitComment}
        placeholder="Write a comment..."
        buttonText="Post Comment"
      />

      <div className="space-y-6">
        {rootComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={comments}
              onVote={handleVote}
              onReply={handleReply}
              currentUser={currentUser}
              level={0}
            />
          ))
        )}
      </div>
    </div>
  );
}; 