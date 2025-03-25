import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Menu Header Skeleton */}
        <div className="mb-6 md:mb-8 text-center">
          <Skeleton className="h-10 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-72 mx-auto" />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart Skeleton for Mobile (shown above menu) */}
          <div className="w-full lg:hidden mb-6">
            <div className="rounded-xl overflow-hidden bg-white shadow-sm border">
              <div className="p-4 bg-gray-50 border-b">
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="p-4">
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          
          {/* Menu Display Skeleton */}
          <div className="w-full lg:w-3/4">
            <div className="rounded-xl overflow-hidden bg-white shadow-sm border">
              <div className="p-4 md:p-6 bg-gray-50 border-b rounded-t-xl">
                <div className="flex items-center">
                  <Skeleton className="h-6 w-6 mr-3 rounded-full" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                {/* Mobile View - Horizontal Scrollable Categories */}
                <div className="space-y-10 lg:hidden">
                  {/* First Category */}
                  <div className="space-y-4">
                    <Skeleton className="h-7 w-32 mb-2" />
                    
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {/* Photo-centric Card Skeletons */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-[250px] flex-shrink-0">
                          <div className="rounded-md overflow-hidden border h-full flex flex-col">
                            <Skeleton className="aspect-square w-full" />
                            <div className="p-3">
                              <Skeleton className="h-5 w-3/4 mb-1" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Second Category */}
                  <div className="space-y-4">
                    <Skeleton className="h-7 w-40 mb-2" />
                    
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {/* Photo-centric Card Skeletons */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-[250px] flex-shrink-0">
                          <div className="rounded-md overflow-hidden border h-full flex flex-col">
                            <Skeleton className="aspect-square w-full" />
                            <div className="p-3">
                              <Skeleton className="h-5 w-3/4 mb-1" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Desktop View - Tabs and Grid */}
                <div className="hidden lg:block">
                  {/* Tabs */}
                  <div className="mb-4 flex space-x-1 overflow-x-auto pb-1">
                    <Skeleton className="h-9 w-16 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                  </div>
                  
                  {/* Grid Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Photo-centric Card Skeletons */}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="rounded-md overflow-hidden border h-full flex flex-col">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-3">
                          <Skeleton className="h-5 w-3/4 mb-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cart Skeleton for Desktop (shown on right side) */}
          <div className="w-full lg:w-1/4 hidden lg:block">
            <div className="rounded-xl overflow-hidden bg-white shadow-sm border sticky top-24">
              <div className="p-4 bg-gray-50 border-b">
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="p-4">
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
