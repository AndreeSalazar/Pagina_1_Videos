import './globals.css';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import TransitionEpic from './components/TransitionEpic';
import { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="app-body">
        <Suspense fallback={<div className="app-header" aria-hidden />}> 
          <AppHeader />
        </Suspense>
        <Suspense fallback={<div className="epic-overlay" aria-hidden />}> 
          <TransitionEpic />
        </Suspense>
        <div className="app-shell">
          <Suspense fallback={<div style={{ borderRight: '1px solid var(--border)' }} aria-hidden />}> 
            <AppSidebar />
          </Suspense>
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
