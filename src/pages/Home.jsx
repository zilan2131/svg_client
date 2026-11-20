import React from "react";
import { useNavigate } from "react-router-dom";

const TOOLS = [
  {
    id: "png-to-svg",
    badge: "Görsel Araç",
    icon: "🖼️",
    title: "PNG → SVG Çevirme",
    description:
      "PNG ikon ve görsellerini ölçeklenebilir vektörel SVG formatına dönüştür.",
    cta: "Başla",
    path: "/png-to-svg",
  },
  {
    id: "emoji-matcher",
    badge: "Kelime & İkon",
    icon: "😄",
    title: "İngilizce Emoji Eşleştirme",
    description:
      "İngilizce kelimeleri ve kelime listelerini en uygun emojilerle otomatik eşleştir.",
    cta: "Eşleştir",
    path: "/emoji-matcher",
  },
  {
    id: "video-blur",
    badge: "Video İşleme",
    icon: "🎬",
    title: "Video Blur İşlemi",
    description:
      "Videolardaki hassas alanları, metinleri veya istenmeyen bölgeleri bulanıklaştır.",
    cta: "Blurlaştır",
    path: "/video-blur",
  },
  {
    id: "word-image-matcher",
    badge: "Eğitim & Kelime",
    icon: "🃏",
    title: "İngilizce Kelimeyi Resimle Eşleştir",
    description:
      "İngilizce kelimeleri görsellerle eşleştirerek pratik ve kart akışları oluştur.",
    cta: "Eşleştir",
    path: "/word-image-matcher",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Üst Başlık */}
        <header className="mb-10 text-center md:text-left">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 mb-3">
            Araç Kutusu
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Hızlı Üretim ve Eşleştirme Araçları
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Görsel dönüştürme, video gizleme ve İngilizce kelime eşleştirme
            modüllerine tek yerden ulaş.
          </p>
        </header>

        {/* Kart Gridi */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TOOLS.map((tool) => (
            <article
              key={tool.id}
              className="group flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 p-6 transition-all duration-200 shadow-lg hover:shadow-purple-950/30"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    {tool.icon}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                    {tool.badge}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {tool.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(tool.path)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white transition cursor-pointer"
                >
                  {tool.cta} →
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
