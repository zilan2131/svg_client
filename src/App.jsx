import "./App.css";
import ChangeFotoType from "./comp/ChangeFotoType";
import VoiceChanger from "./comp/VoiceChanger";
function App() {
  return (
    <div className="flex gap-4 p-6">
      {/* Doğrudan public klasöründeki SVG'yi çağırma */}
      {/* <img
        src="/extraEmoji/united.svg"
        alt="Apple"
        className="w-40 h-40 hover:scale-110 transition-transform"
      /> */}
      {/* <VoiceChanger /> */}
      <ChangeFotoType />
    </div>
  );
}

export default App;
