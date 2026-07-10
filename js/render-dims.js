/**
 * BLUEPRINT PRO - VECTOR RENDERER (DIMENSIONS)
 * Draws outer dimension lines, label extensions, and wind vectors.
 */

function renderDimensions(model, layers) {
  const plot = model.plot;

  const addDimH = (x1, x2, y, valText) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y); l.setAttribute('x2', x2); l.setAttribute('y2', y);
    l.setAttribute('class', 'cad-dim-line');
    g.appendChild(l);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', (x1 + x2)/2); txt.setAttribute('y', y - 4);
    txt.setAttribute('class', 'cad-dim-text');
    txt.textContent = valText;
    g.appendChild(txt);
    layers.dimensions.appendChild(g);
  };

  const addDimV = (x, y1, y2, valText) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x); l.setAttribute('y1', y1); l.setAttribute('x2', x); l.setAttribute('y2', y2);
    l.setAttribute('class', 'cad-dim-line');
    g.appendChild(l);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', x - 6); txt.setAttribute('y', (y1 + y2)/2);
    txt.setAttribute('class', 'cad-dim-text');
    txt.setAttribute('transform', `rotate(-90, ${x-6}, ${(y1+y2)/2})`);
    txt.textContent = valText;
    g.appendChild(txt);
    layers.dimensions.appendChild(g);
  };

  // Outer boundary annotations
  addDimH(plot.x0, plot.x1, plot.y0 - 15, `${plot.width_ft}.0' W`);
  addDimV(plot.x0 - 15, plot.y0, plot.y1, `${plot.height_ft}.0' L`);

  // Render ventilation wind vectors
  model.ventilation.vectors.forEach(v => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (v.isCross) {
      const mx = (v.x1 + v.x2)/2 - 30;
      const my = (v.y1 + v.y2)/2 - 30;
      path.setAttribute('d', `M ${v.x1} ${v.y1} Q ${mx} ${my} ${v.x2} ${v.y2}`);
    } else {
      path.setAttribute('d', `M ${v.x1} ${v.y1} L ${v.x2} ${v.y2}`);
    }
    path.setAttribute('class', 'vent-flow-arrow');
    layers.ventilation.appendChild(path);
  });
}

function attachCursorCoordsTracker() {
  const canvas = document.getElementById('blueprint-canvas');
  const coordDisplay = document.getElementById('status-cursor-coords');
  const zoomGroup = document.getElementById('zoom-group');
  if (!canvas || !coordDisplay || !zoomGroup) return;

  canvas.addEventListener('mousemove', (e) => {
    const pt = canvas.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const localPt = pt.matrixTransform(zoomGroup.getScreenCTM().inverse());
    
    const xFt = ((localPt.x - Generator.PLOT_PADDING) / Generator.SCALE).toFixed(2);
    const yFt = ((localPt.y - Generator.PLOT_PADDING) / Generator.SCALE).toFixed(2);

    if (localPt.x >= Generator.PLOT_PADDING && localPt.x <= Generator.PLOT_PADDING + State.currentModel.plot.width &&
        localPt.y >= Generator.PLOT_PADDING && localPt.y <= Generator.PLOT_PADDING + State.currentModel.plot.height) {
      coordDisplay.textContent = `X: ${xFt} ft | Y: ${yFt} ft`;
    } else {
      coordDisplay.textContent = `X: 0.00 ft | Y: 0.00 ft`;
    }
  });
}

function updateStatusBar() {
  const model = State.currentModel;
  if (!model) return;
  
  const statusDims = document.getElementById('status-plot-dims');
  const statusBuiltUp = document.getElementById('status-built-up');
  const statusCarpet = document.getElementById('status-carpet');

  if (statusDims) statusDims.textContent = `${model.plot.width_ft}.0' x ${model.plot.height_ft}.0'`;
  if (statusBuiltUp) statusBuiltUp.textContent = `${model.plot.width_ft * model.plot.height_ft} sq ft`;
  
  let carpetArea = 0;
  model.rooms.forEach(r => carpetArea += r.area_sqft);
  if (statusCarpet) statusCarpet.textContent = `${carpetArea} sq ft`;
}
