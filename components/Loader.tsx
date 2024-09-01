import React from "react";

const Loader = () => {
  return (
    <div className="loader">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 66 66"
        height="50px"
        width="50px"
        className="spinner"
      >
        <circle
          stroke="url(#gradient)"
          r="20"
          cy="33"
          cx="33"
          strokeWidth="3"
          fill="transparent"
          className="path"
        ></circle>
        <linearGradient id="gradient">
          <stop stopOpacity="1" stopColor="#Ffffff" offset="0%"></stop>
          <stop stopOpacity="0" stopColor="##A6A9B8" offset="100%"></stop>
        </linearGradient>
      </svg>
    </div>
  );
};

export default Loader;