import { Category, Note, AppSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'personal', name: 'Personal', iconName: 'User', color: '#6366f1' }, // Indigo
  { id: 'study', name: 'Study', iconName: 'BookOpen', color: '#0ea5e9' }, // Sky
  { id: 'work', name: 'Work', iconName: 'Briefcase', color: '#f59e0b' }, // Amber
  { id: 'ideas', name: 'Ideas', iconName: 'Lightbulb', color: '#ec4899' }, // Pink
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingBag', color: '#10b981' }, // Emerald
  { id: 'other', name: 'Other', iconName: 'Folder', color: '#8b5cf6' }, // Violet
];

export const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#0ea5e9', // Sky
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#64748b', // Slate
];

export const AVAILABLE_ICONS = [
  'User',
  'BookOpen',
  'Briefcase',
  'Lightbulb',
  'ShoppingBag',
  'Folder',
  'Star',
  'Heart',
  'Target',
  'Smile',
  'Bookmark',
  'Compass',
  'CheckSquare',
  'Coffee',
  'Globe',
];

const now = Date.now();
const oneDayAgo = now - 24 * 60 * 60 * 1000;
const twoDaysAgo = now - 48 * 60 * 60 * 1000;
const threeDaysAgo = now - 72 * 60 * 60 * 1000;

export const SAMPLE_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to QuickNotes! 📝',
    content: `Welcome to your new personal notes space. QuickNotes is built to be fast, responsive, and completely local.

Here is a quick overview of what you can do:
- **Instant Search**: Type keywords, titles, or tags in the search bar.
- **Categorize**: Group notes under Personal, Study, Work, Ideas, Shopping, or your own custom categories.
- **Tags & Favorites**: Add multiple tags and star important notes to reach them instantly.
- **Rich Organization**: Sort alphabetically or by newest updates, and switch between Grid and List layouts.
- **Privacy & Offline**: Everything is saved right on your browser via localStorage. Export backup files anytime from Settings!

Feel free to edit this note or create a fresh one by tapping "+ New Note"!`,
    categoryId: 'ideas',
    tags: ['welcome', 'guide', 'tips'],
    isFavorite: true,
    isPinned: true,
    createdAt: threeDaysAgo,
    updatedAt: now,
  },
  {
    id: 'note-study-plan',
    title: 'Semester Study Blueprint & References',
    content: `Core learning subjects for this term:
1. Data Structures & Algorithms
   - Master binary trees, graph algorithms, and dynamic programming
   - Complete 2 problem sets per week
2. Web Development Foundations
   - Modern React patterns & performance optimization
   - Accessible UI design & responsive layouts
3. Database Architecture
   - Indexing strategies and query optimization

Recommended reading: "Clean Code" and "Designing Data-Intensive Applications".`,
    categoryId: 'study',
    tags: ['study', 'cs', 'learning', 'books'],
    isFavorite: true,
    isPinned: false,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo + 3600000,
  },
  {
    id: 'note-product-ideas',
    title: 'Project Brainstorm: Minimalist Task Flow',
    content: `Key thoughts on designing a distraction-free tool:
- Keep the visual noise low: clean borders, high contrast, warm neutral tones.
- Offline-first approach with instant local storage syncing.
- Single-click actions for copying, duplicating, and archiving notes.
- Quick keyboard shortcuts (Ctrl+Enter to save, Esc to dismiss).`,
    categoryId: 'ideas',
    tags: ['ideas', 'design', 'ux', 'brainstorm'],
    isFavorite: false,
    isPinned: false,
    createdAt: oneDayAgo,
    updatedAt: oneDayAgo + 7200000,
  },
  {
    id: 'note-weekly-groceries',
    title: 'Weekend Grocery & Household Supplies',
    content: `Fresh Produce:
- Avocados (3)
- Spinach & baby kale mix
- Bananas & honeycrisp apples
- Lemons & fresh ginger root

Pantry:
- Olive oil (cold-pressed)
- Rolled oats
- Jasmine rice
- Almond milk (unsweetened)

Household:
- Dishwasher pods
- Recycled paper towels`,
    categoryId: 'shopping',
    tags: ['shopping', 'groceries', 'home'],
    isFavorite: false,
    isPinned: false,
    createdAt: now - 3600000 * 5,
    updatedAt: now - 3600000 * 5,
  },
  {
    id: 'note-personal-goals',
    title: 'Q3 Personal Milestones & Health Habits',
    content: `Daily Routines:
- 30 minutes morning walk or light jog
- 15 minutes mindfulness meditation or journaling
- Read 20 pages before sleep
- Drink 2.5L water daily

Quarterly Milestones:
- Complete TypeScript masterclass
- Organize digital files & desktop backups
- Plan autumn family hiking trip`,
    categoryId: 'personal',
    tags: ['goals', 'habits', 'health', 'personal'],
    isFavorite: true,
    isPinned: false,
    createdAt: now - 3600000 * 2,
    updatedAt: now - 3600000,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  defaultCategoryId: 'personal',
  viewMode: 'grid',
  defaultSort: 'newest_updated',
  autoSave: true,
};
