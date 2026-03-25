use hound::{WavReader, WavWriter};
use std::io::Cursor;
use wasm_bindgen::prelude::*;

// #[wasm_bindgen] をつけると、JavaScriptから直接呼び出せるようになります
#[wasm_bindgen]
pub fn process_audio(input_bytes: &[u8], volume: f32, pitch: f32) -> Vec<u8> {
    // 1. JSから受け取ったWAVのバイナリデータ（数字の羅列）を読み込む
    let cursor = Cursor::new(input_bytes);
    let mut reader = WavReader::new(cursor).unwrap();
    let spec = reader.spec();
    let channels = spec.channels as usize;

    let samples: Vec<f32> = reader
        .samples::<i16>()
        .map(|s| s.unwrap() as f32)
        .collect();

    let mut out_buffer = Cursor::new(Vec::new());
    let mut writer = WavWriter::new(&mut out_buffer, spec).unwrap();

    let total_frames = samples.len() / channels;
    let new_total_frames = (total_frames as f32 / pitch) as usize;

    // 2. リサンプリングと音量変更の計算（以前と全く同じロジックです！）
    for frame in 0..new_total_frames {
        let original_pos = frame as f32 * pitch;
        let index = original_pos.floor() as usize;
        let fraction = original_pos - index as f32;

        for ch in 0..channels {
            let pos1 = index * channels + ch;
            let pos2 = (index + 1) * channels + ch;

            let sample1 = if pos1 < samples.len() { samples[pos1] } else { 0.0 };
            let sample2 = if pos2 < samples.len() { samples[pos2] } else { 0.0 };

            let interpolated = sample1 + (sample2 - sample1) * fraction;
            let final_sample = interpolated * volume;
            let clamped = final_sample.clamp(i16::MIN as f32, i16::MAX as f32);

            writer.write_sample(clamped as i16).unwrap();
        }
    }
    writer.finalize().unwrap();

    // 3. 完成したWAVデータをJSに返す
    out_buffer.into_inner()
}