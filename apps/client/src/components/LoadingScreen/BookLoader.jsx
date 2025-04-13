import React from "react";

function BookLoader() {
  return (
    <div className="min-h-screen bg-[#3498db]">
      <div
        className="book absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[100px] h-[60px] border-4 border-[#ecf0f1]">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`book__page absolute left-1/2 -top-[5px] w-[50px] h-[60px]
              border-t-4 border-b-4 border-r-4 border-[#ecf0f1] bg-[#3498db]
              origin-left animate-flip -z-${10 * (i + 1)}
              animation-delay-${1.4 * (i + 1)}s`}
          />
        ))}
      </div>
    </div>
  );
}

export default BookLoader;
