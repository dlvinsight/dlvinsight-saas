import type { Metadata } from 'next';
import { SpApiTestRunner } from './components/SpApiTestRunner';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'SP-API Health Check',
    description: 'Test Amazon SP-API connectivity and health',
  };
}

export default async function TestApiPage() {

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">SP-API Health Check</h1>
        <p className="mt-2 text-muted-foreground">
          Test your Amazon SP-API connection and verify all endpoints are working correctly.
          This test is safe to run in production as it uses minimal API calls.
        </p>
      </div>
      <SpApiTestRunner />
    </div>
  );
}