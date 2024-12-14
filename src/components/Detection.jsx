import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

const PoseDetectionOnPause = () => {
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [anglesData, setAnglesData] = useState(null);

  // Load the MoveNet model when the component mounts
  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend("webgl");
      await tf.ready();
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      setDetector(detector);
    };
    loadModel();
  }, []);

  // Handle video input
  const handleVideoInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setVideoSrc(videoURL);
    }
  };

  // Calculate angles between three points
  const calculateAngle = (a, b, c) => {
    const angle =
      (Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)) *
      (180 / Math.PI);
    return Math.abs(angle) % 360;
  };

  // Extract angles and body coordinates based on keypoints
  const extractAnglesAndCoordinates = (keypoints) => {
    const points = {};
    keypoints.forEach((point) => {
      points[point.name] = { x: point.x, y: point.y, score: point.score };
    });

    const angles = {
      leftElbowAngle: calculateAngle(
        points["left_shoulder"],
        points["left_elbow"],
        points["left_wrist"]
      ),
      rightElbowAngle: calculateAngle(
        points["right_shoulder"],
        points["right_elbow"],
        points["right_wrist"]
      ),
      leftKneeAngle: calculateAngle(
        points["left_hip"],
        points["left_knee"],
        points["left_ankle"]
      ),
      rightKneeAngle: calculateAngle(
        points["right_hip"],
        points["right_knee"],
        points["right_ankle"]
      ),
    };

    // Return both angles and all coordinates
    return {
      angles,
      coordinates: points,
    };
  };

  // Handle pose detection when the video is paused
  const handleVideoPause = async () => {
    if (!detector || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ensure canvas matches video display dimensions
    canvas.width = video.videoWidth / 2;
    canvas.height = video.videoHeight / 2;

    const poses = await detector.estimatePoses(video);

    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      const data = extractAnglesAndCoordinates(keypoints);
      setAnglesData({
        timestamp: video.currentTime,
        ...data,
      });
    }
  };

  // Handle extraction of angle and coordinate data into a file
  const handleExtractData = () => {
    if (anglesData) {
      const dataStr = JSON.stringify(anglesData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `pose_data_${anglesData.timestamp.toFixed(2)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Pose Detection</h1>
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoInput}
        className="block mx-auto mb-4"
      />
      {videoSrc && (
        <div className="relative" style={{ width: "640px", height: "360px" }}>
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            onPause={handleVideoPause}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          <canvas
            ref={canvasRef}
            className="relative top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>
      )}

      {/* Extract Data Button */}
      {anglesData && (
        <button
          onClick={handleExtractData}
          className="mt42 bg-blue-500 text-white py-2 px-8 rounded hover:bg-blue-600"
        >
          Extract Data
        </button>
      )}
    </div>
  );
};

export default PoseDetectionOnPause;
