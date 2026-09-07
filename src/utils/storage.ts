import { Note, Category, AppSettings } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, SAMPLE_NOTES } from '../data/defaultData';

const NOTES_KEY = 'quicknotes_notes_v1';
const CATEGORIES_KEY = 'quicknotes_categories_v1';
const SETTINGS_KEY = 'quicknotes_settings_v1';

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) {
      saveNotes(SAMPLE_NOTES);
      return SAMPLE_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return SAMPLE_NOTES;
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
    return SAMPLE_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error loading categories:', error);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function exportNotesJson(notes: Note[], categories: Category[]): void {
  const exportPayload = {
    app: 'QuickNotes',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalNotes: notes.length,
    categories,
    notes,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `quicknotes-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSingleNoteText(note: Note, categoryName?: string): void {
  const content = `Title: ${note.title}
Category: ${categoryName || note.categoryId}
Tags: ${note.tags.join(', ')}
Created: ${new Date(note.createdAt).toLocaleString()}
Last Edited: ${new Date(note.updatedAt).toLocaleString()}
Favorite: ${note.isFavorite ? 'Yes' : 'No'}

----------------------------------------

${note.content}
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeTitle = (note.title || 'Untitled Note').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  anchor.href = url;
  anchor.download = `${safeTitle}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  success: boolean;
  notesCount: number;
  categoriesCount: number;
  message: string;
  importedNotes?: Note[];
  importedCategories?: Category[];
}

export function parseImportJson(jsonText: string): ImportResult {
  try {
    const data = JSON.parse(jsonText);
    let importedNotes: Note[] = [];
    let importedCategories: Category[] = [];

    if (Array.isArray(data)) {
      // It's a direct array of notes
      importedNotes = data.filter((n) => n && typeof n.title === 'string' && typeof n.content === 'string');
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.notes)) {
        importedNotes = data.notes.filter((n) => n && typeof n.title === 'string' && typeof n.content === 'string');
      }
      if (Array.isArray(data.categories)) {
        importedCategories = data.categories.filter((c) => c && typeof c.id === 'string' && typeof c.name === 'string');
      }
    }

    if (importedNotes.length === 0 && importedCategories.length === 0) {
      return {
        success: false,
        notesCount: 0,
        categoriesCount: 0,
        message: 'No valid notes or categories found in the imported file.',
      };
    }

    // Ensure all notes have valid IDs and timestamps
    const sanitizedNotes: Note[] = importedNotes.map((n, idx) => ({
      id: n.id || `imported-${Date.now()}-${idx}`,
      title: n.title || 'Untitled Note',
      content: n.content || '',
      categoryId: n.categoryId || 'other',
      tags: Array.isArray(n.tags) ? n.tags.map(String) : [],
      isFavorite: Boolean(n.isFavorite),
      isPinned: Boolean(n.isPinned),
      color: n.color || undefined,
      createdAt: typeof n.createdAt === 'number' ? n.createdAt : Date.now(),
      updatedAt: typeof n.updatedAt === 'number' ? n.updatedAt : Date.now(),
    }));

    return {
      success: true,
      notesCount: sanitizedNotes.length,
      categoriesCount: importedCategories.length,
      message: `Successfully validated ${sanitizedNotes.length} note(s) and ${importedCategories.length} category(ies).`,
      importedNotes: sanitizedNotes,
      importedCategories: importedCategories.length > 0 ? importedCategories : undefined,
    };
  } catch (error) {
    return {
      success: false,
      notesCount: 0,
      categoriesCount: 0,
      message: 'Invalid JSON format. Please upload a valid QuickNotes backup file.',
    };
  }
}
