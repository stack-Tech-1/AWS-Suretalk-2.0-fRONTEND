// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\components\ui\Skeleton.js
export function SkeletonLoader({ className = '' }) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    );
  }
  
  export function UserProfileSkeleton() {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }
  
  export function SidebarCountSkeleton() {
    return (
      <div className="px-2 py-1 w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    );
  }