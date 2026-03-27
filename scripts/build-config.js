import { parseSwiperBuildModulesEnv } from './utils/helper.js';

const envBuildModules = parseSwiperBuildModulesEnv();

export const modules = envBuildModules || [
  'virtual',
  'keyboard',
  'mousewheel',
  'navigation',
  'pagination',
  'scrollbar',
  'parallax',
  'zoom',
  'controller',
  'a11y',
  'history',
  'hash-navigation',
  'autoplay',
  'thumbs',
  'free-mode',
  'grid',
  'manipulation',
  'effect-fade',
  'effect-cube',
  'effect-flip',
  'effect-coverflow',
  'effect-creative',
  'effect-cards',
];

/** GPs-only: Core + Navigation + Pagination + Thumbs + Autoplay (for element/gp-bundle) */
export const MODULES_GP = [
  'navigation',
  'pagination',
  'thumbs',
  'autoplay',
];

export default {
  modules,
  MODULES_GP,
};
