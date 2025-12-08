/* eslint no-unused-vars: "off" */
export default function slideNext(speed, runCallbacks = true, internal) {
  const swiper = this;
  const { enabled, params, animating } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === 'undefined') {
    speed = swiper.params.speed;
  }
  let perGroup = params.slidesPerGroup;
  if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
    perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
  }
  const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;

    // Kiểm tra xem loop có bị disable không
    const currentSlidesPerView =
      params.slidesPerView === 'auto'
        ? swiper.slidesPerViewDynamic()
        : Math.ceil(parseFloat(params.slidesPerView, 10));

    if (swiper.slides.length >= currentSlidesPerView) {
      swiper.loopFix({ direction: 'next' });
      // eslint-disable-next-line
      swiper._clientLeft = swiper.wrapperEl.clientLeft;
    }

    if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
      });
      return true;
    }
  }
  if (params.rewind && swiper.isEnd) {
    return swiper.slideTo(0, speed, runCallbacks, internal);
  }
  requestAnimationFrame(() => {
    swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    const slides = swiper.slides;

    if (
      swiper.params?.isSneakPeekCenter &&
      slides.length > 1 &&
      (swiper.activeIndex === slides.length - 1 || swiper.isEnd)
    ) {
      const lastSnapGridIndex = swiper.snapGrid.length - 1;
      const gap = Math.abs(
        swiper.snapGrid[lastSnapGridIndex] - swiper.snapGrid[lastSnapGridIndex - 1],
      );
      const swiperTranslate = structuredClone(swiper.snapGrid[lastSnapGridIndex - 1]);

      // Move first item to last position only if active slide is the last slide
      const firstSlide = slides[0];
      firstSlide.swiperLoopMoveDOM = true;
      swiper.slidesEl.append(firstSlide);
      firstSlide.swiperLoopMoveDOM = false;
      swiper.setTransition(0);
      swiper.setTranslate(-(swiperTranslate - gap));
      swiper.recalcSlides();
      swiper.updateSlides();
      swiper.setTransition(swiper.params.speed);
      swiper.setTranslate(-swiperTranslate);
    }
  });
}
