// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import EmojiMatcher from "./pages/EmojiMatcher";
import PngToSvg from "./pages/PngToSvg";
import VideoBlur from "./pages/VideoBlur";
import WordIMageMatcher from "./pages/WordImageMatcher";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/png-to-svg" element={<PngToSvg />} />
        <Route path="/video-blur" element={<VideoBlur />} />
        <Route path="/emoji-matcher" element={<EmojiMatcher />} />
        <Route path="/word-image-matcher" element={<WordIMageMatcher />} />
      </Routes>
    </BrowserRouter>
  );
}
