import React, { useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Star,
  X,
  Plus,
  FileQuestion,
  Tag,
} from 'lucide-react';
import { Note, Category, SortOption, ViewMode } from '../types';
import { NoteCard } from './NoteCard';
import { renderCategoryIcon } from '../utils/iconMap';

interface NotesListViewProps {
  notes: Note[];
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  onOpenNewNote: () => void;
  onSelectNote: (note: Note) => void;
  onEditNote: (note: Note) => void;
  onToggleFavorite: (noteId: string) => void;
  onDuplicateNote: (note: Note) => void;
  onCopyContent: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onExportText: (note: Note) => void;
  titleOverride?: string;
}

export const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  onlyFavorites,
  onToggleOnlyFavorites,
  sortBy,
  onSortChange,
  viewMode,
  onToggleViewMode,
  onOpenNewNote,
  onSelectNote,
  onEditNote,
  onToggleFavorite,
  onDuplicateNote,
  onCopyContent,
  onDeleteNote,
  onExportText,
  titleOverride,
}) => {
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Extract all unique tags across notes with frequency
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    notes.forEach((n) => {
      n.tags?.forEach((t) => {
        map.set(t, (map.get(t) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [notes]);

  // Filter and Sort Notes
  const filteredAndSortedNotes = useMemo(() => {
    let result = notes.filter((note) => {
      // Favorites filter
      if (onlyFavorites && !note.isFavorite) {
        return false;
      }

      // Category filter
      if (selectedCategory && note.categoryId !== selectedCategory) {
        return false;
      }

      // Tag filter
      if (selectedTag && !note.tags.includes(selectedTag)) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = note.title.toLowerCase().includes(query);
        const contentMatch = note.content.toLowerCase().includes(query);
        const tagMatch = note.tags.some((t) => t.toLowerCase().includes(query));
        const category = categoryMap.get(note.categoryId);
        const categoryMatch = category?.name.toLowerCase().includes(query);

        if (!titleMatch && !contentMatch && !tagMatch && !categoryMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      // Keep pinned notes at the top unless sorting strictly alphabetical
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortBy) {
        case 'newest_updated':
          return b.updatedAt - a.updatedAt;
        case 'newest_created':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'alphabetical_asc':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        case 'alphabetical_desc':
          return b.title.localeCompare(a.title, undefined, { sensitivity: 'base' });
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

    return result;
  }, [notes, onlyFavorites, selectedCategory, selectedTag, searchQuery, sortBy, categoryMap]);

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(selectedTag) ||
    onlyFavorites ||
    Boolean(searchQuery.trim());

  const resetAllFilters = () => {
    onSelectCategory(null);
    onSelectTag(null);
    onSearchChange('');
    if (onlyFavorites && !titleOverride) {
      onToggleOnlyFavorites();
    }
  };

  return (
    <div id="notes-list-view" className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {titleOverride || 'All Notes'}
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              {filteredAndSortedNotes.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {hasActiveFilters
              ? 'Filtered results based on your active criteria'
              : 'Browse, manage, search, and organize your personal notes library.'}
          </p>
        </div>

        {/* Action Controls: View Switcher, Sort Dropdown, New Note */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              id="view-mode-grid-btn"
              type="button"
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list-btn"
              type="button"
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <select
              id="notes-sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="text-xs font-semibold pl-8 pr-7 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 appearance-none outline-none cursor-pointer focus:border-indigo-500 shadow-sm"
            >
              <option value="newest_updated">Recently Edited</option>
              <option value="newest_created">Newest Created</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical_asc">Title (A to Z)</option>
              <option value="alphabetical_desc">Title (Z to A)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          </div>

          {/* + New Note Button */}
          <button
            id="notes-list-new-note-btn"
            type="button"
            onClick={onOpenNewNote}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          id="filter-category-all-btn"
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
            selectedCategory === null
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          All Categories ({notes.length})
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = notes.filter((n) => n.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              id={`filter-category-${cat.id}-btn`}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
              />
              <span>{cat.name}</span>
              <span
                className={`text-[10px] ${
                  isSelected ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Tags & Active Filter Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Tag chips scroll */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            {allTags.slice(0, 8).map(({ tag, count }) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  id={`tag-filter-${tag}`}
                  type="button"
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`text-xs px-2.5 py-0.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  #{tag} <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Clear Filters Reset Button */}
        {hasActiveFilters && (
          <button
            id="clear-all-filters-btn"
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium ml-auto"
          >
            <X className="w-3.5 h-3.5" /> Clear All Filters
          </button>
        )}
      </div>

      {/* Main Notes Content Grid / List */}
      {filteredAndSortedNotes.length === 0 ? (
        /* Empty State */
        <div
          id="notes-empty-state"
          className="p-12 text-center bg-white dark:bg-slate-800/70 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {hasActiveFilters ? 'No matching notes found' : 'No notes in this view'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {hasActiveFilters
                ? 'Try adjusting your search terms, removing tag or category filters.'
                : 'Get started right away by capturing your ideas, reminders, or lists.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Reset Filters
              </button>
            ) : null}

            <button
              id="empty-state-new-note-btn"
              type="button"
              onClick={onOpenNewNote}
              className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          id="notes-container"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5'
              : 'space-y-3'
          }
        >
          {filteredAndSortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              category={categoryMap.get(note.categoryId)}
              viewMode={viewMode}
              onSelect={onSelectNote}
              onEdit={onEditNote}
              onToggleFavorite={onToggleFavorite}
              onDuplicate={onDuplicateNote}
              onCopyContent={onCopyContent}
              onDelete={onDeleteNote}
              onExportText={onExportText}
              onTagClick={onSelectTag}
            />
          ))}
        </div>
      )}
    </div>
  );
};
