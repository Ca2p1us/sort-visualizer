use hound::{WavReader, WavWriter};
use std::f32::consts::TAU;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

/// WAV の音量・ピッチ（再生速度）を変更する既存処理
#[wasm_bindgen]
pub fn process_audio(input_bytes: &[u8], volume: f32, pitch: f32) -> Vec<u8> {
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

    for frame in 0..new_total_frames {
        let original_pos = frame as f32 * pitch;
        let index = original_pos.floor() as usize;
        let fraction = original_pos - index as f32;

        for ch in 0..channels {
            let pos1 = index * channels + ch;
            let pos2 = (index + 1) * channels + ch;

            let sample1 = if pos1 < samples.len() {
                samples[pos1]
            } else {
                0.0
            };
            let sample2 = if pos2 < samples.len() {
                samples[pos2]
            } else {
                0.0
            };

            let interpolated = sample1 + (sample2 - sample1) * fraction;
            let final_sample = interpolated * volume;
            let clamped = final_sample.clamp(i16::MIN as f32, i16::MAX as f32);

            writer.write_sample(clamped as i16).unwrap();
        }
    }
    writer.finalize().unwrap();

    out_buffer.into_inner()
}

/// 自己フィードバック付きサイン波（フィードバック FM）を生成する。
///
/// `y[n] = sin(φ[n] + feedback * y[n-1])`
/// `φ` は周波数に応じて進む位相。
/// feedback を上げると倍音が増え、音色が豊かになる。
///
/// 戻り値は -1.0〜1.0 付近のモノラルサンプル列（Float32）。
#[wasm_bindgen]
pub fn generate_feedback_fm(
    frequency_hz: f32,
    feedback: f32,
    duration_secs: f32,
    sample_rate: f32,
    volume: f32,
) -> Vec<f32> {
    let freq = frequency_hz.max(1.0);
    let sr = sample_rate.max(8000.0);
    let dur = duration_secs.clamp(0.05, 10.0);
    let n = (dur * sr) as usize;
    let mut out = vec![0.0f32; n];

    let phase_inc = TAU * freq / sr;
    let mut phase = 0.0f32;
    let mut prev = 0.0f32;

    // クリック防止のフェード（約 10ms）
    let fade = ((sr * 0.01) as usize).max(1).min(n / 2);

    for i in 0..n {
        let sample = (phase + feedback * prev).sin();
        prev = sample;
        phase += phase_inc;
        if phase >= TAU {
            phase -= TAU;
        }

        let mut amp = volume.clamp(0.0, 1.0);
        if i < fade {
            amp *= i as f32 / fade as f32;
        } else if i + fade >= n {
            amp *= (n - 1 - i) as f32 / fade as f32;
        }

        // フィードバックが大きいときの発散を抑える
        out[i] = (sample * amp).tanh();
    }

    out
}
