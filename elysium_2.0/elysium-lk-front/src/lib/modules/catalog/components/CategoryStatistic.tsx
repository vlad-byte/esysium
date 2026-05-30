import React from "react";

interface CategoryStatisticProps {
  data: any;
  isLoading: boolean;
  error: any;
}

const Skeleton = () => (
  <div className="w-full max-w-xl mx-auto mb-8 p-6 rounded-2xl bg-white/60 shadow flex flex-col items-center gap-2 animate-pulse">
    <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
    <div className="flex gap-8 mt-2 w-full justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="h-3 w-10 bg-gray-100 rounded" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="h-3 w-14 bg-gray-100 rounded" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-12 bg-gray-200 rounded" />
        <div className="h-3 w-12 bg-gray-100 rounded" />
      </div>
    </div>
  </div>
);

const stats = [
  {
    label: "Тем",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-blue-400"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17.93V20a8 8 0 01-7.94-7H4.07A10.02 10.02 0 0013 19.93zM4.07 13H6a8 8 0 017-7.94V4.07A10.02 10.02 0 004.07 13zm7.93-9.93V4a8 8 0 017 7.94h1.93A10.02 10.02 0 0012 3.07zM20 11h-1.93A8 8 0 0013 19.93V20a10 10 0 007-9zm-8-8a8 8 0 017 7.94h1.93A10.02 10.02 0 0012 3.07z" fill="currentColor"/></svg>
    ),
    color: "from-blue-400 to-blue-600"
  },
  {
    label: "Вопросов",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-purple-400"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17.93V20a8 8 0 01-7.94-7H4.07A10.02 10.02 0 0013 19.93zM4.07 13H6a8 8 0 017-7.94V4.07A10.02 10.02 0 004.07 13zm7.93-9.93V4a8 8 0 017 7.94h1.93A10.02 10.02 0 0012 3.07zM20 11h-1.93A8 8 0 0013 19.93V20a10 10 0 007-9zm-8-8a8 8 0 017 7.94h1.93A10.02 10.02 0 0012 3.07z" fill="currentColor"/></svg>
    ),
    color: "from-purple-400 to-purple-600"
  },
  {
    label: "Решено",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-pink-400"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17.93V20a8 8 0 01-7.94-7H4.07A10.02 10.02 0 0013 19.93zM4.07 13H6a8 8 0 017-7.94V4.07A10.02 10.02 0 004.07 13zm7.93-9.93V4a8 8 0 017 7.94h1.93A10.02 10.02 0 0012 3.07zM20 11h-1.93A8 8 0 0013 19.93V20a10 10 0 007-9zm-8-8a8 8 0 017 7.94h1.93A10.02 10.02 0 0012 3.07z" fill="currentColor"/></svg>
    ),
    color: "from-pink-400 to-pink-600"
  }
];

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const duration = 600;
    const step = Math.ceil(value / (duration / 16));
    if (value === 0) setDisplay(0);
    else {
      const interval = setInterval(() => {
        start += step;
        if (start >= value) {
          setDisplay(value);
          clearInterval(interval);
        } else {
          setDisplay(start);
        }
      }, 16);
      return () => clearInterval(interval);
    }
  }, [value]);
  return <span>{display}</span>;
};

const CategoryStatistic: React.FC<CategoryStatisticProps> = ({ data, isLoading, error }) => {
  if (isLoading) return <Skeleton />;
  if (error) return <div className="text-center text-red-500">Ошибка загрузки статистики</div>;
  if (!data) return null;

  const totalTopics = data.topicsProgress?.length || 0;
  const totalQuestions = data.topicsProgress?.reduce((sum: number, tp: any) => sum + (tp.totalQuestions || 0), 0);
  const solvedQuestions = data.topicsProgress?.reduce((sum: number, tp: any) => sum + (tp.answeredQuestions || 0), 0);

  const values = [totalTopics, totalQuestions, solvedQuestions];

  return (
    <div className="w-full max-w-xl mx-auto mb-8 p-6 rounded-2xl border-2 border-transparent bg-gradient-to-br from-blue-100/60 via-purple-100/60 to-pink-100/60 shadow-xl flex flex-col items-center gap-2 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-60" style={{zIndex:0}} />
      <div className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-2 z-10">Статистика по категории</div>
      <div className="flex gap-8 mt-2 z-10">
        {stats.map((stat, i) => (
          <div key={stat.label} className={`flex flex-col items-center px-4 py-2 rounded-xl bg-gradient-to-b ${stat.color} bg-clip-padding bg-opacity-10 shadow-md`} style={{minWidth:80}}>
            <div className="mb-1">{stat.icon}</div>
            <span className="text-3xl font-extrabold text-white drop-shadow-glow animate-fade-in">
              <AnimatedNumber value={values[i]} />
            </span>
            <span className="text-xs text-white/80 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryStatistic; 