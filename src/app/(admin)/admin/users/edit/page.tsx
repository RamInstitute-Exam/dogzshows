"use client";
import { Suspense } from "react";
import EditUserClient from './EditUserClient';
import api from '@/services/api';





function EditUserPageContent() {
  return <EditUserClient />;
}

export default function Page() { return <Suspense><EditUserPageContent /></Suspense>; }
