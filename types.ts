
export interface Product {
  id: string;
  name: string;
  price: number;
  shortStory: string;
  fullStory: string;
  makerName: string;
  makerStory: string;
  region: string;
  regionInfo: string;
  materialInfo: string;
  usageTips: string;
  videoUrl: string;
  thumbnailUrl: string;
  images: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type View = 'top' | 'collection' | 'stories' | 'chat' | 'detail';
