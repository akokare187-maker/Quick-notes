export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  isFavorite: boolean;
  isPinned?: boolean;
  color?: string; // Optional custom color accent
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isCustom?: boolean;
}

export type SortOption =
  | 'newest_created'
  | 'newest_updated'
  | 'oldest'
  | 'alphabetical_asc'
  | 'alphabetical_desc';

export type ViewMode = 'grid' | 'list';

export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  theme: ThemeMode;
  defaultCategoryId: string;
  viewMode: ViewMode;
  defaultSort: SortOption;
  autoSave: boolean;
}

export type NavTab = 'home' | 'all' | 'favorites' | 'categories' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
