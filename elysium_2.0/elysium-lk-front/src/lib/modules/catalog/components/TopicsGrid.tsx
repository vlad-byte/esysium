import React from "react";
import type { CategoryBase } from "../types/categories";
import { CategoryCard } from "./CategoryCard";

interface TopicsGridProps {
  categories: CategoryBase[];
}

const TopicsGrid: React.FC<TopicsGridProps> = ({ categories }) => {
  return (
    <div className="w-full h-full py-12">
       <h1 className="text-3xl sm:text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-10 sm:mb-16 lg:mb-32 drop-shadow-glow">
        Каталог категорий
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
        {categories.map((cat: CategoryBase) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
};

export default TopicsGrid; 