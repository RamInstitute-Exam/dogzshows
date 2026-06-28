import React, { Suspense } from 'react';
import GroupsClient from './GroupsClient';
import Spinner from '@/components/common/loader/Spinner';

export default function GroupsPage() {
  return (
    <Suspense fallback={<Spinner className="min-h-screen" />}>
      <GroupsClient />
    </Suspense>
  );
}
