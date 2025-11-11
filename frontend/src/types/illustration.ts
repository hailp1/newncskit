/**
 * Illustration types for authentication pages
 */

export type IllustrationType = 'chart' | 'feature' | 'testimonial';

export interface IllustrationSlide {
  id: string;
  type: IllustrationType;
  title: string;
  description: string;
  content: React.ReactNode;
}

export interface IllustrationContent {
  login: IllustrationSlide[];
  register: IllustrationSlide[];
}
