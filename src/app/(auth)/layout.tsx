export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[80vh] w-full px-4">
      <div className="mx-auto grid max-w-sm place-items-center pt-16">
        {children}
      </div>
    </div>
  );
}
