import React, { useRef, useState } from 'react';
import {
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  HardDrive,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { AppSettings, Category, Note, ThemeMode, SortOption, ViewMode } from '../types';
import { parseImportJson } from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  categories: Category[];
  notes: Note[];
  onExportAllJson: () => void;
  onImportNotes: (importedNotes: Note[], importedCategories?: Category[], mode?: 'merge' | 'replace') => void;
  onRestoreSampleData: () => void;
  onRequestDeleteAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  categories,
  notes,
  onExportAllJson,
  onImportNotes,
  onRestoreSampleData,
  onRequestDeleteAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{
    notes: Note[];
    categories?: Category[];
    notesCount: number;
    categoriesCount: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = parseImportJson(content);
      if (result.success && result.importedNotes) {
        setPendingImport({
          notes: result.importedNotes,
          categories: result.importedCategories,
          notesCount: result.notesCount,
          categoriesCount: result.categoriesCount,
        });
        setImportStatus(null);
      } else {
        setImportStatus(`Import Error: ${result.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeImport = (mode: 'merge' | 'replace') => {
    if (!pendingImport) return;
    onImportNotes(pendingImport.notes, pendingImport.categories, mode);
    setPendingImport(null);
  };

  return (
    <div id="settings-view" className="max-w-4xl space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your experience, manage local data backups, and configure defaults.
        </p>
      </div>

      {/* Appearance & Themes */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-indigo-500" /> Appearance & Theme
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            id="theme-option-light"
            onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              settings.theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:text-white'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Light Mode</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Crisp and clean high-contrast light theme
              </div>
            </div>
          </button>

          <button
            type="button"
            id="theme-option-dark"
            onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              settings.theme === 'dark'
                ? 'border-indigo-500 bg-indigo-950/40 text-white'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Dark Mode</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Comfortable low-light dark interface
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Editor & Defaults Configuration */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Default Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Default Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Default Note Category
            </label>
            <select
              id="settings-default-category-select"
              value={settings.defaultCategoryId}
              onChange={(e) =>
                onUpdateSettings({ ...settings, defaultCategoryId: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Default Sort */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Default Sorting Order
            </label>
            <select
              id="settings-default-sort-select"
              value={settings.defaultSort}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultSort: e.target.value as SortOption,
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="newest_updated">Recently Edited</option>
              <option value="newest_created">Newest Created</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical_asc">Alphabetical (A - Z)</option>
              <option value="alphabetical_desc">Alphabetical (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Backup, Import & Export */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-500" /> Data Backup & Transfer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export backups to keep your data safe, or import previously saved QuickNotes files.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Export Notes Backup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Downloads all your {notes.length} note(s) and categories as a portable JSON file.
              </p>
            </div>
            <button
              id="settings-export-btn"
              type="button"
              onClick={onExportAllJson}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Import Notes Backup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Restore or merge notes from a JSON backup file.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              id="settings-import-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Select File to Import</span>
            </button>
          </div>
        </div>

        {/* Pending Import Confirmation Box */}
        {pendingImport && (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Found {pendingImport.notesCount} note(s) to import</span>
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              Choose how you would like to apply this import:
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => executeImport('merge')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Merge with Existing ({notes.length} + {pendingImport.notesCount})
              </button>
              <button
                type="button"
                onClick={() => executeImport('replace')}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors"
              >
                Replace All Existing
              </button>
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {importStatus && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            {importStatus}
          </div>
        )}
      </div>

      {/* Danger Zone: Reset and Clear */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-rose-200/80 dark:border-rose-900/60 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Reset & Danger Zone
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Restore Sample Notes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Re-populate your notebook with standard sample guide notes and starter categories.
            </p>
          </div>
          <button
            id="settings-restore-samples-btn"
            type="button"
            onClick={onRestoreSampleData}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Samples</span>
          </button>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Delete All Notes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Permanently wipe all locally stored notes. This action cannot be undone unless exported.
            </p>
          </div>
          <button
            id="settings-delete-all-btn"
            type="button"
            onClick={onRequestDeleteAll}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Notes</span>
          </button>
        </div>
      </div>

      {/* About QuickNotes */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>About QuickNotes</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          QuickNotes is a privacy-first, ultra-responsive personal notes organizer. Designed with zero backend or cloud trackers, everything you create stays right in your browser's persistent localStorage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              100% Private & Local
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Instant Offline Sync
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Zero Signup or Server
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
          QuickNotes Version 1.0 • Built with HTML, CSS, TypeScript & React
        </div>
      </div>
    </div>
  );
};
