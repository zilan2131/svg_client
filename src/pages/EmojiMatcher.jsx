import React, { useMemo, useState } from "react";
import emojilib from "emojilib";
import wordsList from "../components/wordslist";

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

  const candidates = getCandidateTerms(item.Eng);

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

  return item.emoji;
}

export default function EmojiMatcher() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const keywordIndex = useMemo(() => buildKeywordIndex(), []);

  const enrichedList = useMemo(
    () =>
      wordsList.map((item) => ({
        ...item,
        emoji: matchEmoji(item, keywordIndex),
      })),
    [keywordIndex],
  );

  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return enrichedList;
    return enrichedList.filter(
      (item) =>
        item.Eng.toLowerCase().includes(q) ||
        item.tr.toLowerCase().includes(q) ||
        item.emoji.includes(q),
    );
  }, [enrichedList, search]);

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(enrichedList, null, 2)], {
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
    await navigator.clipboard.writeText(JSON.stringify(enrichedList, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İngilizce veya Türkçe kelime ara..."
          style={{ padding: "8px", flex: 1 }}
        />
        <button type="button" onClick={handleDownloadJson}>
          JSON İndir
        </button>
        <button type="button" onClick={handleCopyJson}>
          {copied ? "Kopyalandı" : "JSON Kopyala"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        {filteredList.map((item) => (
          <div
            key={item.Eng}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>{item.emoji}</span>
            <div>
              <strong>{item.Eng}</strong>
              <div style={{ fontSize: "0.85rem", color: "#555" }}>
                {item.tr}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
