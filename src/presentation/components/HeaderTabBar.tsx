import React from 'react';
import { CalendarDays, History, House, Music4, Search, Settings } from 'lucide-react';

interface HeaderTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const HeaderTabBar: React.FC<HeaderTabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 0, label: '主頁', icon: House },
    { id: 1, label: '點歌', icon: Music4 },
    { id: 2, label: '搜尋', icon: Search },
    { id: 3, label: '行程', icon: CalendarDays },
    { id: 4, label: '歷史', icon: History },
    { id: 5, label: '設置', icon: Settings },
  ];

  return (
    <div className="bottom-tabbar w-100 flex-shrink-0 user-select-none">
      <div className="bottom-tabbar__inner d-flex align-items-center justify-content-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-btn d-flex flex-column align-items-center justify-content-center flex-fill h-100 position-relative ${isActive ? 'tab-btn--active' : ''}`}
            >
              <Icon className="tab-btn__icon mb-1" size={22} />
              <span style={{ fontSize: '0.72rem', lineHeight: 1 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
