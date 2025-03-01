import { useEffect, useState } from 'react';

const images = [
    '/src/assets/images/1.jpg',
    '/src/assets/images/2.jpg',
    '/src/assets/images/3.jpg',
    '/src/assets/images/4.jpg',
];

export default function BackgroundSlideshow() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((current) => (current + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImage ? 'opacity-100 active-slide' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      ))}
    </div>
  );
}