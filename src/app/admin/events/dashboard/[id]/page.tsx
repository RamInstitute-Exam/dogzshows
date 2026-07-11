import DashboardClient from './DashboardClient';

export default async function EventDashboardPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Event Catalog Management</h1>
      <DashboardClient eventId={params.id} />
    </div>
  );
}
