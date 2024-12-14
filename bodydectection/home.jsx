import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Video Player</h1>
      <form id="videoForm" className="flex flex-col items-center">
        <input
          type="text"
          id="videoLink"
          placeholder="Enter video link"
          className="border border-gray-300 rounded-md px-4 py-2 mb-4 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Load Video
        </button>
      </form>
      <div id="output" className="hidden mt-6">
        <video
          id="videoPlayer"
          controls
          className="w-full max-w-md border border-gray-300 rounded-md"
        >
          <source id="videoSource" src="" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Home;
