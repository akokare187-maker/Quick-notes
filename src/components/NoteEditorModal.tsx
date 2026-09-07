import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Star,
  Pin,
  Tag,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Sparkles,
  Palette,
  Trash2,
  Files,
  Plus,
} from 'lucide-react';
import { Note, Category } from '../types';
import { renderCategoryIcon } from '../utils/iconMap';
import { CATEGORY_COLORS } from '../data/defaultData';
import { formatFullDateTime, getEstimatedReadingTime } from '../utils/date';

interface NoteEditorModalProps {
  isOpen: boolean;
  noteToEdit: Partial<Note> | null;
  categories: Category[];
  defaultCategoryId: string;
  onSave: (note: Omit<Note, 'id'> & { id?: string }) => void;
  onClose: () => void;
  onDelete?: (noteId: string) => void;
  onDuplicate?: (note: Note) => void;
  onCreateCategory?: (name: string) => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  noteToEdit,
  categories,
  defaultCategoryId,
  onSave,
  onClose,
  onDelete,
  onDuplicate,
  onCreateCategory,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId || 'personal');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when modal opens or noteToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (noteToEdit && noteToEdit.id) {
        setTitle(noteToEdit.title || '');
        setContent(noteToEdit.content || '');
        setCategoryId(noteToEdit.categoryId || defaultCategoryId || 'personal');
        setTags(noteToEdit.tags ? [...noteToEdit.tags] : []);
        setIsFavorite(Boolean(noteToEdit.isFavorite));
        setIsPinned(Boolean(noteToEdit.isPinned));
        setColor(noteToEdit.color);
      } else {
        // Brand new note
        setTitle(noteToEdit?.title || '');
        setContent(noteToEdit?.content || '');
        setCategoryId(noteToEdit?.categoryId || defaultCategoryId || 'personal');
        setTags(noteToEdit?.tags ? [...noteToEdit.tags] : []);
        setIsFavorite(Boolean(noteToEdit?.isFavorite));
        setIsPinned(Boolean(noteToEdit?.isPinned));
        setColor(undefined);
      }
      setShowColorPicker(false);
      setShowNewCategoryInput(false);
    }
  }, [isOpen, noteToEdit, defaultCategoryId]);

  // Handle hotkeys (Ctrl/Cmd + S to save, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape' && !showNewCategoryInput) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, content, categoryId, tags, isFavorite, isPinned, color, showNewCategoryInput]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Text formatting tool helpers
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || defaultPlaceholder;

    const newContent =
      content.substring(0, start) + prefix + textToInsert + suffix + content.substring(end);

    setContent(newContent);

    // Focus back and set cursor selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + textToInsert.length
      );
    }, 0);
  };

  const handleCreateCustomCategory = () => {
    if (newCategoryName.trim()) {
      onCreateCategory?.(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const finalTitle = trimmedTitle || (content.trim() ? content.trim().split('\n')[0].slice(0, 40) : 'Untitled Note');

    onSave({
      id: noteToEdit?.id,
      title: finalTitle,
      content,
      categoryId,
      tags,
      isFavorite,
      isPinned,
      color,
      createdAt: noteToEdit?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  };

  const currentCategory = categories.find((c) => c.id === categoryId);
  const characterCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isEditingExisting = Boolean(noteToEdit?.id);

  return (
    <div
      id="note-editor-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="note-editor-modal"
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isEditingExisting ? 'Edit Note' : 'New Note'}
            </span>
            {isEditingExisting && noteToEdit?.updatedAt && (
              <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500">
                • Edited {formatFullDateTime(noteToEdit.updatedAt)}
              </span>
            )}
          </div>

          {/* Quick Actions (Pin, Favorite, Color, Close) */}
          <div className="flex items-center gap-1.5">
            {/* Color Accent Picker */}
            <div className="relative">
              <button
                type="button"
                id="note-editor-color-btn"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Card Accent Color"
              >
                <Palette className="w-4 h-4" />
              </button>

              {showColorPicker && (
                <div className="absolute right-0 top-10 z-40 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setColor(undefined);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-500 ${
                      !color ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                    }`}
                    title="Default Category Color"
                  >
                    ×
                  </button>
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setColor(c);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                        color === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pin toggle */}
            <button
              type="button"
              id="note-editor-pin-btn"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl transition-colors ${
                isPinned
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
              title={isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'rotate-45' : ''}`} />
            </button>

            {/* Favorite toggle */}
            <button
              type="button"
              id="note-editor-fav-btn"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              type="button"
              id="note-editor-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Title Input */}
          <input
            id="note-editor-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-xl sm:text-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent border-none outline-none focus:ring-0 px-0"
            autoFocus={!isEditingExisting}
          />

          {/* Category & Tags Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Category Selector */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  id="note-editor-category-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="appearance-none text-xs font-semibold pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: currentCategory?.color || '#6366f1' }}
                >
                  {renderCategoryIcon(currentCategory?.iconName || 'Folder', {
                    className: 'w-3.5 h-3.5',
                  })}
                </div>
              </div>

              {/* Add Custom Category Quick Button */}
              {onCreateCategory && !showNewCategoryInput && (
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              )}

              {showNewCategoryInput && (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="text-xs px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomCategory()}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomCategory}
                    className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Tags Pills & Tag Input */}
            <div className="flex items-center flex-wrap gap-1.5 flex-1 min-w-[200px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 text-slate-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                <Tag className="w-3 h-3 text-slate-400" />
                <input
                  id="note-editor-tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={handleAddTag}
                  placeholder="Add tag (Enter)..."
                  className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 w-24"
                />
              </div>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center flex-wrap gap-1 py-2 px-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Bold (**text**)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Italic (*text*)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ', '\n', 'Heading')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Heading (### Heading)"
            >
              <Heading className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('- ', '\n', 'List item')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Bullet list (- item)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('1. ', '\n', 'Numbered item')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Numbered list (1. item)"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- [ ] ', '\n', 'Checklist task')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Checklist task (- [ ] task)"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('> ', '\n', 'Quote')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Quote (> quote)"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'code')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Inline Code (`code`)"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n---\n', '', '')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Horizontal Divider"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Comfortable Textarea Content Editor */}
          <textarea
            ref={textareaRef}
            id="note-editor-content-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your thoughts, tasks, ideas, markdown or notes here..."
            className="w-full min-h-[260px] sm:min-h-[300px] text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 bg-transparent border-none outline-none focus:ring-0 resize-none font-normal leading-relaxed"
          />
        </div>

        {/* Footer with counts and action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto justify-between sm:justify-start">
            <span>
              {wordCount} {wordCount === 1 ? 'word' : 'words'} • {characterCount} chars
            </span>
            <span>{getEstimatedReadingTime(content)}</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            {isEditingExisting && (
              <>
                {onDuplicate && noteToEdit && (
                  <button
                    type="button"
                    id="note-editor-duplicate-btn"
                    onClick={() => {
                      onDuplicate(noteToEdit as Note);
                      onClose();
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Duplicate note"
                  >
                    <Files className="w-4 h-4" />
                  </button>
                )}

                {onDelete && noteToEdit?.id && (
                  <button
                    type="button"
                    id="note-editor-delete-btn"
                    onClick={() => {
                      onDelete(noteToEdit.id!);
                      onClose();
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              id="note-editor-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              id="note-editor-save-btn"
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <span>Save Note</span>
              <span className="hidden sm:inline text-xs text-indigo-200 font-mono">⌘S</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
