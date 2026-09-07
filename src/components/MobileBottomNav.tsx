import React from 'react';
import { Home, FileText, Star, FolderTree, Settings, Plus } from 'lucide-react';
import { NavTab } from '../types';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewNote: () => void;
  totalNotes: number;
  favoritesCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewNote,
  totalNotes,
  favoritesCount,
}) => {
  return (
    <div
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around"
    >
      <button
        id="mobile-nav-home"
        type="button"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
          currentTab === 'home'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </button>

      <button
        id="mobile-nav-all"
        type="button"
        onClick={() => onSelectTab('all')}
        className={`flex flex-col items-center gap-1 p-1.5 relative transition-colors ${
          currentTab === 'all'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px]">Notes</span>
        {totalNotes > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-500" />
        )}
      </button>

      {/* Floating Center Plus Button */}
      <button
        id="mobile-nav-new-note"
        type="button"
        onClick={onOpenNewNote}
        className="-mt-5 w-12 h-12 rounded-full bg-indigo-600 active:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform active:scale-95"
        title="Create Note"
        aria-label="Create new note"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        id="mobile-nav-favorites"
        type="button"
        onClick={() => onSelectTab('favorites')}
        className={`flex flex-col items-center gap-1 p-1.5 relative transition-colors ${
          currentTab === 'favorites'
            ? 'text-amber-500 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Star className={`w-5 h-5 ${currentTab === 'favorites' ? 'fill-amber-500' : ''}`} />
        <span className="text-[10px]">Favorites</span>
        {favoritesCount > 0 && (
          <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400" />
        )}
      </button>

      <button
        id="mobile-nav-categories"
        type="button"
        onClick={() => onSelectTab('categories')}
        className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
          currentTab === 'categories'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <FolderTree className="w-5 h-5" />
        <span className="text-[10px]">Categories</span>
      </button>
    </div>
  );
};
