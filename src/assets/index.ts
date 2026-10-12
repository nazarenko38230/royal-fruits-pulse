/**
 * Re-export of the generated PNG assets (Step 1.5).
 * Every entry here has a matching record in ../../assets.json, so the files
 * always exist at bundle time — AI-generated, or the procedural fallback.
 */
export const IMAGES = {
  appIcon: require('../../assets/icon_1024.png'),
  bgLoader: require('../../assets/bg_loader.png'),
  bgMenu: require('../../assets/bg_menu.png'),
  bgGame: require('../../assets/bg_game.png'),
  crownFruit: require('../../assets/sprite_crown_fruit.png'),
  fruitBerry: require('../../assets/sprite_fruit_berry.png'),
  fruitCitrus: require('../../assets/sprite_fruit_citrus.png'),
  fruitLime: require('../../assets/sprite_fruit_lime.png'),
  fruitPlum: require('../../assets/sprite_fruit_plum.png'),
  leaf: require('../../assets/sprite_leaf.png'),
  buttonCta: require('../../assets/button_cta.png'),
};

/** Index-aligned with COLOUR_RING in src/constants/config.ts. */
export const FRUIT_SPRITES = [
  IMAGES.fruitBerry,
  IMAGES.fruitCitrus,
  IMAGES.fruitLime,
  IMAGES.fruitPlum,
];

export default IMAGES;
