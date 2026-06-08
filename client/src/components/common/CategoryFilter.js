import React from 'react';

const CategoryFilter = ({ categories, selected, onChange }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onChange('')}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        !selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      All
    </button>
    {categories.map((cat) => (
      <button
        key={cat.value}
        onClick={() => onChange(cat.value)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          selected === cat.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {cat.label}
      </button>
    ))}
  </div>
);

export default CategoryFilter;
