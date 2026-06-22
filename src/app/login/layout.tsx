export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-card flex flex-col justify-center">
      <main className="flex-grow flex items-center justify-center relative z-0">
        {children}
      </main>
    </div>
  );
}
