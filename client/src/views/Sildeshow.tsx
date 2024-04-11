import React, { useState, useEffect } from 'react';
import { Image } from "@chakra-ui/react";
const Slideshow = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 8000); // Change image every 3 seconds

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, [images.length]);

  return (
    <div style={{"padding": "10px"}}>
      {images.map((image, index) => (
        <Image
          key={index}
          src={image}
          boxSize={{ base: '50px', md: '100px', lg: '500px' }}
          alt={`Slide ${index}`}
          style={{ display: index === currentIndex ? 'block' : 'none'}}
        />
      ))}
    </div>
  );
};

export default Slideshow;
