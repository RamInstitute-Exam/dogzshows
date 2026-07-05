import React from 'react';
import SupportClient from './SupportClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support | JuzDog',
  description: 'Get help and support for your JuzDog account and services.',
};

export default function SupportPage() {
  return <SupportClient />;
}
