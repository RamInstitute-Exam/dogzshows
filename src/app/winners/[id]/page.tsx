import React from 'react';
import WinnerDetailsClient from './WinnerDetailsClient';

// Static export: generateStaticParams provides a placeholder shell.
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function WinnerDetailsPage() {
  return <WinnerDetailsClient />;
}
