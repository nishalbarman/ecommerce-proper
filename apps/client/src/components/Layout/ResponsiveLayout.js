import React from "react";
import { useMediaQuery } from "react-responsive";

const ResponsiveLayout = ({ children }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  return (
    <div
      className={`responsive-layout ${isMobile ? "mobile" : isTablet ? "tablet" : "desktop"}`}>
      <div className="container">
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
