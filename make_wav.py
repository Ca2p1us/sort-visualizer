import wave
import math
import struct

def generate_sine_wave(filename, freq=440.0, duration=3.0, volume=0.5):
    """
    サイン波を生成してWAVファイルに保存する関数
    """
    # オーディオ設定
    sample_rate = 44100  # サンプリング周波数 (44100Hzは一般的なCD音質)
    channels = 1         # チャンネル数 (1: モノラル, 2: ステレオ)
    sampwidth = 2        # サンプルサイズ (2バイト = 16ビット)
    
    # 音量の最大値を計算 (16ビット音声の場合、最大値は32767)
    max_amplitude = 32767
    amplitude = int(max_amplitude * volume)
    
    print(f"「{filename}」を作成中... (周波数: {freq}Hz, 長さ: {duration}秒)")

    # 音声データの生成
    audio_data = bytearray()
    num_samples = int(sample_rate * duration)
    
    for i in range(num_samples):
        # サイン波の計算 ( -1.0 〜 1.0 )
        sine_value = math.sin(2.0 * math.pi * freq * i / sample_rate)
        # 振幅を掛けて16ビット整数に変換
        packed_value = struct.pack('<h', int(amplitude * sine_value))
        audio_data.extend(packed_value)

    # WAVファイルとして書き出し
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(sampwidth)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data)
        
    print("作成が完了しました！")

if __name__ == "__main__":
    # 440Hz(ラの音)で3秒間、音量50%のWAVファイルを作成
    generate_sine_wave("input.wav", freq=440.0, duration=3.0, volume=0.5)