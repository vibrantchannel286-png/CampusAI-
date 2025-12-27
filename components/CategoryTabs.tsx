import { useState } from 'react';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All Updates', icon: '📰' },
  { id: 'Federal', label: 'Federal', icon: '🏛️' },
  { id: 'State', label: 'State', icon: '🏫' },
  { id: 'Private', label: 'Private', icon: '🎓' },
  { id: 'JAMB', label: 'JAMB', icon: '📋' },
];

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            px-6 py-3 rounded-lg font-semibold transition-all duration-200
            flex items-center gap-2 whitespace-nowrap
            ${
              activeCategory === category.id
                ? 'bg-primary-green text-white shadow-lg transform scale-105'
                : 'bg-white text-primary-green border-2 border-primary-green hover:bg-primary-green hover:text-white'
            }
          `}
        >
          <span className="text-xl">{category.icon}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
}

