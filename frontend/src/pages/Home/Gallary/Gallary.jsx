import React, { useState, useEffect } from "react";
import image1 from "../../../assets/gallary/image1.png";
import image2 from "../../../assets/gallary/image2.png";
import image3 from "../../../assets/gallary/image3.png";
import image4 from "../../../assets/gallary/image4.png";

const images = [image1, image2, image3, image4, image1]; // Add your images here

const Gallary = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="w-[90%] md:w-[50%] mx-auto my-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center">
          Our <span className="text-secondary">Gallery</span>
        </h1>
      </div>
      <div className="relative flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`Gallery Image ${currentIndex + 1}`}
          className="w-full h-[400px] object-cover rounded-lg shadow-lg transition-opacity duration-1000 ease-in-out"
        />
        <div className="absolute bottom-4 flex space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-3 w-3 rounded-full transition-colors duration-300 ${currentIndex === index ? "bg-secondary" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallary;
