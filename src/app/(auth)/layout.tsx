export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full px-4">
      <div className="mx-auto grid min-h-screen max-w-sm place-items-center">
        {children}
      </div>
    </div>
  );
}
