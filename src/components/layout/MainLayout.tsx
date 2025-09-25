interface MainLayoutProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export const MainLayout = ({ header, footer, children }: MainLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
    {header}
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">{children}</div>
    </main>
    {footer}
  </div>
);
