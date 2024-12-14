import React from 'react';
import BodyDetection from './bodydectection/Bodydetection';

function App() {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl text-white">React Pose Detection App</h1>
      <BodyDetection />
    </div>
  );
}

export default App;

