import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  username: string;
  email: string;
  profilePicture: string | null;
  spotsCount: number;
  createdAt: Timestamp;
}

export interface Spot {
  id: string;
  title: string;
  description: string;
  category: string;
  photos: string[];
  coverImage: string;
  bestTime: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  ownerId: string;
  ownerUsername: string;
  ownerAvatar: string | null;
  favoritesCount: number;
  views: number;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FavoriteEntry {
  spotId: string;
  spotTitle: string;
  spotCoverImage: string;
  spotCategory: string;
  addedAt: Timestamp;
}

export interface SpotFormData {
  title: string;
  description: string;
  category: string;
  bestTime: string;
  photos: string[]; // Local URIs before upload
  location: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
}

export type ShareMode = 'story' | 'native' | 'save' | 'original';
