import React from 'react';
import {
  Home,
  FileText,
  Star,
  FolderTree,
  Settings,
  Plus,
  Tag,
} from 'lucide-react';
import { NavTab, Category, Note } from '../types';
import { renderCategoryIcon } from '../utils/iconMap';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  categories: Category[];
  notes: Note[];
  selectedCategoryFilter: string | null;
  onSelectCategoryFilter: (categoryId: string | null) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  categories,
  notes,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  isMobileOpen,
  onCloseMobile,
}) => {
  const totalNotesCount = notes.length;
  const favoriteNotesCount = notes.filter((n) => n.isFavorite).length;

  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
      count: null,
    },
    {
      id: 'all' as NavTab,
      label: 'All Notes',
      icon: FileText,
      count: totalNotesCount,
    },
    {
      id: 'favorites' as NavTab,
      label: 'Favorites',
      icon: Star,
      count: favoriteNotesCount,
      activeColor: 'text-amber-500',
    },
    {
      id: 'categories' as NavTab,
      label: 'Categories',
      icon: FolderTree,
      count: categories.length,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      count: null,
    },
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (tab === 'all') {
      onSelectCategoryFilter(null);
    }
    onCloseMobile();
  };

  const handleCategoryClick = (catId: string) => {
    onSelectCategoryFilter(catId);
    onSelectTab('all');
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          id="mobile-drawer-overlay"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-16 left-0 z-40 md:z-10 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Items */}
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Main Navigation List */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id &&
                (item.id !== 'all' || selectedCategoryFilter === null);

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Category List */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Categories
              </span>
              <button
                id="sidebar-manage-categories-btn"
                onClick={() => {
                  onSelectTab('categories');
                  onCloseMobile();
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage
              </button>
            </div>

            {categories.map((cat) => {
              const count = notes.filter((n) => n.categoryId === cat.id).length;
              const isSelected =
                currentTab === 'all' && selectedCategoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  id={`sidebar-category-${cat.id}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="p-1 rounded-md shrink-0"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        color: cat.color,
                      }}
                    >
                      {renderCategoryIcon(cat.iconName, { className: 'w-3 h-3' })}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Sidebar Widget */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                100% Offline
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              LocalStorage
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
