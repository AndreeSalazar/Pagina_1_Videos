import WatchClient from './WatchClient';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="app-main">
      <WatchClient id={params.id} />
    </div>
  );
}
