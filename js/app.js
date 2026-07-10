/**
 * BLUEPRINT PRO - MAIN COORDINATOR
 * Initialization script to start listeners and generation loops.
 */

// Initialize Application once DOM completes loading
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  adjustAreaRangeForBHK(); // enforce initial boundaries immediately
  adjustBathroomsForBHK(); // enforce initial bathroom limits immediately
  triggerGeneration();
  setupCanvasPanZoom();
});

/**
 * Adjust the plot area slider ranges depending on BHK
 * to avoid clumsy layouts where rooms cannot fit!
 */
function adjustAreaRangeForBHK() {
  const bhkChecked = document.querySelector('input[name="bhk-count"]:checked');
  const bhk = bhkChecked ? parseInt(bhkChecked.value) : 2;
  const areaInput = document.getElementById('plot-area');
  const areaValDisplay = document.getElementById('plot-area-val');
  if (!areaInput || !areaValDisplay) return;
  
  let minArea = 700, maxArea = 1400, defaultArea = 1000;
  if (bhk === 1) { minArea = 350; maxArea = 800; defaultArea = 550; }
  else if (bhk === 2) { minArea = 700; maxArea = 1400; defaultArea = 1000; }
  else if (bhk === 3) { minArea = 1100; maxArea = 2200; defaultArea = 1500; }
  else if (bhk === 4) { minArea = 1600; maxArea = 3000; defaultArea = 2200; }

  areaInput.min = minArea;
  areaInput.max = maxArea;
  
  let currentVal = parseInt(areaInput.value);
  if (currentVal < minArea || currentVal > maxArea) {
    areaInput.value = defaultArea;
  }
  
  areaValDisplay.innerText = `${areaInput.value} sq ft`;
}

/**
 * Dynamically show/hide bathroom counts options based on BHK count
 */
function adjustBathroomsForBHK() {
  const bhkChecked = document.querySelector('input[name="bhk-count"]:checked');
  const bhk = bhkChecked ? parseInt(bhkChecked.value) : 2;
  
  // Define allowed bathrooms: 1BHK=[1], 2BHK=[1,2], 3BHK=[2,3], 4BHK=[3,4]
  let allowed = [2];
  if (bhk === 1) allowed = [1];
  else if (bhk === 2) allowed = [1, 2];
  else if (bhk === 3) allowed = [2, 3];
  else if (bhk === 4) allowed = [3, 4];

  const bathInputs = document.querySelectorAll('input[name="bath-count"]');
  let currentSelectedAllowed = false;
  let firstAllowedInput = null;

  bathInputs.forEach(input => {
    const val = parseInt(input.value);
    const label = document.querySelector(`label[for="${input.id}"]`);
    
    if (allowed.includes(val)) {
      input.disabled = false;
      if (label) {
        label.style.display = '';
      }
      if (!firstAllowedInput) firstAllowedInput = input;
      if (input.checked) currentSelectedAllowed = true;
    } else {
      input.disabled = true;
      input.checked = false;
      if (label) {
        label.style.display = 'none';
      }
    }
  });

  // Fallback to first allowed input if current selection is disabled
  if (!currentSelectedAllowed && firstAllowedInput) {
    firstAllowedInput.checked = true;
  }
}

/**
 * Gather form parameters and run the layout generator
 */
function triggerGeneration() {
  const plotArea = parseInt(document.getElementById('plot-area').value);
  const aspectRatio = parseFloat(document.getElementById('aspect-ratio').value);
  const plotFacing = document.getElementById('plot-facing').value;
  const bhkChecked = document.querySelector('input[name="bhk-count"]:checked');
  const bhk = bhkChecked ? parseInt(bhkChecked.value) : 2;
  const bathChecked = document.querySelector('input[name="bath-count"]:checked');
  const bathrooms = bathChecked ? parseInt(bathChecked.value) : 2;
  const style = document.getElementById('design-style').value;

  // Run modular solver
  State.currentModel = Generator.generate({
    area: plotArea,
    aspectRatio: aspectRatio,
    bhk: bhk,
    bathrooms: bathrooms,
    style: style,
    orientation: plotFacing
  });

  State.selectedComponent = null;
  hideInspectorDetails();

  // Redraw canvas
  renderBlueprint();
  
  // Update calculations & checks
  updateCivilEstimations();
  updateWarningsChecklist();
  updateStatusBar();

  // Auto-frame view
  resetView();
}
