// Type definitions for the application

export interface University {
  name: string;
  slug: string;
  category: 'Federal' | 'State' | 'Private';
  url: string;
}

export interface JAMBUpdate {
  title: string;
  date: string;
  summary: string;
  link: string;
  category: string;
  deadline?: string | null;
}

export interface Update {
  id: string;
  title: string;
  summary: string;
  content?: string;
  date: string;
  link: string;
  source: string;
  sourceUrl?: string;
  sourceSlug?: string;
  category?: string;
  featured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Subscription {
  email: string;
  university: string;
  slug: string;
  createdAt: Date;
}

