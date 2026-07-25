/* tslint:disable */
/* eslint-disable */

/**
 * 自己フィードバック付きサイン波（フィードバック FM）を生成する。
 *
 * `y[n] = sin(φ[n] + feedback * y[n-1])`
 * `φ` は周波数に応じて進む位相。
 * feedback を上げると倍音が増え、音色が豊かになる。
 *
 * 戻り値は -1.0〜1.0 付近のモノラルサンプル列（Float32）。
 */
export function generate_feedback_fm(frequency_hz: number, feedback: number, duration_secs: number, sample_rate: number, volume: number): Float32Array;

/**
 * WAV の音量・ピッチ（再生速度）を変更する既存処理
 */
export function process_audio(input_bytes: Uint8Array, volume: number, pitch: number): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly generate_feedback_fm: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly process_audio: (a: number, b: number, c: number, d: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
