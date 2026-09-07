import React, { useState } from 'react';
import {
  Star,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Files,
  Download,
  Pin,
  Clock,
} from 'lucide-react';
import { Note, Category, ViewMode } from '../types';
import { renderCategoryIcon } from '../utils/iconMap';
import { formatRelativeTime } from '../utils/date';

interface NoteCardProps {
  note: Note;
  category?: Category;
  viewMode: ViewMode;
  onSelect: (note: Note) => void;
  onEdit: (note: Note) => void;
  onToggleFavorite: (noteId: string) => void;
  onDuplicate: (note: Note) => void;
  onCopyContent: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onExportText: (note: Note) => void;
  onTagClick?: (tag: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  category,
  viewMode,
  onSelect,
  onEdit,
  onToggleFavorite,
  onDuplicate,
  onCopyContent,
  onDelete,
  onExportText,
  onTagClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const categoryColor = category?.color || '#6366f1';
  const categoryName = category?.name || 'General';
  const categoryIcon = category?.iconName || 'Folder';

  // Format excerpt: clean up markdown symbols for preview
  const plainTextPreview = note.content
    .replace(/[#*`_~>-]/g, '')
    .replace(/\[ \]|\[x\]/gi, '•')
    .trim();

  if (viewMode === 'list') {
    return (
      <div
        id={`note-row-${note.id}`}
        onClick={() => onSelect(note)}
        className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <button
            id={`note-star-list-${note.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              note.isFavorite
                ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {note.isPinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                  <Pin className="w-3 h-3 rotate-45" /> Pinned
                </span>
              )}
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {note.title || 'Untitled Note'}
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full shrink-0"
                style={{
                  backgroundColor: `${categoryColor}18`,
                  color: categoryColor,
                }}
              >
                {renderCategoryIcon(categoryIcon, { className: 'w-3 h-3' })}
                {categoryName}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {plainTextPreview || <span className="italic text-slate-400">Empty note...</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60">
          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick?.(tag);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[10px] text-slate-400">+{note.tags.length - 2}</span>
              )}
            </div>
          )}

          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(note.updatedAt)}
          </span>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              id={`note-edit-btn-list-${note.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Edit Note"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`note-copy-btn-list-${note.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onCopyContent(note);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Copy Content"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              id={`note-delete-btn-list-${note.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      id={`note-card-${note.id}`}
      onClick={() => onSelect(note)}
      className="group relative flex flex-col justify-between p-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-400/80 dark:hover:border-indigo-500/80 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Top Accent Strip with subtle gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 transition-opacity"
        style={{
          backgroundColor: note.color || categoryColor,
        }}
      />

      <div>
        {/* Card Header: Category badge, pinned flag, favorite star, options menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0"
            style={{
              backgroundColor: `${categoryColor}18`,
              color: categoryColor,
            }}
          >
            {renderCategoryIcon(categoryIcon, { className: 'w-3.5 h-3.5' })}
            {categoryName}
          </span>

          <div className="flex items-center gap-1">
            {note.isPinned && (
              <span
                className="p-1 text-indigo-600 dark:text-indigo-400"
                title="Pinned note"
              >
                <Pin className="w-3.5 h-3.5 rotate-45" />
              </span>
            )}

            <button
              id={`note-star-${note.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                note.isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle favorite"
            >
              <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Menu Dropdown Toggle */}
            <div className="relative">
              <button
                id={`note-menu-trigger-${note.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div
                    id={`note-menu-dropdown-${note.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-8 z-30 w-44 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95"
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(note);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-500" /> Edit Note
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onCopyContent(note);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Content
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDuplicate(note);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                    >
                      <Files className="w-3.5 h-3.5 text-emerald-500" /> Duplicate
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onExportText(note);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-500" /> Export (.txt)
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(note.id);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Note
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {note.title || 'Untitled Note'}
        </h3>

        {/* Note Excerpt Preview */}
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed font-normal whitespace-pre-line">
          {plainTextPreview || (
            <span className="italic text-slate-400 dark:text-slate-500">No content yet...</span>
          )}
        </p>
      </div>

      {/* Card Footer: Tags & Timestamp */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(note.updatedAt)}
          </span>
          <span className="text-[11px] opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 font-medium transition-opacity">
            Click to view →
          </span>
        </div>
      </div>
    </div>
  );
};
