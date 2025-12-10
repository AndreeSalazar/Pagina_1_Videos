import WatchClient from './WatchClient';
import { Suspense } from 'react';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="app-main">
      <Suspense fallback={(
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          <div>
            <div className="watch-player" />
            <div className="skeleton-line" style={{ width: '60%', margin: '12px 0 4px' }} />
            <div className="skeleton-line" style={{ width: '40%' }} />
          </div>
          <div className="hub-chat" />
        </div>
      )}>
        <WatchClient id={params.id} />
      </Suspense>
    </div>
  );
}
