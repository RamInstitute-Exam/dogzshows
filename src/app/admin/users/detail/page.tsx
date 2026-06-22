"use client";
import { Suspense } from "react";
import UserDetailsClient from './UserDetailsClient';
import api from '@/services/api';





function UserDetailsPageContent() {
  return <UserDetailsClient />;
}

export default function Page() { return <Suspense><UserDetailsPageContent /></Suspense>; }
