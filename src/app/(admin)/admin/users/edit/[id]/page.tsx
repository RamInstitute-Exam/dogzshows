import EditUserClient from './EditUserClient';
import api from '@/services/api';

export async function generateStaticParams() {
  return [{ id: '1' }];
}

export default function EditUserPage() {
  return <EditUserClient />;
}
