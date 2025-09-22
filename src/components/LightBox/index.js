"use client";
import React from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
function LightBox({ children, images = [] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={images}
        carousel={{ finite: true }}
      />
    </>
  );
}

export default LightBox;
