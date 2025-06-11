import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, query, orderBy, getDocs, increment, arrayUnion, arrayRemove, where, getDoc } from 'firebase/firestore';
import { Post, Comment, SortOption } from '../../types/discussion';

const POSTS_COLLECTION = 'posts';
const COMMENTS_COLLECTION = 'comments';

export const createPost = async (content: string, tag: string): Promise<string> => {
  const post: Omit<Post, 'id'> = {
    content,
    tag,
    timestamp: Date.now(),
    score: 0,
    votes: {},
    commentCount: 0
  };

  const docRef = await addDoc(collection(db, POSTS_COLLECTION), post);
  return docRef.id;
};

export const createComment = async (postId: string, content: string): Promise<string> => {
  const comment: Omit<Comment, 'id'> = {
    postId,
    content,
    timestamp: Date.now(),
    score: 0,
    votes: {}
  };

  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), comment);
  
  // Update post's comment count
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, {
    commentCount: increment(1)
  });

  return docRef.id;
};

export const createReply = async (postId: string, parentId: string, content: string): Promise<string> => {
  const reply: Omit<Comment, 'id'> = {
    postId,
    parentId,
    content,
    timestamp: Date.now(),
    score: 0,
    votes: {}
  };

  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), reply);
  
  // Update post's comment count
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, {
    commentCount: increment(1)
  });

  return docRef.id;
};

export const votePost = async (postId: string, userId: string, vote: 1 | -1 | 0) => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const postDoc = await getDoc(postRef);
  
  if (!postDoc.exists()) {
    throw new Error('Post not found');
  }
  
  const post = postDoc.data() as Post;
  const currentVote = post.votes[userId] || 0;
  const voteDiff = vote - currentVote;
  
  await updateDoc(postRef, {
    score: increment(voteDiff),
    [`votes.${userId}`]: vote
  });
};

export const voteComment = async (commentId: string, userId: string, vote: 1 | -1 | 0) => {
  const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
  const commentDoc = await getDoc(commentRef);
  
  if (!commentDoc.exists()) {
    throw new Error('Comment not found');
  }
  
  const comment = commentDoc.data() as Comment;
  const currentVote = comment.votes[userId] || 0;
  const voteDiff = vote - currentVote;
  
  await updateDoc(commentRef, {
    score: increment(voteDiff),
    [`votes.${userId}`]: vote
  });
};

export const getPosts = async (sortBy: SortOption = 'new'): Promise<Post[]> => {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy(sortBy === 'new' ? 'timestamp' : 'score', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  // First get all comments for the post
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('postId', '==', postId)
  );
  
  const querySnapshot = await getDocs(q);
  const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
  
  // Sort comments by timestamp in memory
  return comments.sort((a, b) => b.timestamp - a.timestamp);
}; 