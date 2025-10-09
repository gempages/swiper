import { showWarning } from '../../shared/utils.mjs';

export default function loopFixDot({
  slideRealIndex,
  slideTo = true,
  direction,
  activeSlideIndex,
  initial,
  targetSlideIndex,
  newIndex,
} = {}) {
  const swiper = this;
  if (!swiper.params.loop) return;

  // Disable loop mode nếu số slides ít hơn slidesPerView
  const currentSlidesPerView =
    swiper.params.slidesPerView === 'auto'
      ? swiper.slidesPerViewDynamic()
      : Math.ceil(parseFloat(swiper.params.slidesPerView, 10));

  if (swiper.slides.length < currentSlidesPerView) {
    console.warn('Swiper: Loop mode disabled - slides.length < slidesPerView');
    return;
  }
  swiper.emit('beforeLoopFix');
  const { slides, allowSlidePrev, allowSlideNext, slidesEl, params } = swiper;
  const targetData = slidesEl.children[targetSlideIndex].getAttribute('data-swiper-slide-index');
  const oldActiveData = Array.from(slidesEl.children)
    .find((el) => el.classList.contains(params.slideActiveClass))
    .getAttribute('data-swiper-slide-index');

  const { centeredSlides, initialSlide } = params;
  const swiperDataOldActiveIndex =
    slidesEl.children[swiper.activeIndex].getAttribute('data-swiper-slide-index');

  swiper.allowSlidePrev = true;
  swiper.allowSlideNext = true;
  let slidesPerView = params.slidesPerView;
  if (slidesPerView === 'auto') {
    slidesPerView = swiper.slidesPerViewDynamic();
  } else {
    slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
    if (centeredSlides && slidesPerView % 2 === 0) {
      slidesPerView = slidesPerView + 1;
    }
  }

  const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
  let loopedSlides = centeredSlides
    ? Math.max(slidesPerGroup, Math.ceil(slidesPerView / 2))
    : slidesPerGroup;

  if (loopedSlides % slidesPerGroup !== 0) {
    loopedSlides += slidesPerGroup - (loopedSlides % slidesPerGroup);
  }
  loopedSlides += params.loopAdditionalSlides;
  swiper.loopedSlides = loopedSlides;

  if (
    slides.length < slidesPerView + loopedSlides ||
    (swiper.params.effect === 'cards' && slides.length < slidesPerView + loopedSlides * 2)
  ) {
    showWarning(
      'Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters',
    );
  }

  const isNext = direction === 'next' || !direction;
  const isPrev = direction === 'prev' || !direction;

  let numberOfSlidesNeedClone = [];
  let slidesIndex = [];
  for (let i = 0; i < slidesEl.children.length; i++) {
    slidesIndex.push(slidesEl.children[i].getAttribute('data-swiper-slide-index'));
  }

  if (isPrev) {
    for (let i = targetSlideIndex; i < slidesEl.children.length; i++) {
      numberOfSlidesNeedClone.push(i);
    }
  } else if (isNext) {
    for (let i = 0; i < slidesPerView - (slidesEl.children.length - targetSlideIndex); i++) {
      numberOfSlidesNeedClone.push(i);
    }
  }

  const cols = slides.length;

  const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !centeredSlides;

  let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;

  if (typeof activeSlideIndex === 'undefined') {
    activeSlideIndex = swiper.getSlideIndex(
      slides.find((el) => el.classList.contains(params.slideActiveClass)),
    );
  } else {
    activeIndex = activeSlideIndex;
  }

  // Tạo DocumentFragment để chứa các slide clone
  const cloneFragment = document.createDocumentFragment();

  // Clone các slide theo numberOfSlidesNeedClone (đã đảo ngược) và thêm vào fragment
  (isNext ? numberOfSlidesNeedClone : numberOfSlidesNeedClone.reverse()).forEach((index) => {
    if (slides[index]) {
      const originalSlide = slides[index];
      const clonedSlide = originalSlide.cloneNode(true);

      // Đánh dấu slide clone
      clonedSlide.setAttribute('data-swiper-clone', 'true');
      clonedSlide.classList.add('swiper-slide-clone');

      // Thêm clone vào fragment
      cloneFragment.appendChild(clonedSlide);
    }
  });

  if (isPrev) {
    numberOfSlidesNeedClone.forEach((index) => {
      const originalSlide = slides[index];
      originalSlide.swiperLoopMoveDOM = true;
      slidesEl.prepend(originalSlide);
      originalSlide.swiperLoopMoveDOM = false;
    });
  }

  if (isNext) {
    numberOfSlidesNeedClone.forEach((index) => {
      const originalSlide = slides[index];
      originalSlide.swiperLoopMoveDOM = true;
      slidesEl.append(originalSlide);
      originalSlide.swiperLoopMoveDOM = false;
    });
  }

  // Sắp xếp cloneFragment theo data-swiper-slide-index tăng dần
  const clonedSlides = Array.from(cloneFragment.children);
  clonedSlides.sort((a, b) => {
    const indexA = parseInt(a.getAttribute('data-swiper-slide-index')) || 0;
    const indexB = parseInt(b.getAttribute('data-swiper-slide-index')) || 0;
    return indexA - indexB;
  });

  // Xóa tất cả children cũ và thêm lại theo thứ tự đã sắp xếp
  cloneFragment.innerHTML = '';
  clonedSlides.forEach((slide) => {
    cloneFragment.appendChild(slide);
  });

  // Thêm fragment vào vị trí phù hợp
  if (isPrev) {
    // Nếu là prev, thêm fragment vào cuối slidesEl
    slidesEl.appendChild(cloneFragment);
  } else if (isNext) {
    // Nếu là next, thêm fragment vào đầu slidesEl
    slidesEl.insertBefore(cloneFragment, slidesEl.firstChild);
  }
  swiper.recalcSlides();
  swiper.updateSlides();

  // Tìm slide có data-swiper-slide-index tương ứng
  let oldActiveIndex = null;

  for (let i = 0; i < slidesEl.children.length; i++) {
    const child = slidesEl.children[i];
    if (child.getAttribute('data-swiper-slide-index') === swiperDataOldActiveIndex) {
      oldActiveIndex = i;
      break;
    }
  }

  if (slideTo && oldActiveIndex !== swiper.activeIndex) {
    swiper.slideTo(oldActiveIndex, 0);
  }

  // Tìm vị trí slide cũ sau khi remove clone để set lại translate tạo hiệu ứng animate
  const skip = Math.min(swiper.params.slidesPerGroupSkip, newIndex);
  let snapIndex = skip + Math.floor((newIndex - skip) / swiper.params.slidesPerGroup);
  if (snapIndex >= swiper.snapGrid.length) snapIndex = swiper.snapGrid.length - 1;

  const translate = -swiper.snapGrid[snapIndex];
  if (translate === swiper.translate) {
    let oldActiveIndexAfterRemoveClone;
    for (let i = 0; i < slidesEl.children.length; i++) {
      const child = slidesEl.children[i];
      if (child.getAttribute('data-swiper-slide-index') === swiperDataOldActiveIndex) {
        oldActiveIndexAfterRemoveClone = i;
        break;
      }
    }

    const skip = Math.min(swiper.params.slidesPerGroupSkip, oldActiveIndexAfterRemoveClone);
    let snapIndex =
      skip + Math.floor((oldActiveIndexAfterRemoveClone - skip) / swiper.params.slidesPerGroup);
    if (snapIndex >= swiper.snapGrid.length) snapIndex = swiper.snapGrid.length - 1;
    const oldTranslate = -swiper.snapGrid[snapIndex];
    let updateTranslate;
    if (oldTranslate === swiper.translate) {
      updateTranslate = swiper.snapGrid[snapIndex > 0 ? snapIndex - 1 : swiper.snapGrid.length - 1];
    } else {
      updateTranslate = oldTranslate;
    }
    swiper.setTranslate(updateTranslate);
  }
  // Remove slide clone ra khỏi slidesEl sau khi slideTo hoàn thành
  const cloneSlides = slidesEl.querySelectorAll('[data-swiper-clone="true"]');
  cloneSlides.forEach((cloneSlide) => {
    if (cloneSlide.parentNode) {
      cloneSlide.parentNode.removeChild(cloneSlide);
    }
  });
  swiper.recalcSlides();
  swiper.updateSlides();

  const targetDataIndex = Array.from(slidesEl.children).findIndex(
    (el) => el.getAttribute('data-swiper-slide-index') * 1 === targetData * 1,
  );
  const oldDataIndex = Array.from(slidesEl.children).findIndex(
    (el) => el.getAttribute('data-swiper-slide-index') * 1 === oldActiveData * 1,
  );
  const snapIndexNew = skip + Math.floor((targetDataIndex - skip) / swiper.params.slidesPerGroup);
  const snapIndexOld = skip + Math.floor((oldDataIndex - skip) / swiper.params.slidesPerGroup);

  if (slideTo && snapIndexNew === targetDataIndex) {
    const translateOld =
      -swiper.snapGrid[
        snapIndexOld > swiper.snapGrid.length - 1
          ? snapIndexNew - 1 > swiper.snapGrid.length - 1
            ? 0
            : snapIndexNew - 1
          : snapIndexOld
      ];
    swiper.setTranslate(translateOld);
  }

  swiper.recalcSlides();
  swiper.updateSlides();

  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;

  swiper.emit('loopFixDot');
}
