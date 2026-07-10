/**
 * BLUEPRINT PRO - CANVAS VIEW & VIEWPORT NAVIGATION
 * Manages panning, zooming, and resetting view transforms on the CAD canvas.
 */

function setupCanvasPanZoom() {
  const wrapper = document.getElementById('svg-wrapper');
  
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      State.zoomLevel = Math.min(State.zoomLevel * zoomFactor, 5.0);
    } else {
      State.zoomLevel = Math.max(State.zoomLevel / zoomFactor, 0.4);
    }
    applyTransform();
  });

  wrapper.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('elec-light') || 
        e.target.classList.contains('drag-handle') ||
        e.target.classList.contains('cad-window-frame') ||
        e.target.closest('.interactive-node')) {
      return;
    }
    
    State.isPanning = true;
    State.startX = e.clientX - State.panX;
    State.startY = e.clientY - State.panY;
    wrapper.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (State.isPanning) {
      State.panX = e.clientX - State.startX;
      State.panY = e.clientY - State.startY;
      applyTransform();
    }
  });

  window.addEventListener('mouseup', () => {
    State.isPanning = false;
    wrapper.style.cursor = 'grab';
  });

  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    State.zoomLevel = Math.min(State.zoomLevel * 1.2, 5.0);
    applyTransform();
  });

  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    State.zoomLevel = Math.max(State.zoomLevel / 1.2, 0.4);
    applyTransform();
  });

  document.getElementById('btn-zoom-reset').addEventListener('click', resetView);
  document.getElementById('btn-reset-view').addEventListener('click', resetView);
}

function resetView() {
  const wrapper = document.getElementById('svg-wrapper');
  if (!wrapper || !State.currentModel) return;
  
  const plot = State.currentModel.plot;
  const cw = wrapper.clientWidth;
  const ch = wrapper.clientHeight;
  
  // Clean padding since we moved HUD buttons to header bar
  // Swap dimensions if the plot is rotated sideways (East/West facing)
  const facing = plot.orientation || 'E';
  const isRotatedSideways = (facing === 'E' || facing === 'east' || facing === 'W' || facing === 'west');
  
  const widthToFit = isRotatedSideways ? plot.height : plot.width;
  const heightToFit = isRotatedSideways ? plot.width : plot.height;

  const pw = widthToFit + 100;
  const ph = heightToFit + 120; 

  State.zoomLevel = Math.min(cw / pw, ch / ph, 1.55);
  State.panX = (cw - plot.width * State.zoomLevel) / 2 - Generator.PLOT_PADDING * State.zoomLevel;
  State.panY = (ch - plot.height * State.zoomLevel) / 2 - Generator.PLOT_PADDING * State.zoomLevel + 10;

  if (facing === 'N' || facing === 'north' || facing === 'S' || facing === 'south') {
    State.panX -= 35; // Move a bit left
    State.panY -= 35; // Move a bit top
  }

  applyTransform();
}

function applyTransform() {
  const zoomGroup = document.getElementById('zoom-group');
  if (zoomGroup) {
    zoomGroup.setAttribute('transform', `translate(${State.panX}, ${State.panY}) scale(${State.zoomLevel})`);
  }
}
