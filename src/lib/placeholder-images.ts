import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// This constant is no longer used by the landing page,
// but is kept for potential use in other parts of the app.
export const placeholderImages: ImagePlaceholder[] = data.placeholderImages;
