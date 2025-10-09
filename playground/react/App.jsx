/* eslint-disable no-restricted-globals */
import React, { useMemo, useRef, useState } from 'react';
// eslint-disable-next-line
import { A11y, Navigation, Pagination, Scrollbar, Mousewheel } from 'swiper/modules';
// eslint-disable-next-line
import { Swiper, SwiperSlide } from 'swiper/swiper-react';

const App = () => {
  const [slides, setSlides] = useState([
    'Slide 1',
    'Slide 2',
    'Slide 3',
    'Slide 4',
    'Slide 5',
    'Slide 6',
  ]);

  const addNewSlide = () => {
    const newSlideNumber = slides.length + 1;
    setSlides([...slides, `Slide ${newSlideNumber}`]);
  };

  const removeSlide = (indexToRemove) => {
    if (slides.length > 1) {
      setSlides(slides.filter((_, index) => index !== indexToRemove));
    }
  };

  const removeLastSlide = () => {
    if (slides.length > 1) {
      setSlides(slides.slice(0, -1));
    }
  };

  const slidesPerView = 2.2;
  const itemNumber = 3;
  const spaceBetween = 10;
  const [swiper, setSwiper] = useState(null);

  const slidesOffsetBefore = useMemo(() => {
    if (!swiper) return 0;
    const slidesWidth = swiper?.width - spaceBetween * (itemNumber - 1);
    const offsetBefore = (slidesWidth - (slidesWidth / slidesPerView) * (itemNumber - 2)) / 2;
    return offsetBefore;
  }, [slides.length, slidesPerView, swiper]);

  return (
    <main>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          onClick={addNewSlide}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          ➕ Add New Slide
        </button>
        <button
          onClick={removeLastSlide}
          disabled={slides.length <= 1}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: slides.length <= 1 ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: slides.length <= 1 ? 'not-allowed' : 'pointer',
            marginRight: '10px',
          }}
        >
          🗑️ Remove Last Slide
        </button>
        <span style={{ fontSize: '14px', color: '#666' }}>
          Current slides: {slides.length} | slidesPerView: 4
        </span>
      </div>

      <Swiper
        modules={[Pagination, Mousewheel, Navigation, Scrollbar]}
        onSwiper={(swiper) => {
          setSwiper(swiper);
        }}
        initialSlide={slides.length}
        slidesPerView={slidesPerView}
        loop={true}
        spaceBetween={spaceBetween}
        isSneakPeekCenter={true}
        navigation={true}
        slidesOffsetBefore={slidesOffsetBefore}
        scrollbar
        mousewheel={{ forceToAxis: true, sensitivity: 0.1, releaseOnEdges: true }}
        pagination={{ clickable: true }}
        key={slides.length} // Force re-render when slides change
      >
        {slides.map((slideText, index) => (
          <SwiperSlide key={`${slideText}-${index}`}>
            <div
              style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: '500' }}>{slideText}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlide(index);
                }}
                disabled={slides.length <= 1}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '24px',
                  height: '24px',
                  backgroundColor: slides.length <= 1 ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: slides.length <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '1',
                }}
                title="Remove this slide"
              >
                ×
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </main>
  );
};

export default App;
