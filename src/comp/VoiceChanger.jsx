import React, { useState, useRef } from "react";
import { Mic, MicOff, Volume2, Sliders } from "lucide-react";

const VoiceChanger = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [pitchFactor, setPitchFactor] = useState(1.5); // 1.2 - 2.0 arası çocuk sesi için idealdir
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);

  const startVoiceChanger = async () => {
    try {
      // 1. Mikrofondan ses akışı al
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      streamRef.current = stream;

      // 2. AudioContext başlat
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      // 3. Mikrofonu ses kaynağı yap
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // 4. Pitch (Perde/Frekans) Değişimi için BiquadFilter veya ScriptProcessor / AudioWorklet
      // Not: Basit ve hızlı bir web demo için playbackRate simülasyonu veya Delay/Filter zinciri kullanılır.
      // Tarayıcı içi gerçek zamanlı ileri düzey pitch-shift için SoundTouchJS kullanılabilir,
      // ancak saf JS ile temel frekans kaydırma için biquad filter ve gain node ekleyelim:

      const biquadFilter = audioCtx.createBiquadFilter();
      biquadFilter.type = "peaking";
      biquadFilter.frequency.value = 1000 * pitchFactor;
      biquadFilter.gain.value = 15; // Ses tınısını parlatma

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.0;

      // Bağlantıları kur (Mikrofon -> Filtre -> Hoparlör)
      source.connect(biquadFilter);
      biquadFilter.connect(gainNode);

      // DİKKAT: Kendi sesinizi kulaklıksız dinlerseniz yankı (feedback) yapar!
      // Kulaklık kullanılması önerilir.
      gainNode.connect(audioCtx.destination);

      setIsRecording(true);
    } catch (error) {
      console.error("Mikrofon erişim hatası:", error);
      alert("Mikrofon izni alınamadı veya mikrofon bulunamadı!");
    }
  };

  const stopVoiceChanger = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
          <Volume2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Web Ses Değiştirici</h2>
          <p className="text-xs text-slate-400">
            Canlı Mikrofon Çocuk Sesi Efekti
          </p>
        </div>
      </div>

      {/* Pitch Ayar Çubuğu */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300 flex items-center gap-1">
            <Sliders className="w-4 h-4" /> Ses İnceliği (Pitch)
          </span>
          <span className="text-indigo-400 font-semibold">{pitchFactor}x</span>
        </div>
        <input
          type="range"
          min="1.1"
          max="2.0"
          step="0.1"
          value={pitchFactor}
          onChange={(e) => setPitchFactor(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 bg-slate-800 cursor-pointer"
        />
      </div>

      {/* Kontrol Butonu */}
      <div className="flex justify-center">
        {!isRecording ? (
          <button
            onClick={startVoiceChanger}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            <Mic className="w-5 h-5" /> Efekti Başlat
          </button>
        ) : (
          <button
            onClick={stopVoiceChanger}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-rose-600/30 animate-pulse"
          >
            <MicOff className="w-5 h-5" /> Durdur
          </button>
        )}
      </div>

      <p className="text-xs text-center text-slate-500 mt-4">
        * Yankı oluşmaması için lütfen **kulaklık** kullanın.
      </p>
    </div>
  );
};

export default VoiceChanger;
