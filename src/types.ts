export type Page = "home" | "feed" | "messenger" | "profile" | "account" | "admin";

export interface Notification {
  id: number;
  type: "message" | "comment" | "reaction" | "follow";
  text: string;
  time: string;
  read: boolean;
  avatar: string;
}

export interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  liked: boolean;
  tag: string;
}

export interface Message {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
  online: boolean;
  unread: number;
}

export const NOTIFICATIONS: Notification[] = [];
export const POSTS: Post[] = [];
export const MESSAGES: Message[] = [];
