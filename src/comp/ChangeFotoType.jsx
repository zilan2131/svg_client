import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

function ChangeFotoType() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [svg, setSvg] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const convert = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Lütfen bir resim dosyası seçin.");
      return;
    }

    setStatus("loading");
    setSvg(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("image", file, file.name);

    try {
      const { data } = await axios.post("/api/convert", formData, {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setSvg(data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || err.message);
    }
  };

  // Ctrl+V ile yapıştırma
  useEffect(() => {
    const onPaste = (e) => {
      const file = [...e.clipboardData.files].find((f) =>
        f.type.startsWith("image/"),
      );
      if (file) convert(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    convert(e.dataTransfer.files[0]);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
      <h1 className="font-semibold text-2xl text-center">Resim dönüştürme</h1>

      <div className="mt-6 space-y-6">
        <div>
          <h6 className="mb-2 text-sm text-slate-300">Fotoyu yükleyin</h6>
          <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`cursor-pointer text-center p-8 rounded-xl border-2 border-dashed transition ${
              dragging
                ? "border-sky-400 bg-sky-400/10"
                : "border-slate-700 hover:border-slate-500"
            }`}
          >
            <p className="text-sm text-slate-400">
              Sürükle bırak, <b>Ctrl+V</b> ile yapıştır veya tıkla
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => convert(e.target.files[0])}
            />
          </div>
        </div>

        <div>
          <h6 className="mb-2 text-sm text-slate-300">
            Fotoyu SVG'ye dönüştür
          </h6>

          {status === "idle" && (
            <p className="text-sm text-slate-500">Henüz resim yüklenmedi.</p>
          )}

          {status === "loading" && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-sky-400 animate-pulse">
                {progress < 100
                  ? `Yükleniyor... %${progress}`
                  : "Dönüştürülüyor..."}
              </p>
            </div>
          )}

          {status === "error" && (
            <p className="text-sm text-red-400">{message}</p>
          )}

          {status === "done" && svg && (
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-2">
                <img src={svg.svgUrl} alt={svg.name} className="w-full" />
              </div>
              <p className="text-sm text-emerald-400">
                Kaydedildi: public{svg.svgUrl}
              </p>
              <a
                href={svg.svgUrl}
                download={svg.name}
                className="block text-center py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium"
              >
                SVG'yi indir
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChangeFotoType;
