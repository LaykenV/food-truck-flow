'use client';

import { ConfigProvider } from './ConfigProvider';
import { ConfigForm } from './ConfigForm';
import { LivePreview } from './LivePreview';

export function ClientWrapper() {
  return (
    <ConfigProvider>
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="mt-12 lg:mt-0 lg:col-span-6">
          <ConfigForm />
        </div>
        <div className="mt-12 lg:col-span-6">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Preview Your Food Truck Website
          </h2>
          <LivePreview />
        </div>
      </div>
    </ConfigProvider>
  );
} 