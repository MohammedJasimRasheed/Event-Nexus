const EventCardSkeleton = () => {
  return (
    <div className="glass-panel shadow-md overflow-hidden">
      <div className="h-48 skeleton"></div>
      <div className="p-5 space-y-4">
        <div className="h-6 skeleton rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 skeleton rounded w-full"></div>
          <div className="h-4 skeleton rounded w-5/6"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 skeleton rounded w-1/2"></div>
          <div className="h-4 skeleton rounded w-1/3"></div>
          <div className="h-4 skeleton rounded w-1/4"></div>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between">
          <div className="h-8 skeleton rounded w-1/3"></div>
          <div className="h-6 skeleton rounded w-1/6"></div>
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
