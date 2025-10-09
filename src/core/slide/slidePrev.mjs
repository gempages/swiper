/* eslint no-unused-vars: "off" */
export default function slidePrev(speed, runCallbacks = true, internal) {
  const swiper = this;
  const { params, snapGrid, slidesGrid, rtlTranslate, enabled, animating } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === 'undefined') {
    speed = swiper.params.speed;
  }

  const isVirtual = swiper.virtual && params.virtual.enabled;

  if (params.loop) {
    // Kiểm tra xem loop có bị disable không
    const currentSlidesPerView =
      params.slidesPerView === 'auto'
        ? swiper.slidesPerViewDynamic()
        : Math.ceil(parseFloat(params.slidesPerView, 10));

    if (swiper.slides.length >= currentSlidesPerView) {
      swiper.loopFix({ direction: 'prev' });
      // eslint-disable-next-line
      swiper._clientLeft = swiper.wrapperEl.clientLeft;
    }
  }
  const translate = rtlTranslate ? swiper.translate : -swiper.translate;

  function normalize(val) {
    if (val < 0) return -Math.floor(Math.abs(val));
    return Math.floor(val);
  }
  const normalizedTranslate = normalize(translate);
  const normalizedSnapGrid = snapGrid.map((val) => normalize(val));

  const isFreeMode = params.freeMode && params.freeMode.enabled;
  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
  if (typeof prevSnap === 'undefined' && (params.cssMode || isFreeMode)) {
    let prevSnapIndex;
    snapGrid.forEach((snap, snapIndex) => {
      if (normalizedTranslate >= snap) {
        // prevSnap = snap;
        prevSnapIndex = snapIndex;
      }
    });
    if (typeof prevSnapIndex !== 'undefined') {
      prevSnap = isFreeMode
        ? snapGrid[prevSnapIndex]
        : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
    }
  }
  let prevIndex = 0;
  if (typeof prevSnap !== 'undefined') {
    prevIndex = slidesGrid.indexOf(prevSnap);
    if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
    if (
      params.slidesPerView === 'auto' &&
      params.slidesPerGroup === 1 &&
      params.slidesPerGroupAuto
    ) {
      prevIndex = prevIndex - swiper.slidesPerViewDynamic('previous', true) + 1;
      prevIndex = Math.max(prevIndex, 0);
    }
  }
  if (params.rewind && swiper.isBeginning) {
    const lastIndex =
      swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual
        ? swiper.virtual.slides.length - 1
        : swiper.slides.length - 1;
    return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
  } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
    requestAnimationFrame(() => {
      swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    });
    return true;
  }
  requestAnimationFrame(() => {
    swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    const slides = swiper.slides;

    if (swiper.params?.isSneakPeekCenter && slides.length > 1 && swiper.activeIndex === 0) {
      const gap = Math.abs(swiper.snapGrid[1] - swiper.snapGrid[0]);
      const swiperTranslate = JSON.parse(JSON.stringify(swiper.snapGrid[1]));

      // Move last item to first position only if active slide is the first slide
      const lastSlide = slides[slides.length - 1];
      lastSlide.swiperLoopMoveDOM = true;
      swiper.slidesEl.prepend(lastSlide);
      lastSlide.swiperLoopMoveDOM = false;
      swiper.setTransition(0);
      swiper.setTranslate(-(swiperTranslate + gap));
      swiper.recalcSlides();
      swiper.updateSlides();
      swiper.setTransition(swiper.params.speed);
      swiper.setTranslate(-swiperTranslate);
    }
  });
  return;
}
