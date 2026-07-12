import React, { useEffect, useState } from 'react';

export default function RegistrationCapacityBanner({ eventId, dog }: { eventId: string, dog: any }) {
  const [capacityInfo, setCapacityInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId || !dog || !dog.breed?.fciGroupId) return;
    
    const checkCapacity = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/event-group-limits/${eventId}`);
        const data = await res.json();
        if (data.success) {
          const limit = data.data.find((l: any) => l.fciGroupId === dog.breed.fciGroupId);
          if (limit) {
            setCapacityInfo({
              groupName: limit.fciGroup?.name,
              maximum: limit.maximumEntries,
              registered: limit.currentEntries,
              remaining: limit.maximumEntries - limit.currentEntries
            });
          } else {
            setError('No capacity limit configured for this group.');
          }
        }
      } catch (err) {
        setError('Failed to load capacity limits.');
      } finally {
        setLoading(false);
      }
    };
    
    checkCapacity();
  }, [eventId, dog]);

  if (!dog || !dog.breed?.fciGroupId) return null;
  if (loading) return <div className="text-sm text-gray-500">Checking group capacity...</div>;
  if (error) return null; // Fallback gracefully if no limits are set
  if (!capacityInfo) return null;

  const percentage = (capacityInfo.registered / capacityInfo.maximum) * 100;
  const isFull = capacityInfo.remaining <= 0;

  return (
    <div className={`p-4 rounded-md mb-6 ${isFull ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className={`font-medium ${isFull ? 'text-red-800' : 'text-blue-800'}`}>
          {capacityInfo.groupName} Capacity
        </h4>
        <span className={`text-sm font-bold ${isFull ? 'text-red-600' : 'text-blue-600'}`}>
          {isFull ? 'Registration Closed' : `${capacityInfo.remaining} Slots Remaining`}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${isFull ? 'bg-red-600' : 'bg-blue-600'}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>0</span>
        <span>{capacityInfo.registered} / {capacityInfo.maximum} Registered</span>
        <span>{capacityInfo.maximum}</span>
      </div>
    </div>
  );
}
