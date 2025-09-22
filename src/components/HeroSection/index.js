"use client";
import classes from "./HeroSection.module.css";

function HeroSection({ children, showBg = true, className = "" }) {
  return (
    <div className={[classes?.main, className].join(" ")} data-bg={showBg}>
      {children ?? <></>}
    </div>
  );
}

export default HeroSection;
