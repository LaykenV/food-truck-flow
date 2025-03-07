import { TestUnifiedComponents } from '../components/test-unified-components';

export default function TestUnifiedPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Unified Config Components Test
        </h1>
        <TestUnifiedComponents />
      </div>
    </div>
  );
} 