// import React, { useMemo, useState } from "react";
// import emojilib from "emojilib";

// // Vite üzerinden public klasöründeki tüm svg ve png dosyalarını otomatik alır
// const imagesModule = import.meta.glob("/public/*.{svg,png}", {
//   eager: true,
// });

// const STOP_WORDS = new Set([
//   "a",
//   "an",
//   "the",
//   "to",
//   "of",
//   "in",
//   "on",
//   "at",
//   "for",
//   "and",
//   "or",
//   "up",
// ]);

// const CUSTOM_EMOJI_MAP = {
//   "Come over": "🏡",
//   "Get on well": "🤝",
//   "Doing origami": "🦢",
//   "Tidying up the house": "🧹",
//   "Visiting a museum": "🏛️",
// };

// // Dosya isimlerini normalleştirerek hızlı arama haritası oluşturur
// // Örn: "/public/Come_Over.svg" -> key: "comeover", value: "Come_Over.svg"
// function buildImageIndex() {
//   const map = {};
//   const fileNames = Object.keys(imagesModule).map((path) =>
//     path.split("/").pop(),
//   );

//   for (const fileName of fileNames) {
//     const baseName = fileName.replace(/\.[^/.]+$/, ""); // uzantıyı at
//     const normalized = baseName.toLowerCase().replace(/[^a-z0-9]/g, "");
//     if (normalized) {
//       map[normalized] = fileName;
//     }
//   }
//   return map;
// }

// function matchImage(engText, imageIndex) {
//   if (!engText) return null;

//   // "Hello / Hi" gibi ifadeleri bölüp her parçayı kontrol et
//   const parts = engText.split("/").map((p) => p.trim());
//   for (const part of parts) {
//     const normalized = part.toLowerCase().replace(/[^a-z0-9]/g, "");
//     if (imageIndex[normalized]) {
//       return imageIndex[normalized]; // Örn: "river.svg"
//     }
//   }
//   return null;
// }

// function buildKeywordIndex() {
//   const index = {};
//   for (const [emojiChar, keywords] of Object.entries(emojilib)) {
//     for (const kw of keywords) {
//       const normalized = kw.replace(/_/g, " ").toLowerCase();
//       if (!index[normalized]) {
//         index[normalized] = [];
//       }
//       index[normalized].push(emojiChar);
//     }
//   }
//   return index;
// }

// function getCandidateTerms(engText) {
//   const parts = engText
//     .toLowerCase()
//     .split("/")
//     .map((p) => p.trim());

//   const candidates = new Set();

//   for (const part of parts) {
//     candidates.add(part);
//     const words = part
//       .replace(/[^a-z\s]/g, "")
//       .split(/\s+/)
//       .filter((w) => w && !STOP_WORDS.has(w));

//     for (let i = words.length - 1; i >= 0; i--) {
//       candidates.add(words[i]);
//     }
//   }

//   return Array.from(candidates);
// }

// function matchEmoji(item, keywordIndex) {
//   if (CUSTOM_EMOJI_MAP[item.Eng]) {
//     return CUSTOM_EMOJI_MAP[item.Eng];
//   }

//   const candidates = getCandidateTerms(item.Eng || "");

//   for (const term of candidates) {
//     if (keywordIndex[term]?.length) {
//       return keywordIndex[term][0];
//     }
//   }

//   for (const term of candidates) {
//     if (term.length < 3) continue;
//     const partial = Object.entries(keywordIndex).find(([kw]) =>
//       kw.includes(term),
//     );
//     if (partial?.[1]?.length) {
//       return partial[1][0];
//     }
//   }

//   return item.emoji || "";
// }

// // Yapıştırılan metni temizleyip JSON olarak parse eder
// function parseInputData(rawText) {
//   const trimmed = rawText.trim();
//   if (!trimmed) return { data: [], error: null };

//   try {
//     // Eğer kullanıcı "export default [...]" veya "const x = [...];" yapıştırdıysa köşeli parantez arasını al
//     const startIdx = trimmed.indexOf("[");
//     const endIdx = trimmed.lastIndexOf("]");
//     const jsonCandidate =
//       startIdx !== -1 && endIdx !== -1
//         ? trimmed.slice(startIdx, endIdx + 1)
//         : trimmed;

//     const parsed = JSON.parse(jsonCandidate);
//     if (!Array.isArray(parsed)) {
//       return {
//         data: [],
//         error: "Yapıştırılan veri bir JSON dizisi ([...]) olmalıdır.",
//       };
//     }
//     return { data: parsed, error: null };
//   } catch (err) {
//     return {
//       data: [],
//       error:
//         "Geçersiz JSON formatı. Anahtarların çift tırnak içinde olduğundan emin olun.",
//     };
//   }
// }

// export default function EmojiMatcher() {
//   const [rawJsonInput, setRawJsonInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [onlyMissing, setOnlyMissing] = useState(false);
//   const [copied, setCopied] = useState(false);

//   const keywordIndex = useMemo(() => buildKeywordIndex(), []);
//   const imageIndex = useMemo(() => buildImageIndex(), []);

//   const { data: parsedList, error: parseError } = useMemo(
//     () => parseInputData(rawJsonInput),
//     [rawJsonInput],
//   );

//   // Hem emoji hem resim eşleştirmesi yapılmış nihai veri seti
//   const enrichedList = useMemo(
//     () =>
//       parsedList.map((item) => {
//         const matchedImage = matchImage(item.Eng, imageIndex);
//         const matchedEmoji = matchEmoji(item, keywordIndex);

//         return {
//           ...item,
//           emoji: matchedEmoji,
//           ...(matchedImage ? { image: matchedImage } : {}),
//         };
//       }),
//     [parsedList, imageIndex, keywordIndex],
//   );

//   const filteredList = useMemo(() => {
//     const q = search.toLowerCase().trim();
//     return enrichedList.filter((item) => {
//       const isMissingBoth = !item.image && !item.emoji;
//       if (onlyMissing && !isMissingBoth) return false;

//       if (!q) return true;
//       return (
//         (item.Eng || "").toLowerCase().includes(q) ||
//         (item.tr || "").toLowerCase().includes(q) ||
//         (item.emoji || "").includes(q) ||
//         (item.image || "").toLowerCase().includes(q)
//       );
//     });
//   }, [enrichedList, search, onlyMissing]);

//   const missingCount = useMemo(
//     () => enrichedList.filter((item) => !item.image && !item.emoji).length,
//     [enrichedList],
//   );

//   const handleDownloadJson = () => {
//     const blob = new Blob([JSON.stringify(enrichedList, null, 2)], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "updatedWordsList.json";
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleCopyJson = async () => {
//     await navigator.clipboard.writeText(JSON.stringify(enrichedList, null, 2));
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const openFlaticonSearch = (engWord) => {
//     // "River / Stream" gibi birleşik kelimelerde ilk kelimeyi temizleyip aratır
//     const cleanWord = engWord.split("/")[0].trim();
//     const url = `https://www.flaticon.com/search?word=${encodeURIComponent(cleanWord)}`;
//     window.open(url, "_blank", "noopener,noreferrer");
//   };

//   return (
//     <div
//       style={{
//         padding: "20px",
//         fontFamily: "sans-serif",
//         maxWidth: "1200px",
//         margin: "0 auto",
//       }}
//     >
//       {/* JSON Giriş Alanı */}
//       <div style={{ marginBottom: "16px" }}>
//         <label
//           style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}
//         >
//           JSON Veri Setini Buraya Yapıştırın:
//         </label>
//         <textarea
//           rows={6}
//           value={rawJsonInput}
//           onChange={(e) => setRawJsonInput(e.target.value)}
//           placeholder='Örn: [{"Eng": "River", "tr": "Nehir", "emoji": ""}, {"Eng": "Come over", "tr": "Uğramak"}]'
//           style={{
//             width: "100%",
//             padding: "10px",
//             fontFamily: "monospace",
//             fontSize: "0.9rem",
//             borderRadius: "8px",
//             border: parseError ? "2px solid #ef4444" : "1px solid #ccc",
//             boxSizing: "border-box",
//           }}
//         />
//         {parseError && (
//           <div
//             style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "4px" }}
//           >
//             {parseError}
//           </div>
//         )}
//       </div>

//       {/* Kontrol ve Dışa Aktarma Çubuğu */}
//       {enrichedList.length > 0 && (
//         <>
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: "10px",
//               alignItems: "center",
//               marginBottom: "16px",
//               padding: "12px",
//               backgroundColor: "#f8fafc",
//               borderRadius: "8px",
//               border: "1px solid #e2e8f0",
//             }}
//           >
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="İngilizce, Türkçe, emoji veya dosya adı ara..."
//               style={{
//                 padding: "8px 12px",
//                 flex: 1,
//                 minWidth: "200px",
//                 borderRadius: "6px",
//                 border: "1px solid #ccc",
//               }}
//             />

//             <label
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 cursor: "pointer",
//                 fontSize: "0.9rem",
//               }}
//             >
//               <input
//                 type="checkbox"
//                 checked={onlyMissing}
//                 onChange={(e) => setOnlyMissing(e.target.checked)}
//               />
//               Sadece Eksikleri Göster ({missingCount})
//             </label>

//             <button
//               type="button"
//               onClick={handleDownloadJson}
//               style={{
//                 padding: "8px 14px",
//                 cursor: "pointer",
//                 backgroundColor: "#4f46e5",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: "6px",
//               }}
//             >
//               JSON İndir ({enrichedList.length})
//             </button>
//             <button
//               type="button"
//               onClick={handleCopyJson}
//               style={{
//                 padding: "8px 14px",
//                 cursor: "pointer",
//                 backgroundColor: "#0f172a",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: "6px",
//               }}
//             >
//               {copied ? "Kopyalandı ✓" : "JSON Kopyala"}
//             </button>
//           </div>

//           {/* Sonuç Kartları */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
//               gap: "12px",
//             }}
//           >
//             {filteredList.map((item, idx) => {
//               const isMissing = !item.image && !item.emoji;

//               return (
//                 <div
//                   key={`${item.Eng}-${idx}`}
//                   style={{
//                     border: isMissing ? "2px solid #f59e0b" : "1px solid #ddd",
//                     backgroundColor: isMissing ? "#fffbeb" : "#fff",
//                     borderRadius: "10px",
//                     padding: "12px",
//                     display: "flex",
//                     flexDirection: "column",
//                     justifyContent: "space-between",
//                     gap: "10px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "12px",
//                     }}
//                   >
//                     {/* Önce resim varsa göster, yoksa emojiyi göster, ikisi de yoksa soru işareti */}
//                     {item.image ? (
//                       <img
//                         src={`/${item.image}`}
//                         alt={item.Eng}
//                         style={{
//                           width: "36px",
//                           height: "36px",
//                           objectFit: "contain",
//                         }}
//                       />
//                     ) : (
//                       <span
//                         style={{
//                           fontSize: "2rem",
//                           minWidth: "36px",
//                           textAlign: "center",
//                         }}
//                       >
//                         {item.emoji || "❓"}
//                       </span>
//                     )}

//                     <div style={{ overflow: "hidden" }}>
//                       <strong
//                         style={{ display: "block", wordBreak: "break-word" }}
//                       >
//                         {item.Eng}
//                       </strong>
//                       <div style={{ fontSize: "0.85rem", color: "#555" }}>
//                         {item.tr}
//                       </div>
//                       {item.image && (
//                         <div
//                           style={{
//                             fontSize: "0.75rem",
//                             color: "#16a34a",
//                             fontFamily: "monospace",
//                           }}
//                         >
//                           🖼️ {item.image}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Eksik olanlar için belirgin, diğerleri için yardımcı Flaticon butonu */}
//                   <button
//                     type="button"
//                     onClick={() => openFlaticonSearch(item.Eng)}
//                     style={{
//                       padding: "6px 10px",
//                       fontSize: "0.8rem",
//                       cursor: "pointer",
//                       borderRadius: "6px",
//                       border: isMissing
//                         ? "1px solid #d97706"
//                         : "1px solid #cbd5e1",
//                       backgroundColor: isMissing ? "#fef3c7" : "#f1f5f9",
//                       color: isMissing ? "#92400e" : "#334155",
//                       fontWeight: isMissing ? "bold" : "normal",
//                     }}
//                   >
//                     {isMissing
//                       ? "⚠️ Eksik: Flaticon'da Ara ↗"
//                       : "Flaticon'da Ara ↗"}
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useMemo, useState } from "react";
import emojilib from "emojilib";

// Vite üzerinden public klasöründeki tüm svg ve png dosyalarını otomatik alır
const imagesModule = import.meta.glob("/public/*.{svg,png}", {
  eager: true,
});

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "and",
  "or",
  "up",
]);

const CUSTOM_EMOJI_MAP = {
  "Come over": "🏡",
  "Get on well": "🤝",
  "Doing origami": "🦢",
  "Tidying up the house": "🧹",
  "Visiting a museum": "🏛️",
};

const STATUS_CONFIG = {
  done: {
    label: "Olmuş (Tamam)",
    shortLabel: "Olmuş",
    cardClass: "border-emerald-400 bg-emerald-50/70 ring-1 ring-emerald-300",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  pending: {
    label: "Henüz Eklenmedi",
    shortLabel: "Eklenmedi",
    cardClass: "border-amber-400 bg-amber-50/80 ring-1 ring-amber-300",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  todo: {
    label: "Yapılacaklar",
    shortLabel: "Yapılacak",
    cardClass: "border-rose-400 bg-rose-50/70 ring-1 ring-rose-300",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

function buildImageIndex() {
  const map = {};
  const fileNames = Object.keys(imagesModule).map((path) =>
    path.split("/").pop(),
  );

  for (const fileName of fileNames) {
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const normalized = baseName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalized) {
      map[normalized] = fileName;
    }
  }
  return map;
}

function matchImage(engText, imageIndex) {
  if (!engText) return null;

  const parts = engText.split("/").map((p) => p.trim());
  for (const part of parts) {
    const normalized = part.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (imageIndex[normalized]) {
      return imageIndex[normalized];
    }
  }
  return null;
}

function buildKeywordIndex() {
  const index = {};
  for (const [emojiChar, keywords] of Object.entries(emojilib)) {
    for (const kw of keywords) {
      const normalized = kw.replace(/_/g, " ").toLowerCase();
      if (!index[normalized]) {
        index[normalized] = [];
      }
      index[normalized].push(emojiChar);
    }
  }
  return index;
}

function getCandidateTerms(engText) {
  const parts = engText
    .toLowerCase()
    .split("/")
    .map((p) => p.trim());

  const candidates = new Set();

  for (const part of parts) {
    candidates.add(part);
    const words = part
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w && !STOP_WORDS.has(w));

    for (let i = words.length - 1; i >= 0; i--) {
      candidates.add(words[i]);
    }
  }

  return Array.from(candidates);
}

function matchEmoji(item, keywordIndex) {
  if (CUSTOM_EMOJI_MAP[item.Eng]) {
    return CUSTOM_EMOJI_MAP[item.Eng];
  }

  const candidates = getCandidateTerms(item.Eng || "");

  for (const term of candidates) {
    if (keywordIndex[term]?.length) {
      return keywordIndex[term][0];
    }
  }

  for (const term of candidates) {
    if (term.length < 3) continue;
    const partial = Object.entries(keywordIndex).find(([kw]) =>
      kw.includes(term),
    );
    if (partial?.[1]?.length) {
      return partial[1][0];
    }
  }

  return item.emoji || "";
}

function parseInputData(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed) return { data: [], error: null };

  try {
    const startIdx = trimmed.indexOf("[");
    const endIdx = trimmed.lastIndexOf("]");
    const jsonCandidate =
      startIdx !== -1 && endIdx !== -1
        ? trimmed.slice(startIdx, endIdx + 1)
        : trimmed;

    const parsed = JSON.parse(jsonCandidate);
    if (!Array.isArray(parsed)) {
      return {
        data: [],
        error: "Yapıştırılan veri bir JSON dizisi ([...]) olmalıdır.",
      };
    }
    return { data: parsed, error: null };
  } catch {
    return {
      data: [],
      error:
        "Geçersiz JSON formatı. Anahtarların çift tırnak içinde olduğundan emin olun.",
    };
  }
}

export default function EmojiMatcher() {
  const [rawJsonInput, setRawJsonInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "done" | "pending" | "todo" | "missing"
  const [statusMap, setStatusMap] = useState({}); // { [itemKey]: "done" | "pending" | "todo" }
  const [copied, setCopied] = useState(false);

  const keywordIndex = useMemo(() => buildKeywordIndex(), []);
  const imageIndex = useMemo(() => buildImageIndex(), []);

  const { data: parsedList, error: parseError } = useMemo(
    () => parseInputData(rawJsonInput),
    [rawJsonInput],
  );

  const enrichedList = useMemo(
    () =>
      parsedList.map((item, idx) => {
        const matchedImage = matchImage(item.Eng, imageIndex);
        const matchedEmoji = matchEmoji(item, keywordIndex);
        const key = `${item.Eng || "item"}-${idx}`;
        const defaultStatus = matchedImage || matchedEmoji ? "done" : "todo";
        const status = statusMap[key] || defaultStatus;

        return {
          ...item,
          __key: key,
          __status: status,
          emoji: matchedEmoji,
          ...(matchedImage ? { image: matchedImage } : {}),
        };
      }),
    [parsedList, imageIndex, keywordIndex, statusMap],
  );

  const stats = useMemo(() => {
    let done = 0;
    let pending = 0;
    let todo = 0;
    let missing = 0;

    for (const item of enrichedList) {
      if (item.__status === "done") done++;
      else if (item.__status === "pending") pending++;
      else if (item.__status === "todo") todo++;

      if (!item.image && !item.emoji) missing++;
    }

    return { done, pending, todo, missing };
  }, [enrichedList]);

  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();

    return enrichedList.filter((item) => {
      if (statusFilter === "missing" && (item.image || item.emoji)) {
        return false;
      }
      if (
        statusFilter !== "all" &&
        statusFilter !== "missing" &&
        item.__status !== statusFilter
      ) {
        return false;
      }

      if (!q) return true;
      return (
        (item.Eng || "").toLowerCase().includes(q) ||
        (item.tr || "").toLowerCase().includes(q) ||
        (item.emoji || "").includes(q) ||
        (item.image || "").toLowerCase().includes(q)
      );
    });
  }, [enrichedList, search, statusFilter]);

  const setItemStatus = (itemKey, nextStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [itemKey]: nextStatus,
    }));
  };

  // Dışa aktarırken iç takip alanlarını (__key, __status) temizler
  const getExportData = () =>
    enrichedList.map(({ __key, __status, ...cleanItem }) => cleanItem);

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(getExportData(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "updatedWordsList.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(getExportData(), null, 2),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openFlaticonSearch = (engWord) => {
    const cleanWord = engWord.split("/")[0].trim();
    const url = `https://www.flaticon.com/search?word=${encodeURIComponent(cleanWord)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-7xl p-5 font-sans text-slate-800">
      {/* JSON Giriş Alanı */}
      <div className="mb-5">
        <label
          htmlFor="json-input"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          JSON Veri Setini Buraya Yapıştırın:
        </label>
        <textarea
          id="json-input"
          rows={6}
          value={rawJsonInput}
          onChange={(e) => setRawJsonInput(e.target.value)}
          placeholder='Örn: [{"Eng": "River", "tr": "Nehir", "emoji": ""}, {"Eng": "Come over", "tr": "Uğramak"}]'
          className={`w-full rounded-xl border p-3 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 ${
            parseError
              ? "border-rose-500 ring-rose-200"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
          }`}
        />
        {parseError && (
          <p className="mt-1.5 text-xs font-medium text-rose-600">
            {parseError}
          </p>
        )}
      </div>

      {enrichedList.length > 0 && (
        <>
          {/* İlerleme Özet Barı */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === "done" ? "all" : "done")
              }
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left transition ${
                statusFilter === "done"
                  ? "border-emerald-600 bg-emerald-600 text-white shadow"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">
                Olmuş (Yeşil)
              </span>
              <span className="text-lg font-extrabold">{stats.done}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === "pending" ? "all" : "pending")
              }
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left transition ${
                statusFilter === "pending"
                  ? "border-amber-500 bg-amber-500 text-white shadow"
                  : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">
                Henüz Eklenmedi
              </span>
              <span className="text-lg font-extrabold">{stats.pending}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === "todo" ? "all" : "todo")
              }
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left transition ${
                statusFilter === "todo"
                  ? "border-rose-600 bg-rose-600 text-white shadow"
                  : "border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">
                Yapılacaklar
              </span>
              <span className="text-lg font-extrabold">{stats.todo}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === "missing" ? "all" : "missing")
              }
              className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left transition ${
                statusFilter === "missing"
                  ? "border-slate-800 bg-slate-800 text-white shadow"
                  : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">
                Görsel/Emoji Yok
              </span>
              <span className="text-lg font-extrabold">{stats.missing}</span>
            </button>
          </div>

          {/* Arama ve Dışa Aktarma Çubuğu */}
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İngilizce, Türkçe, emoji veya dosya adı ara..."
              className="min-w-[220px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />

            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Filtreyi Temizle
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadJson}
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              JSON İndir ({enrichedList.length})
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {copied ? "Kopyalandı ✓" : "JSON Kopyala"}
            </button>
          </div>

          {/* Sonuç Kartları */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredList.map((item) => {
              const isMissing = !item.image && !item.emoji;
              const currentCfg =
                STATUS_CONFIG[item.__status] || STATUS_CONFIG.todo;

              return (
                <div
                  key={item.__key}
                  className={`flex flex-col justify-between gap-3 rounded-xl border-2 p-3.5 shadow-sm transition ${currentCfg.cardClass}`}
                >
                  {/* Üst Kısım: 3 Durum Butonu (Yeşil - Turuncu - Kırmızı) */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div
                      className="flex items-center gap-1.5"
                      role="group"
                      aria-label="Kelime durumu"
                    >
                      <button
                        type="button"
                        title="Olmuş (Tamamlandı)"
                        onClick={() => setItemStatus(item.__key, "done")}
                        className={`h-6 w-6 cursor-pointer rounded-full border transition ${
                          item.__status === "done"
                            ? "scale-110 border-emerald-800 bg-emerald-500 ring-2 ring-emerald-300"
                            : "border-emerald-300 bg-emerald-200/70 opacity-60 hover:opacity-100"
                        }`}
                      />
                      <button
                        type="button"
                        title="Yapıldı ama henüz eklenmedi"
                        onClick={() => setItemStatus(item.__key, "pending")}
                        className={`h-6 w-6 cursor-pointer rounded-full border transition ${
                          item.__status === "pending"
                            ? "scale-110 border-amber-700 bg-amber-500 ring-2 ring-amber-300"
                            : "border-amber-300 bg-amber-200/70 opacity-60 hover:opacity-100"
                        }`}
                      />
                      <button
                        type="button"
                        title="Yapılacaklar"
                        onClick={() => setItemStatus(item.__key, "todo")}
                        className={`h-6 w-6 cursor-pointer rounded-full border transition ${
                          item.__status === "todo"
                            ? "scale-110 border-rose-800 bg-rose-500 ring-2 ring-rose-300"
                            : "border-rose-300 bg-rose-200/70 opacity-60 hover:opacity-100"
                        }`}
                      />
                    </div>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${currentCfg.badgeClass}`}
                    >
                      {currentCfg.shortLabel}
                    </span>
                  </div>

                  {/* Orta Kısım: Görsel / Emoji ve Kelime Bilgisi */}
                  <div className="flex items-center gap-3 rounded-lg bg-white/80 p-2.5">
                    {item.image ? (
                      <img
                        src={`/${item.image}`}
                        alt={item.Eng}
                        className="h-10 w-10 shrink-0 object-contain"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center text-3xl">
                        {item.emoji || "❓"}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-bold text-slate-900">
                        {item.Eng}
                      </strong>
                      <div className="truncate text-xs text-slate-600">
                        {item.tr}
                      </div>
                      {item.image && (
                        <div className="mt-0.5 truncate font-mono text-[11px] font-medium text-emerald-700">
                          🖼️ {item.image}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alt Kısım: Flaticon Arama Butonu */}
                  <button
                    type="button"
                    onClick={() => openFlaticonSearch(item.Eng)}
                    className={`w-full cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      isMissing
                        ? "border-amber-500 bg-amber-100 text-amber-900 hover:bg-amber-200"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isMissing
                      ? "⚠️ Eksik: Flaticon'da Ara ↗"
                      : "Flaticon'da Ara ↗"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
