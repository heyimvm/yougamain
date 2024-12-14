import React, { useState, useRef } from "react";

const LocalVideoInput = () => {
  const [videoSrc, setVideoSrc] = useState(null);
  const videoRef = useRef(null);

  const handleVideoInput = (event) => {
    const file = event.target.files[0]; // Get the first selected file
    if (file) {
      const videoURL = URL.createObjectURL(file); // Create a temporary URL for the video
      setVideoSrc(videoURL);
    }
  };

  const handleVideoPause = () => {
    if (videoRef.current) {
      console.log("Video paused at:", videoRef.current.currentTime);
    }
  };

};

export default LocalVideoInput;
