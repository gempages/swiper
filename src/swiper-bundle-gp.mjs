import Swiper from './core/core.mjs';
//IMPORT_MODULES_GP

// eslint-disable-next-line
export { default as Swiper, default } from './core/core.mjs';

// Swiper Class - GPs bundle: Navigation, Pagination, Thumbs, Autoplay only
const modules = [
  //INSTALL_MODULES_GP
];
Swiper.use(modules);
