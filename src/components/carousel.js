"use client";

const customBreakPoints = [
  { width: 1, itemsToShow: 1 },
  { width: 550, itemsToShow: 2 },
  { width: 768, itemsToShow: 3 },
  { width: 1200, itemsToShow: 4 },
];
import CCarousel from "@itseasy21/react-elastic-carousel";
import { useRef, useState } from "react";
export default function Carousel({
  children,
  breakPoints = customBreakPoints,
  verticalMode = true,
  showArrows = false,
  enableAutoPlay = true,
  swipeable = true,
  className = "",
}) {
  const ref = useRef(null);
  const [play, setPlay] = useState(enableAutoPlay);
  return (
    <div
      onMouseOver={() => {
        if (enableAutoPlay) setPlay(false);
      }}
      onMouseLeave={() => {
        if (enableAutoPlay) setPlay(true);
      }}
      className={className}
    >
      <CCarousel
        verticalMode={verticalMode}
        showArrows={showArrows}
        pagination={false}
        breakPoints={breakPoints}
        autoPlaySpeed={2000}
        enableAutoPlay={play}
        enableSwipe={swipeable}
        enableMouseSwipe={swipeable}
        itemsToScroll={1}
        ref={ref}
      >
        {children}
      </CCarousel>
    </div>
  );
}
