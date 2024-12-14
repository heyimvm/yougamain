import React from "react";
import PoseDetectionOnPause from "./components/Detection";
import { input } from "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import MoveNet from "./components/BodyDetection";
import LocalVideoInput from "./components/input";

const TensorflowCheck = () => {
  console.log("TensorFlow.js version:", tf.version.tfjs);

  return (
    <div>
      <MoveNet/>
      <PoseDetectionOnPause/>
      <LocalVideoInput/>
    </div>
  );
};

export default TensorflowCheck;
