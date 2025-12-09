import React, { useEffect, useRef } from 'react';

export default function HtmlPreview({ html }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcdoc = html;
  }, [html]);
  return (
    <div>
      <div>Preview</div>
      <iframe ref={ref} title="preview" style={{ width: '100%', minHeight: 520, border: '1px solid #ddd' }} />
    </div>
  );
}
