import '@/app/globals.css';
import AutoLogoutProvider from '@/app/Components/AutoLogoutProvider';
export const metadata = {
  title: 'Finance Manager',
  description: 'Simple monthly budget manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body className=""><AutoLogoutProvider>{children}</AutoLogoutProvider></body>
    </html>
  );
}
