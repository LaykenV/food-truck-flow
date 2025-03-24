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
            <div className="rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="p-4 md:p-6 bg-gray-50 rounded-t-xl">
                <div className="flex items-center">
                  <Skeleton className="h-6 w-6 mr-3 rounded-full" />
                  <Skeleton className="h-8 w-40" />
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                {/* Mobile View Skeleton */}
                <div className="lg:hidden">
                  {/* Category sections */}
                  {[1, 2, 3].map((category) => (
                    <div key={category} className="space-y-4 mb-10">
                      {/* Category heading */}
                      <Skeleton className="h-7 w-40 mb-2" />
                      
                      {/* Horizontal items */}
                      <div className="flex space-x-4 overflow-hidden">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="w-[250px] flex-shrink-0">
                            <div className="rounded-lg overflow-hidden border h-[190px]">
                              <Skeleton className="h-32 w-full" />
                              <div className="p-3">
                                <Skeleton className="h-5 w-full mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-9 w-full mt-1" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop View Skeleton */}
                <div className="hidden lg:block">
                  {/* Tabs */}
                  <Skeleton className="h-10 w-96 mb-6" />
                  
                  {/* Grid layout items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="rounded-lg overflow-hidden border">
                        <Skeleton className="h-32 w-full" />
                        <div className="p-3">
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-9 w-full mt-1" />
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
        </div>
      </div>
    </div>
  );
}
