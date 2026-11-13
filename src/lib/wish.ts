// Shared between client and server: shape and limits of a wish.

export type Wish = {
  id: string;
  name: string;
  message: string;
  photoUrl: string;
  createdAt: string;
};

export const LIMITS = {
  name: 40,
  message: 280,
  photoBytes: 2 * 1024 * 1024,
} as const;

export const PHOTO_TYPES = ["image/jpeg", "image/webp", "image/png"] as const;
