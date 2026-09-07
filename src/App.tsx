/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Note,
  Category,
  AppSettings,
  NavTab,
  ToastMessage,
  ViewMode,
  SortOption,
} from './types';
import {
  loadNotes,
  saveNotes,
  loadCategories,
  saveCategories,
  loadSettings,
  saveSettings,
  exportNotesJson,
  exportSingleNoteText,
} from './utils/storage';
import { SAMPLE_NOTES, DEFAULT_CATEGORIES } from './data/defaultData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { NotesListView } from './components/NotesListView';
import { CategoriesView } from './components/CategoriesView';
import { SettingsView } from './components/SettingsView';
import { NoteEditorModal } from './components/NoteEditorModal';
import { NoteDetailModal } from './components/NoteDetailModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast } from './components/Toast';

export default function App() {
  // Core Persistent State
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // UI Navigation & Filters State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals State
  const [editorModal, setEditorModal] = useState<{
    isOpen: boolean;
    note: Partial<Note> | null;
  }>({
    isOpen: false,
    note: null,
  });

  const [detailModalNote, setDetailModalNote] = useState<Note | null>(null);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync dark/light theme to document HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist notes changes
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist categories changes
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  // Persist settings changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.tagName === 'SELECT';

      if (!isInput) {
        if (e.key === '/' && !editorModal.isOpen && !detailModalNote) {
          e.preventDefault();
          document.getElementById('navbar-search-input')?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorModal.isOpen, detailModalNote]);

  // Handler: Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings((prev) => ({ ...prev, theme: nextTheme }));
    addToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
  };

  // Handler: Open New Note Editor
  const handleOpenNewNote = (prefillCategoryId?: string) => {
    setEditorModal({
      isOpen: true,
      note: {
        title: '',
        content: '',
        categoryId: prefillCategoryId || selectedCategoryFilter || settings.defaultCategoryId,
        tags: selectedTagFilter ? [selectedTagFilter] : [],
        isFavorite: false,
        isPinned: false,
      },
    });
  };

  // Handler: Open Existing Note Editor
  const handleEditNote = (note: Note) => {
    setDetailModalNote(null);
    setEditorModal({
      isOpen: true,
      note,
    });
  };

  // Handler: Save Note (New or Updated)
  const handleSaveNote = (noteData: Omit<Note, 'id'> & { id?: string }) => {
    if (noteData.id) {
      // Update existing
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteData.id
            ? {
                ...n,
                ...noteData,
                updatedAt: Date.now(),
              }
            : n
        )
      );
      addToast('Note updated successfully');
    } else {
      // Create new
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        categoryId: noteData.categoryId || settings.defaultCategoryId,
        tags: noteData.tags || [],
        isFavorite: Boolean(noteData.isFavorite),
        isPinned: Boolean(noteData.isPinned),
        color: noteData.color,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      addToast('New note created');
    }

    setEditorModal({ isOpen: false, note: null });
  };

  // Handler: Toggle Favorite
  const handleToggleFavorite = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          const nextFav = !n.isFavorite;
          addToast(
            nextFav ? 'Added to favorites ⭐' : 'Removed from favorites',
            'info'
          );
          return { ...n, isFavorite: nextFav, updatedAt: Date.now() };
        }
        return n;
      })
    );

    // Also update detail modal if open
    if (detailModalNote && detailModalNote.id === noteId) {
      setDetailModalNote((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  // Handler: Duplicate Note
  const handleDuplicateNote = (note: Note) => {
    const duplicated: Note = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: `${note.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [duplicated, ...prev]);
    addToast('Note duplicated');
  };

  // Handler: Copy Note Content to Clipboard
  const handleCopyContent = async (note: Note) => {
    try {
      const fullText = `${note.title}\n\n${note.content}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      addToast('Note copied to clipboard 📋');
    } catch (err) {
      addToast('Failed to copy note text', 'error');
    }
  };

  // Handler: Delete Note with confirmation
  const handleDeleteNote = (noteId: string) => {
    const targetNote = notes.find((n) => n.id === noteId);
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Note',
      message: `Are you sure you want to delete "${targetNote?.title || 'this note'}"? This action cannot be undone.`,
      confirmText: 'Delete Note',
      isDestructive: true,
      onConfirm: () => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        if (detailModalNote?.id === noteId) {
          setDetailModalNote(null);
        }
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        addToast('Note deleted', 'info');
      },
    });
  };

  // Handler: Export Single Note as .txt
  const handleExportText = (note: Note) => {
    const category = categories.find((c) => c.id === note.categoryId);
    exportSingleNoteText(note, category?.name);
    addToast('Note exported as text file', 'info');
  };

  // Handler: Export All Notes as JSON Backup
  const handleExportAllJson = () => {
    exportNotesJson(notes, categories);
    addToast(`Exported ${notes.length} note(s) as JSON backup`);
  };

  // Handler: Import Notes
  const handleImportNotes = (
    importedNotes: Note[],
    importedCategories?: Category[],
    mode: 'merge' | 'replace' = 'merge'
  ) => {
    if (mode === 'replace') {
      setNotes(importedNotes);
      if (importedCategories && importedCategories.length > 0) {
        setCategories(importedCategories);
      }
      addToast(`Replaced library with ${importedNotes.length} imported note(s)`);
    } else {
      // Merge: Avoid exact id collisions
      const existingIds = new Set(notes.map((n) => n.id));
      const adjustedImported = importedNotes.map((n) =>
        existingIds.has(n.id)
          ? { ...n, id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
          : n
      );
      setNotes((prev) => [...adjustedImported, ...prev]);

      if (importedCategories && importedCategories.length > 0) {
        const existingCatIds = new Set(categories.map((c) => c.id));
        const newCats = importedCategories.filter((c) => !existingCatIds.has(c.id));
        if (newCats.length > 0) {
          setCategories((prev) => [...prev, ...newCats]);
        }
      }

      addToast(`Merged ${importedNotes.length} note(s) into your notebook`);
    }
  };

  // Handler: Create Category
  const handleCreateCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
    addToast(`Category "${newCat.name}" created`);
    return newCat.id;
  };

  // Handler: Update Category
  const handleUpdateCategory = (updatedCat: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
    addToast(`Category "${updatedCat.name}" updated`);
  };

  // Handler: Delete Category
  const handleDeleteCategory = (categoryId: string) => {
    const targetCat = categories.find((c) => c.id === categoryId);
    const affectedNotesCount = notes.filter((n) => n.categoryId === categoryId).length;

    setConfirmModalState({
      isOpen: true,
      title: 'Delete Category',
      message: `Delete category "${targetCat?.name || ''}"? ${
        affectedNotesCount > 0
          ? `${affectedNotesCount} note(s) in this category will be reassigned to "Other".`
          : ''
      }`,
      confirmText: 'Delete Category',
      isDestructive: true,
      onConfirm: () => {
        // Reassign affected notes to 'other'
        setNotes((prev) =>
          prev.map((n) => (n.categoryId === categoryId ? { ...n, categoryId: 'other' } : n))
        );
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        if (selectedCategoryFilter === categoryId) {
          setSelectedCategoryFilter(null);
        }
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        addToast('Category deleted');
      },
    });
  };

  // Handler: Delete All Notes (Danger Zone)
  const handleRequestDeleteAll = () => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete ALL Notes?',
      message: `This will permanently remove all ${notes.length} notes from local storage. This action cannot be reversed unless you have a backup.`,
      confirmText: 'Delete Everything',
      isDestructive: true,
      onConfirm: () => {
        setNotes([]);
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        addToast('All notes have been erased', 'warning');
      },
    });
  };

  // Handler: Restore Sample Notes
  const handleRestoreSampleData = () => {
    setConfirmModalState({
      isOpen: true,
      title: 'Restore Sample Notes?',
      message: 'This will reset your notebook with initial helpful guide notes and standard categories.',
      confirmText: 'Restore Samples',
      isDestructive: false,
      onConfirm: () => {
        setNotes(SAMPLE_NOTES);
        setCategories(DEFAULT_CATEGORIES);
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        addToast('Sample notes restored');
      },
    });
  };

  // Filter jump from dashboard or categories
  const handleViewAllNotes = (catId?: string) => {
    setSelectedCategoryFilter(catId || null);
    setSelectedTagFilter(null);
    setCurrentTab('all');
  };

  const handleViewFavorites = () => {
    setSelectedCategoryFilter(null);
    setSelectedTagFilter(null);
    setCurrentTab('favorites');
  };

  const handleTagClick = (tag: string) => {
    setSelectedTagFilter(tag);
    setCurrentTab('all');
  };

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'all') setSelectedCategoryFilter(null);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewNote={() => handleOpenNewNote()}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        isMobileMenuOpen={isMobileSidebarOpen}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Sidebar (Desktop & Tablet + Mobile Drawer) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          categories={categories}
          notes={notes}
          selectedCategoryFilter={selectedCategoryFilter}
          onSelectCategoryFilter={setSelectedCategoryFilter}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 py-6 md:pl-8 min-w-0 pb-20 md:pb-12">
          {/* TAB 1: HOME (DASHBOARD) */}
          {currentTab === 'home' && (
            <DashboardView
              notes={notes}
              categories={categories}
              viewMode={settings.viewMode}
              onOpenNewNote={() => handleOpenNewNote()}
              onSelectNote={setDetailModalNote}
              onEditNote={handleEditNote}
              onToggleFavorite={handleToggleFavorite}
              onDuplicateNote={handleDuplicateNote}
              onCopyContent={handleCopyContent}
              onDeleteNote={handleDeleteNote}
              onExportText={handleExportText}
              onViewAllNotes={handleViewAllNotes}
              onViewFavorites={handleViewFavorites}
              onTagClick={handleTagClick}
            />
          )}

          {/* TAB 2: ALL NOTES */}
          {currentTab === 'all' && (
            <NotesListView
              notes={notes}
              categories={categories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={setSelectedCategoryFilter}
              selectedTag={selectedTagFilter}
              onSelectTag={setSelectedTagFilter}
              onlyFavorites={false}
              onToggleOnlyFavorites={() => setCurrentTab('favorites')}
              sortBy={settings.defaultSort}
              onSortChange={(sort) => setSettings((s) => ({ ...s, defaultSort: sort }))}
              viewMode={settings.viewMode}
              onToggleViewMode={(mode) => setSettings((s) => ({ ...s, viewMode: mode }))}
              onOpenNewNote={() => handleOpenNewNote()}
              onSelectNote={setDetailModalNote}
              onEditNote={handleEditNote}
              onToggleFavorite={handleToggleFavorite}
              onDuplicateNote={handleDuplicateNote}
              onCopyContent={handleCopyContent}
              onDeleteNote={handleDeleteNote}
              onExportText={handleExportText}
            />
          )}

          {/* TAB 3: FAVORITES */}
          {currentTab === 'favorites' && (
            <NotesListView
              notes={notes}
              categories={categories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={setSelectedCategoryFilter}
              selectedTag={selectedTagFilter}
              onSelectTag={setSelectedTagFilter}
              onlyFavorites={true}
              onToggleOnlyFavorites={() => setCurrentTab('all')}
              sortBy={settings.defaultSort}
              onSortChange={(sort) => setSettings((s) => ({ ...s, defaultSort: sort }))}
              viewMode={settings.viewMode}
              onToggleViewMode={(mode) => setSettings((s) => ({ ...s, viewMode: mode }))}
              onOpenNewNote={() => handleOpenNewNote()}
              onSelectNote={setDetailModalNote}
              onEditNote={handleEditNote}
              onToggleFavorite={handleToggleFavorite}
              onDuplicateNote={handleDuplicateNote}
              onCopyContent={handleCopyContent}
              onDeleteNote={handleDeleteNote}
              onExportText={handleExportText}
              titleOverride="Starred Notes"
            />
          )}

          {/* TAB 4: CATEGORIES */}
          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              notes={notes}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onSelectCategory={(catId) => handleViewAllNotes(catId)}
            />
          )}

          {/* TAB 5: SETTINGS */}
          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              categories={categories}
              notes={notes}
              onExportAllJson={handleExportAllJson}
              onImportNotes={handleImportNotes}
              onRestoreSampleData={handleRestoreSampleData}
              onRequestDeleteAll={handleRequestDeleteAll}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'all') setSelectedCategoryFilter(null);
        }}
        onOpenNewNote={() => handleOpenNewNote()}
        totalNotes={notes.length}
        favoritesCount={notes.filter((n) => n.isFavorite).length}
      />

      {/* Note Editor Modal (Create & Edit) */}
      <NoteEditorModal
        isOpen={editorModal.isOpen}
        noteToEdit={editorModal.note}
        categories={categories}
        defaultCategoryId={settings.defaultCategoryId}
        onSave={handleSaveNote}
        onClose={() => setEditorModal({ isOpen: false, note: null })}
        onDelete={handleDeleteNote}
        onDuplicate={handleDuplicateNote}
        onCreateCategory={(name) => {
          const id = handleCreateCategory({
            name,
            color: '#6366f1',
            iconName: 'Folder',
            isCustom: true,
          });
          return id;
        }}
      />

      {/* Note Detailed Viewer Modal */}
      <NoteDetailModal
        note={detailModalNote}
        category={detailModalNote ? categoryMap.get(detailModalNote.categoryId) : undefined}
        isOpen={Boolean(detailModalNote)}
        onClose={() => setDetailModalNote(null)}
        onEdit={handleEditNote}
        onToggleFavorite={handleToggleFavorite}
        onDuplicate={handleDuplicateNote}
        onCopyContent={handleCopyContent}
        onDelete={handleDeleteNote}
        onExportText={handleExportText}
        onTagClick={handleTagClick}
      />

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        isDestructive={confirmModalState.isDestructive}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating Action Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
