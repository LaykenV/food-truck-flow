import { AdminConfigClient } from '@/app/admin/config/client';

export default function ConfigPage() {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Website Configuration</h1>
      
      <AdminConfigClient />
    </div>
  );
} 