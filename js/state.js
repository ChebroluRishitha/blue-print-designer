/**
 * BLUEPRINT PRO - STATE MANAGEMENT
 * Holds global application state and design compliance constants.
 */

const State = {
  currentModel: null,
  selectedComponent: null,
  activeLayer: 'architecture',
  
  zoomLevel: 1.0,
  panX: 0,
  panY: 0,
  isPanning: false,
  startX: 0,
  startY: 0,
  
  dragTarget: null,
  dragStartOffset: { x: 0, y: 0 },
  
  prices: {
    cement: 420,
    steel: 70,
    sand: 2200,
    bricks: 8,
    tiles: 80
  },
  quantities: null
};

const TARGET_LUX = {
  bedroom: 100,
  living: 150,
  kitchen: 250,
  bathroom: 100
};
