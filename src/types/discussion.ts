export type SortOption = 'new' | 'top';

export interface Post {
  id: string;
  content: string;
  tag: string;
  timestamp: number;
  score: number;
  votes: Record<string, 1 | -1 | 0>;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string; // ID of the parent comment, if this is a reply
  content: string;
  timestamp: number;
  score: number;
  votes: Record<string, 1 | -1 | 0>;
} 