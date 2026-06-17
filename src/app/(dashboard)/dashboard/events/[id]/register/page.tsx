import RegisterForEventClient from './RegisterForEventClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function RegisterForEventPage() {
  return <RegisterForEventClient />;
}
