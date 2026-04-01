// src/types/slot.ts

/**
 * Valid display modes for categories.
 * Determines how the category page will be rendered.
 * 
 * - `series`: Default product listing (White background).
 * - `showcase`: Visual product showcase, cards with images etc. (Dark Cinematic).
 * - `landing`: Landing page with rich content and sections (Rich Content).
 */
export type CategoryDisplayMode = 'series' | 'showcase' | 'landing';

/**
 * Valid slot names/types available directly in the database logic.
 * These are used by Authority and dynamic landing sections.
 */
export type ValidSlot = 
  | 'residential' 
  | 'industrial' 
  | 'commercial' 
  | 'accessories' 
  | 'smart-home' 
  | 'summer-cooling' 
  | 'electric-heating' 
  | string;
