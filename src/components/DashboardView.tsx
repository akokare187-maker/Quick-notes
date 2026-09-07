import React from 'react';
import {
  FileText,
  Star,
  FolderTree,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Pin,
  CheckCircle2,
} from 'lucide-react';
import { Note, Category, ViewMode } from '../types';
import { NoteCard } from './NoteCard';
import { renderCategoryIcon } from '../utils/iconMap';

interface DashboardViewProps {
  notes: Note[];
  categories: Category[];
  viewMode: ViewMode;
  onOpenNewNote: () => void;
  onSelectNote: (note: Note) => void;
  onEditNote: (note: Note) => void;
  onToggleFavorite: (noteId: string) => void;
  onDuplicateNote: (note: Note) => void;
  onCopyContent: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onExportText: (note: Note) => void;
  onViewAllNotes: (categoryId?: string) => void;
  onViewFavorites: () => void;
  onTagClick?: (tag: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notes,
  categories,
  viewMode,
  onOpenNewNote,
  onSelectNote,
  onEditNote,
  onToggleFavorite,
  onDuplicateNote,
  onCopyContent,
  onDeleteNote,
  onExportText,
  onViewAllNotes,
  onViewFavorites,
  onTagClick,
}) => {
  const totalNotes = notes.length;
  const favoriteNotes = notes.filter((n) => n.isFavorite);
  const pinnedNotes = notes.filter((n) => n.isPinned);

  // Recent notes sorted by newest updatedAt
  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6);

  // Category map for rapid lookup
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div id="dashboard-view" className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium text-indigo-100 backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Quick & Offline Ready
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greetingTime()}! Ready to jot down ideas?
            </h1>
            <p className="mt-2 text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Capture your thoughts, organizing study notes, plans, and todos with instant offline local sync.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="dashboard-create-note-banner-btn"
              onClick={onOpenNewNote}
              className="px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ New Note</span>
            </button>
          </div>
        </div>

        {/* Decorative background ambient blur */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metric Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Notes */}
        <div
          id="stat-card-total"
          onClick={() => onViewAllNotes()}
          className="p-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Notes
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalNotes}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">saved</span>
          </div>
        </div>

        {/* Favorite Notes */}
        <div
          id="stat-card-favorites"
          onClick={onViewFavorites}
          className="p-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Favorites
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 group-hover:scale-110 transition-transform">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {favoriteNotes.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">starred</span>
          </div>
        </div>

        {/* Categories */}
        <div
          id="stat-card-categories"
          onClick={() => onViewAllNotes()}
          className="p-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Categories
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {categories.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">active</span>
          </div>
        </div>

        {/* Pinned / Priority */}
        <div
          id="stat-card-pinned"
          onClick={() => onViewAllNotes()}
          className="p-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pinned Notes
            </span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
              <Pin className="w-4 h-4 rotate-45" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {pinnedNotes.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">pinned</span>
          </div>
        </div>
      </div>

      {/* Pinned Notes Section (If any exist) */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 rotate-45" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Pinned Notes
              </h2>
            </div>
          </div>

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {pinnedNotes.map((note) => (
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
                onTagClick={onTagClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category Quick Pills Explorer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Explore by Category
          </h2>
          <button
            onClick={() => onViewAllNotes()}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All Categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const count = notes.filter((n) => n.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                id={`category-pill-${cat.id}`}
                onClick={() => onViewAllNotes(cat.id)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow transition-all text-left group"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                  }}
                >
                  {renderCategoryIcon(cat.iconName, { className: 'w-4 h-4' })}
                </div>
                <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {cat.name}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {count} {count === 1 ? 'note' : 'notes'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recently Created / Edited Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recently Updated Notes
            </h2>
          </div>
          <button
            id="dashboard-view-all-notes-btn"
            onClick={() => onViewAllNotes()}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            All Notes ({notes.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No notes created yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Start building your knowledge base, shopping lists, study references, or daily ideas.
            </p>
            <button
              onClick={onOpenNewNote}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-700 shadow-sm"
            >
              + Create First Note
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {recentNotes.map((note) => (
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
                onTagClick={onTagClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
