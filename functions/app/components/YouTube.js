import React from "react";

export default function YouTube({ id }) {
  return (
    <div className="w-full">
      <div className="border-box aspect ratio-16x9">
        <iframe
          title="Youtube video embed"
          src={`https://www.youtube.com/embed/${id}`}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
