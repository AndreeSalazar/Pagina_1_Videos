export function computeLayout(blocks, width) {
  let y = 0;
  const out = [];
  for (const b of blocks) {
    const h = b.type === 'hero' ? 320 : b.type === 'text' ? 160 : 80;
    out.push({ type: b.type, x: 0, y, w: width, h });
    y += h + 16;
  }
  return out;
}
