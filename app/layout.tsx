import '@/app/globals.css';

export const metadata = {
  title: 'Finance Manager',
  description: 'Simple monthly budget manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body className="">{children}</body>
    </html>
  );
}
