
export interface Narrative {
  id: number;
  title: string;
  writer: string;
  image: string;
  audioUrl: string;
  description: string;
  x: number; 
  y: number;
}

export interface VillageContext {
  name: string;
  location: string;
  story: string;
}

export interface Exhibition {
  id: string;
  slug: string;
  context: VillageContext;
  items: Narrative[];
  createdAt: number;
  aiIntro?: string;
}
