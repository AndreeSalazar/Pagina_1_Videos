import { computeLayout as jsCompute } from './layout-js.js';

let enabled = false;
let wasmMod;
export async function initWasm() {
  try {
    if (import.meta.env.VITE_USE_WASM !== 'true') throw new Error('disabled');
    const entry = import.meta.env.VITE_WASM_ENTRY || '/wasm/layout/pkg/layout.js';
    const mod = await import(/* @vite-ignore */ entry);
    if (mod?.compute_layout) {
      wasmMod = mod;
      enabled = true;
    }
  } catch { enabled = false; }
}

export function computeLayout(blocks, width) {
  if (enabled && wasmMod?.compute_layout) {
    const result = wasmMod.compute_layout(JSON.stringify(blocks), width);
    try { return JSON.parse(result); } catch { return jsCompute(blocks, width); }
  }
  return jsCompute(blocks, width);
}
