import './globals.css'; // <-- Pastikan baris ini ada di paling atas!

export const metadata = {
  title: 'To Do List Roy',
  description: 'Aplikasi To-Do List',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}