import UserDetailsClient from './UserDetailsClient';
import api from '@/services/api';

export async function generateStaticParams() {
  return [{ id: '1' }];
}

export default function UserDetailsPage() {
  return <UserDetailsClient />;
}
