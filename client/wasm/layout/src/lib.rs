use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Block { r#type: String }

#[derive(Serialize)]
struct Positioned { r#type: String, x: i32, y: i32, w: i32, h: i32 }

#[wasm_bindgen]
pub fn compute_layout(blocks_json: &str, width: i32) -> String {
    let blocks: Vec<Block> = serde_json::from_str(blocks_json).unwrap_or_default();
    let mut y = 0;
    let mut out: Vec<Positioned> = Vec::new();
    for b in blocks.into_iter() {
        let h = match b.r#type.as_str() { "hero" => 320, "text" => 160, _ => 80 };
        out.push(Positioned { r#type: b.r#type, x: 0, y, w: width, h });
        y += h + 16;
    }
    serde_json::to_string(&out).unwrap_or("[]".to_string())
}
