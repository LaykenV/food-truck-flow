import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Back link skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-24" />
        </div>
        
        {/* Page header skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gray-100">
              <ShoppingBag className="h-5 w-5 text-gray-400" />
            </div>
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
      </div>
      
      {/* Order Content Skeleton */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Form Skeleton */}
          <div className="w-full lg:w-2/3">
            <div className="rounded-xl overflow-hidden shadow-sm border">
              {/* Order status skeleton */}
              <div className="p-4 md:p-6 border-b">
                <Skeleton className="h-7 w-36 mb-2" />
                <Skeleton className="h-5 w-60" />
              </div>
              
              {/* Cart summary skeleton */}
              <div className="p-4 md:p-6 border-b">
                <Skeleton className="h-7 w-32 mb-4" />
                {/* Cart items */}
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3 mb-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              
              {/* Customer info skeleton */}
              <div className="p-4 md:p-6 border-b">
                <Skeleton className="h-7 w-40 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              
              {/* Pickup options skeleton */}
              <div className="p-4 md:p-6 border-b">
                <Skeleton className="h-7 w-36 mb-4" />
                <div className="flex gap-4 mb-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-10 w-full md:w-1/2" />
              </div>
              
              {/* Notes skeleton */}
              <div className="p-4 md:p-6 border-b">
                <Skeleton className="h-7 w-32 mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
              
              {/* Submit button skeleton */}
              <div className="p-4 md:p-6">
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Support info skeleton */}
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <div className="rounded-xl overflow-hidden shadow-md bg-gray-50">
              <div className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
