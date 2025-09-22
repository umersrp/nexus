export function isMobileViewHook(setIsMobile) {
  if (window !== undefined) {
    window.addEventListener("load", () => {
      getWidthAndDecideScreen(setIsMobile);
    });
    window.addEventListener("resize", () => {
      getWidthAndDecideScreen(setIsMobile);
    });
    getWidthAndDecideScreen(setIsMobile);
  }
}

function getWidthAndDecideScreen(setIsMobile) {
  if (window.screen.width < 992) {
    setIsMobile(true);
  } else {
    setIsMobile(false);
  }
}
