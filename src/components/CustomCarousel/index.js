"use client";
import { imageUrl } from "@/config/apiUrl";
import Image from "next/image";
import { useEffect } from "react";
import "swiper/css";
import { register } from "swiper/element/bundle";
import classes from "./CustomCarousel.module.css";

register();

function CustomCarousel({
  data,
  slideClass = "",
  containerClass = "",
  pagination = true,
  navigation = true,
  children,
  slidesPerView = "1",
  direction = "horizontal",
}) {
  useEffect(() => {
    const swiperEl = document.querySelector("swiper-container");

    if (swiperEl) {
      swiperEl.injectStyles = [
        `.swiper-button-next, .swiper-button-prev{ color: var(--white-color)} `,
      ];
      navigation && (swiperEl.navigation = navigation);
      pagination && (swiperEl.pagination = pagination);
      swiperEl.initialize();
    }
  });

  return (
    <div>
      <swiper-container
        class={containerClass}
        init="false"
        slides-per-view={slidesPerView}
        grid-rows="2"
        direction={direction}
      >
        {children
          ? children
          : data?.map((e, i) => (
              <swiper-slide class={slideClass} key={i}>
                <div class={classes?.caroImage}>
                  <Image alt={"image"} src={imageUrl(e)} fill />
                </div>
              </swiper-slide>
            ))}
      </swiper-container>
    </div>
  );
}

export default CustomCarousel;
