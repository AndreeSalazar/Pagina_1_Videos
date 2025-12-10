import HubClient from './HubClient';
import { Suspense } from 'react';

export default function Page() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 12 }}>
      <h1>Hub YouTube/Discord</h1>
      <Suspense fallback={(
        <div className="hub-container">
          <div className="hub-content">
            <div className="hub-toolbar">
              <div className="skeleton-line" style={{ width: '40%' }} />
              <div className="skeleton-btn" />
              <div className="skeleton-btn" />
            </div>
            <div className="video-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="video-card" key={`ph-${i}`}>
                  <div className="thumb skeleton-thumb" />
                  <div className="card-body">
                    <div className="card-header"><div className="skeleton-line" style={{ width: '60%' }} /><div className="skeleton-btn" /></div>
                    <div className="skeleton-line" style={{ width: '40%', marginTop: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hub-chat" />
        </div>
      )}>
        <HubClient />
      </Suspense>
    </div>
  );
}
