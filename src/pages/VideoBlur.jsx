import React, { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Play, Pause, Plus, Trash2, Upload, Download } from "lucide-react";
import fixWebmDuration from "fix-webm-duration";

function VideoPlayerWithBlur() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(15);

  const [blurRegions, setBlurRegions] = useState([
    {
      id: 1,
      x: 50,
      y: 50,
      width: 120,
      height: 120,
      shape: "rect",
      startTime: 0,
      endTime: 5,
      text: "****",
    },
  ]);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration || 0;
      setDuration(vidDuration);
      setBlurRegions((prev) =>
        prev.map((r) => ({ ...r, endTime: Number(vidDuration.toFixed(2)) })),
      );
    }
  };

  const addBlurRegion = (shape = "rect") => {
    const newRegion = {
      id: Date.now(),
      x: 100,
      y: 100,
      width: 120,
      height: 120,
      shape,
      startTime: Number(currentTime.toFixed(2)),
      endTime: Number(Math.min(duration, currentTime + 5).toFixed(2)),
      text: "****",
    };
    setBlurRegions([...blurRegions, newRegion]);
  };

  const updateBlurRegion = (id, newProps) => {
    setBlurRegions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...newProps } : r)),
    );
  };

  const removeBlurRegion = (id) => {
    setBlurRegions((prev) => prev.filter((r) => r.id !== id));
  };

  const getVideoRenderDimensions = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !video.videoWidth)
      return { left: 0, top: 0, width: 0, height: 0 };

    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;
    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;

    const cRatio = cWidth / cHeight;
    const vRatio = vWidth / vHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (vRatio > cRatio) {
      renderWidth = cWidth;
      renderHeight = cWidth / vRatio;
      offsetX = 0;
      offsetY = (cHeight - renderHeight) / 2;
    } else {
      renderHeight = cHeight;
      renderWidth = cHeight * vRatio;
      offsetX = (cWidth - renderWidth) / 2;
      offsetY = 0;
    }

    return {
      left: offsetX,
      top: offsetY,
      width: renderWidth,
      height: renderHeight,
    };
  };

  // Canvas render döngüsü
  useEffect(() => {
    let animationFrameId;

    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (video.videoWidth && video.videoHeight) {
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
      }

      const rect = getVideoRenderDimensions();
      if (rect.width === 0 || rect.height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const scaleX = video.videoWidth / rect.width;
      const scaleY = video.videoHeight / rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const vidTime = video.currentTime;

      blurRegions.forEach((region) => {
        if (vidTime >= region.startTime && vidTime <= region.endTime) {
          ctx.save();
          ctx.beginPath();

          const relX = region.x - rect.left;
          const relY = region.y - rect.top;

          const rx = relX * scaleX;
          const ry = relY * scaleY;
          const rw = region.width * scaleX;
          const rh = region.height * scaleY;

          if (region.shape === "circle") {
            ctx.ellipse(
              rx + rw / 2,
              ry + rh / 2,
              rw / 2,
              rh / 2,
              0,
              0,
              2 * Math.PI,
            );
          } else {
            ctx.rect(rx, ry, rw, rh);
          }

          ctx.clip();
          ctx.filter = `blur(${blurIntensity * scaleX}px)`;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [blurRegions, blurIntensity]);

  // State'e değil videonun gerçek durumuna bakar
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || isExporting) return;

    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e) => {
    if (isExporting) return;
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleExport = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || isExporting) return;

    setIsExporting(true);
    recordedChunksRef.current = [];

    const stream = canvas.captureStream(60);

    // Videonun sesini de kayda ekle (destekleniyorsa)
    try {
      const videoStream = video.captureStream
        ? video.captureStream()
        : video.mozCaptureStream
          ? video.mozCaptureStream()
          : null;
      if (videoStream) {
        videoStream.getAudioTracks().forEach((track) => stream.addTrack(track));
      }
    } catch (err) {
      console.warn("Ses kaydına eklenemedi:", err);
    }

    // MP4 destekleniyorsa onu tercih et (süre/ilerleme çubuğu sorunsuz çalışır),
    // değilse WebM kullan ve süre bilgisini sonradan ekle.
    const candidates = [
      "video/mp4;codecs=avc1.640028,mp4a.40.2",
      "video/mp4;codecs=avc1,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    const mimeType =
      candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
    const isMp4 = mimeType.startsWith("video/mp4");
    const startedAt = performance.now();

    const mediaRecorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: 8000000,
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    const finishDownload = (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blurlu-video-${Date.now()}.${isMp4 ? "mp4" : "webm"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      // Videoyu başa sar ve durumu sıfırla
      video.currentTime = 0;
      setCurrentTime(0);
      setIsExporting(false);
    };

    mediaRecorder.onstop = () => {
      const rawBlob = new Blob(recordedChunksRef.current, {
        type: isMp4 ? "video/mp4" : "video/webm",
      });

      if (isMp4) {
        finishDownload(rawBlob);
      } else {
        // WebM'e süre bilgisini ekle, böylece ilerleme çubuğu çalışır
        const durationMs = Math.max(
          Math.round((video.duration || 0) * 1000),
          Math.round(performance.now() - startedAt),
        );
        try {
          fixWebmDuration(rawBlob, durationMs, (fixedBlob) =>
            finishDownload(fixedBlob || rawBlob),
          );
        } catch (err) {
          console.warn("Süre bilgisi eklenemedi:", err);
          finishDownload(rawBlob);
        }
      }
    };

    const onEnded = () => {
      if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
    };
    video.addEventListener("ended", onEnded, { once: true });

    mediaRecorderRef.current = mediaRecorder;
    video.currentTime = 0;
    mediaRecorder.start(100);
    video.play();
  };

  const formatTimeDetailed = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
  };

  const videoRect = getVideoRenderDimensions();

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 w-full  mx-auto bg-gray-900 text-white rounded-xl shadow-2xl">
      {/* SOL: Video & Çalma Kontrolleri */}
      <div className="flex-1 flex flex-col items-center w-full">
        <div
          ref={containerRef}
          className="relative w-full aspect-video  min-height: 380px bg-black rounded-lg overflow-hidden border border-gray-800 flex items-center justify-center"
        >
          {!videoSrc ? (
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-white transition p-8">
              <Upload size={48} className="mb-2" />
              <span className="font-medium">Bir video dosyası yükleyin</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
          ) : (
            <>
              <video
                ref={videoRef}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                playsInline
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {videoRect.width > 0 && !isExporting && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${videoRect.left}px`,
                    top: `${videoRect.top}px`,
                    width: `${videoRect.width}px`,
                    height: `${videoRect.height}px`,
                  }}
                >
                  <div className="absolute inset-0 pointer-events-auto">
                    {blurRegions.map((region) => {
                      const isActive =
                        currentTime >= region.startTime &&
                        currentTime <= region.endTime;
                      if (!isActive) return null;

                      return (
                        <Rnd
                          key={region.id}
                          size={{ width: region.width, height: region.height }}
                          position={{
                            x: region.x - videoRect.left,
                            y: region.y - videoRect.top,
                          }}
                          bounds="parent"
                          onDragStop={(e, d) =>
                            updateBlurRegion(region.id, {
                              x: d.x + videoRect.left,
                              y: d.y + videoRect.top,
                            })
                          }
                          onResizeStop={(
                            e,
                            direction,
                            ref,
                            delta,
                            position,
                          ) => {
                            updateBlurRegion(region.id, {
                              width: parseInt(ref.style.width),
                              height: parseInt(ref.style.height),
                              x: position.x + videoRect.left,
                              y: position.y + videoRect.top,
                            });
                          }}
                          className={`border-2 border-dashed border-blue-400 bg-blue-500/20 flex items-center justify-center cursor-move ${
                            region.shape === "circle"
                              ? "rounded-full"
                              : "rounded-md"
                          }`}
                        >
                          <span className="text-xs font-bold bg-black/70 px-2 py-0.5 rounded text-white select-none tracking-widest">
                            {region.text || "****"}
                          </span>
                        </Rnd>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {videoSrc && (
          <div className="w-full mt-4 flex flex-col gap-2 bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={isExporting}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-full text-white transition shrink-0"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <span className="text-xs font-mono text-gray-400 w-20 text-right">
                {formatTimeDetailed(currentTime)}
              </span>

              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
                disabled={isExporting}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-gray-700 rounded-lg disabled:opacity-60"
              />

              <span className="text-xs font-mono text-gray-400 w-20">
                {formatTimeDetailed(duration)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SAĞ: Ayarlar Paneli */}
      <div className="w-full lg:w-80 bg-gray-800 p-5 rounded-lg flex flex-col gap-5 shrink-0">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-2">
          Blur Yönetimi
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Blur Şiddeti:{" "}
            <span className="font-bold text-blue-400">{blurIntensity}px</span>
          </label>
          <input
            type="range"
            min="2"
            max="40"
            value={blurIntensity}
            onChange={(e) => setBlurIntensity(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">
            Yeni Bölge Ekle
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addBlurRegion("rect")}
              className="flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm font-medium transition"
            >
              <Plus size={16} /> Dikdörtgen
            </button>
            <button
              onClick={() => addBlurRegion("circle")}
              className="flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm font-medium transition"
            >
              <Plus size={16} /> Daire
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">
            Bölgeler & Ayarlar ({blurRegions.length})
          </label>

          <div className="max-h-64 overflow-y-auto flex flex-col gap-3 pr-1">
            {blurRegions.map((region, index) => (
              <div
                key={region.id}
                className="bg-gray-700/60 p-3 rounded-lg flex flex-col gap-2.5 border border-gray-600/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-300">
                    #{index + 1}{" "}
                    {region.shape === "circle" ? "Daire" : "Dikdörtgen"}
                  </span>
                  <button
                    onClick={() => removeBlurRegion(region.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs mb-0.5">
                    Maske Metni (Örn: ****)
                  </span>
                  <input
                    type="text"
                    value={region.text}
                    onChange={(e) =>
                      updateBlurRegion(region.id, { text: e.target.value })
                    }
                    className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="****"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-400 mb-0.5">Başlangıç (sn)</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max={region.endTime}
                      value={region.startTime}
                      onChange={(e) =>
                        updateBlurRegion(region.id, {
                          startTime: Number(e.target.value),
                        })
                      }
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 mb-0.5">Bitiş (sn)</span>
                    <input
                      type="number"
                      step="0.1"
                      min={region.startTime}
                      max={Number(duration.toFixed(2)) || 999}
                      value={region.endTime}
                      onChange={(e) =>
                        updateBlurRegion(region.id, {
                          endTime: Number(e.target.value),
                        })
                      }
                      className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {videoSrc && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full mt-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg"
          >
            <Download size={18} />
            {isExporting ? "HD Kaydediliyor..." : "HD Videoyu İndir"}
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoPlayerWithBlur;
