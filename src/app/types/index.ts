export interface Song {
  id: string;
  title: string;
  artistId: string;
  duration: number;
  cover?: string;
  artist: string; 
  audio: string; 
  coverVideo?: string | null; 
  userId: string; 
  lyrics?: string;
  filePath: string;
  genre?: string | null;
  createdAt: string;
  plays: number;
  liked: boolean;
  likes: number;
}

export interface Artist {
  id: string;
  name: string;
  cover: string;
  isFollowing: boolean;
}

export interface Playlist {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  description?: string | null;
  isPublic: boolean;
  songs: {
    song: Song;
    addedAt: string;
    order: number;
  }[];
}

