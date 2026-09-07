import React from 'react';
import {
  X,
  Edit3,
  Copy,
  Download,
  Trash2,
  Files,
  Star,
  Pin,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Note, Category } from '../types';
import { renderCategoryIcon } from '../utils/iconMap';
import { formatFullDateTime, getEstimatedReadingTime } from '../utils/date';

interface NoteDetailModalProps {
  note: Note | null;
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
  onToggleFavorite: (noteId: string) => void;
  onDuplicate: (note: Note) => void;
  onCopyContent: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onExportText: (note: Note) => void;
  onTagClick?: (tag: string) => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  category,
  isOpen,
  onClose,
  onEdit,
  onToggleFavorite,
  onDuplicate,
  onCopyContent,
  onDelete,
  onExportText,
  onTagClick,
}) => {
  if (!isOpen || !note) return null;

  const categoryColor = category?.color || '#6366f1';
  const categoryName = category?.name || 'General';
  const categoryIcon = category?.iconName || 'Folder';

  // Simple clean markdown-friendly line renderer
  const renderFormattedContent = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Heading 1 / 2 / 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-1.5">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
            {line.replace('# ', '')}
          </h2>
        );
      }

      // Checklist item
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
        const isChecked = line.startsWith('- [x] ') || line.startsWith('- [X] ');
        const text = line.replace(/^- \[( |x|X)\] /, '');
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1 text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={isChecked}
              readOnly
              className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-default"
            />
            <span className={isChecked ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
              {text}
            </span>
          </div>
        );
      }

      // Bullet item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-800 dark:text-slate-200 my-0.5">
            {line.replace(/^[-*] /, '')}
          </li>
        );
      }

      // Numbered item
      const numMatch = line.match(/^(\d+)\.\s(.*)$/);
      if (numMatch) {
        return (
          <div key={idx} className="ml-2 flex items-start gap-2 text-slate-800 dark:text-slate-200 my-0.5">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 min-w-[20px]">
              {numMatch[1]}.
            </span>
            <span>{numMatch[2]}</span>
          </div>
        );
      }

      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="pl-3.5 border-l-4 border-indigo-400 dark:border-indigo-600 italic text-slate-600 dark:text-slate-400 my-2"
          >
            {line.replace(/^>\s?/, '')}
          </blockquote>
        );
      }

      // Divider
      if (line.trim() === '---' || line.trim() === '***') {
        return <hr key={idx} className="my-4 border-slate-200 dark:border-slate-800" />;
      }

      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-3" />;
      }

      // Normal paragraph
      return (
        <p key={idx} className="text-slate-800 dark:text-slate-200 leading-relaxed my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div
      id="note-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="note-detail-modal"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg"
              style={{
                backgroundColor: `${categoryColor}18`,
                color: categoryColor,
              }}
            >
              {renderCategoryIcon(categoryIcon, { className: 'w-3.5 h-3.5' })}
              {categoryName}
            </span>
            {note.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg">
                <Pin className="w-3 h-3 rotate-45" /> Pinned
              </span>
            )}
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              id="detail-fav-btn"
              type="button"
              onClick={() => onToggleFavorite(note.id)}
              className={`p-2 rounded-xl transition-colors ${
                note.isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={note.isFavorite ? 'Remove favorite' : 'Add favorite'}
            >
              <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              id="detail-edit-btn"
              type="button"
              onClick={() => {
                onClose();
                onEdit(note);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Note"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              id="detail-copy-btn"
              type="button"
              onClick={() => onCopyContent(note)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy Content"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              id="detail-export-btn"
              type="button"
              onClick={() => onExportText(note)}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Export as Text (.txt)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              id="detail-delete-btn"
              type="button"
              onClick={() => {
                onClose();
                onDelete(note.id);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              id="detail-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {note.title || 'Untitled Note'}
          </h2>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {note.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onClose();
                    onTagClick?.(tag);
                  }}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="pt-2 text-sm sm:text-base leading-relaxed break-words font-normal">
            {renderFormattedContent(note.content)}
          </div>
        </div>

        {/* Footer Meta info */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Created {formatFullDateTime(note.createdAt)}
            </span>
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Updated {formatFullDateTime(note.updatedAt)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            {getEstimatedReadingTime(note.content)}
          </div>
        </div>
      </div>
    </div>
  );
};
