/**
 * BLUEPRINT PRO - USER INTERACTION EVENT BINDINGS
 * Connects configurator, pricing sliders, tabs, layers, and exports to handlers.
 */

function setupEventListeners() {
  const inputs = ['plot-area', 'aspect-ratio'];
  inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
      if (id === 'plot-area') {
        document.getElementById('plot-area-val').innerText = `${e.target.value} sq ft`;
      } else if (id === 'aspect-ratio') {
        const ratio = parseFloat(e.target.value).toFixed(2);
        let text = `${ratio}`;
        if (Math.abs(ratio - 1.33) < 0.05) text = `4:3 (${ratio})`;
        else if (Math.abs(ratio - 1.0) < 0.05) text = `1:1 (${ratio})`;
        else if (Math.abs(ratio - 1.5) < 0.05) text = `3:2 (${ratio})`;
        else if (Math.abs(ratio - 1.77) < 0.05) text = `16:9 (${ratio})`;
        document.getElementById('aspect-ratio-val').innerText = text;
      }
    });
    
    document.getElementById(id).addEventListener('change', triggerGeneration);
  });

  document.getElementById('plot-facing').addEventListener('change', triggerGeneration);

  // BHK configuration dynamic limits
  document.querySelectorAll('input[name="bhk-count"]').forEach(rad => {
    rad.addEventListener('change', () => {
      adjustAreaRangeForBHK();
      adjustBathroomsForBHK();
      triggerGeneration();
    });
  });
  document.querySelectorAll('input[name="bath-count"]').forEach(rad => {
    rad.addEventListener('change', triggerGeneration);
  });


  // Pricing inputs (bidirectional synchronization between slider and typeable box)
  const priceKeys = ['cement', 'steel', 'sand', 'bricks', 'tiles'];
  priceKeys.forEach(key => {
    const slider = document.getElementById(`price-slider-${key}`);
    const box = document.getElementById(`price-box-${key}`);
    
    if (!slider || !box) return;

    slider.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = 0;
      box.value = val;
      State.prices[key] = val;
      updateCivilEstimations();
    });

    box.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = 0;
      slider.value = val;
      State.prices[key] = val;
      updateCivilEstimations();
    });
  });

  // Floating Design HUD Selector buttons (Bottom Center)
  const designBtns = document.querySelectorAll('.design-btn');
  designBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      designBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const style = btn.dataset.style;
      document.getElementById('design-style').value = style;
      triggerGeneration();
    });
  });

  // Tabs navigation switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${btn.dataset.tab}`);
      targetPane.classList.add('active');
    });
  });

  // Layer switches
  const layerBtns = document.querySelectorAll('.layer-btn');
  layerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      layerBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      State.activeLayer = btn.dataset.layer;
      toggleBlueprintLayers();
    });
  });

  window.addEventListener('mousemove', handleElementDrag);
  window.addEventListener('mouseup', endElementDrag);

  // Export buttons
  document.getElementById('btn-print-pdf').addEventListener('click', () => window.print());
  document.getElementById('btn-download-boq').addEventListener('click', downloadBoQCSV);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resetView();
  });
  window.addEventListener('resize', resetView);
}
