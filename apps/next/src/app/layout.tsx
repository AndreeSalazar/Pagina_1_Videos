import './globals.css';
import AppHeader from './components/AppHeader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="app-body">
        <AppHeader />
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
