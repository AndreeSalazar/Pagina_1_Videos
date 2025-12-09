import './globals.css';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import TransitionEpic from './components/TransitionEpic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="app-body">
        <AppHeader />
        <TransitionEpic />
        <div className="app-shell">
          <AppSidebar />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
