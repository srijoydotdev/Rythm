// src/types/index.ts
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  filePath: string;
  genre: string;
  likes: number;
  plays: number;
  liked: boolean;
  lyrics?: string;
}

export interface Artist {
  id: string;
  name: string;
  cover: string;
  isFollowing: boolean;
}