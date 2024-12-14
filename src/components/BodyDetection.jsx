import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

const calculateAngle = (pointA, pointB, pointC) => {
  const dx1 = pointA.x - pointB.x;
  const dy1 = pointA.y - pointB.y;
  const dx2 = pointC.x - pointB.x;
  const dy2 = pointC.y - pointB.y;
  
  const dot = dx1 * dx2 + dy1 * dy2;
  const magnitudeA = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const magnitudeB = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  
  const cosAngle = Math.min(Math.max(dot / (magnitudeA * magnitudeB), -1), 1);
  return (Math.acos(cosAngle) * 180) / Math.PI;
};

const MoveNet = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [angles, setAngles] = useState({ leftArm: null, rightArm: null });
  const requestRef = useRef();

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend("webgl");
      await tf.ready();
      
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox
      };
      
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      
      setDetector(detector);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Webcam error:", err);
      }
    };

    loadModel();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!detector || !videoRef.current) return;

    const detectPose = async () => {
      if (videoRef.current.readyState < 2) {
        requestRef.current = requestAnimationFrame(detectPose);
        return;
      }

      const poses = await detector.estimatePoses(videoRef.current);
      
      if (poses.length > 0) {
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        
        const keypoints = poses[0].keypoints;
        
        // Draw keypoints and calculate angles
        drawPose(keypoints, ctx);
        calculateAngles(keypoints);
      }

      requestRef.current = requestAnimationFrame(detectPose);
    };

    detectPose();
  }, [detector]);

  const drawPose = (keypoints, ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw keypoints
    keypoints.forEach(point => {
      if (point.score > 0.3) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });

    // Draw skeleton
    const connections = [
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle'],
      ['left_shoulder', 'right_shoulder'],
      ['left_hip', 'right_hip']
    ];

    connections.forEach(([start, end]) => {
      const point1 = keypoints.find(p => p.name === start);
      const point2 = keypoints.find(p => p.name === end);

      if (point1?.score > 0.3 && point2?.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const calculateAngles = (keypoints) => {
    const getPoint = name => keypoints.find(p => p.name === name);

    const leftShoulder = getPoint('left_shoulder');
    const leftElbow = getPoint('left_elbow');
    const leftWrist = getPoint('left_wrist');
    const rightShoulder = getPoint('right_shoulder');
    const rightElbow = getPoint('right_elbow');
    const rightWrist = getPoint('right_wrist');

    if (leftShoulder?.score > 0.3 && leftElbow?.score > 0.3 && leftWrist?.score > 0.3) {
      const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      setAngles(prev => ({ ...prev, leftArm: leftAngle }));
    }

    if (rightShoulder?.score > 0.3 && rightElbow?.score > 0.3 && rightWrist?.score > 0.3) {
      const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      setAngles(prev => ({ ...prev, rightArm: rightAngle }));
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MoveNet Pose Detection</h1>
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full border-2 border-gray-300"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      <div className="mt-4 space-y-2">
        {angles.leftArm && (
          <p className="text-lg">Left Arm Angle: {angles.leftArm.toFixed(1)}°</p>
        )}
        {angles.rightArm && (
          <p className="text-lg">Right Arm Angle: {angles.rightArm.toFixed(1)}°</p>
        )}
      </div>
    </div>
  );
};

export default MoveNet;