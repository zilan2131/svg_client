import React, { useState } from "react";

// Vite'ın glob fonksiyonu ile klasördeki resimleri önceden alıyoruz
const imagesModule = import.meta.glob("/public/*.{svg,png}", {
  eager: true,
});

function GetPictureButton() {
  const [pictureNames, setPictureNames] = useState([]);

  // Butona basıldığında çalışacak fonksiyon
  const handleGetPictureName = () => {
    // Yollardan dosya isimlerini ayıklıyoruz (örn: /src/images/bank.svg -> bank.svg)
    const names = Object.keys(imagesModule).map((path) =>
      path.split("/").pop(),
    );

    setPictureNames(names);
    console.log("Bulunan Resimler:", names);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-sm mx-auto my-4">
      {/* Sadece getPictureName adında buton */}
      <button
        onClick={handleGetPictureName}
        className="px-6 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        getPictureName
      </button>

      {/* Resim isimlerinin listeleneceği alan */}
      {pictureNames.length > 0 && (
        <div className="w-full mt-6">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            Bulunan Resimler:
          </h3>
          <ul className="bg-gray-50 rounded-xl p-3 border border-gray-200 divide-y divide-gray-100 max-h-40 overflow-y-auto">
            {pictureNames.map((name, index) => (
              <li key={index} className="py-2 text-sm text-gray-600 font-mono">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GetPictureButton;
