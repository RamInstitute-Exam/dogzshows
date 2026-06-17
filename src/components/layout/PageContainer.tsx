import React from 'react';

export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full overflow-x-hidden min-h-[auto] bg-background text-foreground font-sans">
      {children}
    </main>
  );
}
