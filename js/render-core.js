/**
 * BLUEPRINT PRO - VECTOR RENDERER (CORE, WALLS, & PILLARS)
 * Sets up CAD layers and draws rooms, outer/inner walls, and columns.
 */

function renderBlueprint() {
  const model = State.currentModel;
  if (!model) return;

  const layers = getCADLayers();

  // 1. Clear current layers
  Object.values(layers).forEach(layer => {
    if (layer) layer.innerHTML = '';
  });

  // 2. Set Plot Boundary size
  const plotB = document.getElementById('plot-boundary');
  if (plotB) {
    plotB.setAttribute('x', model.plot.x0);
    plotB.setAttribute('y', model.plot.y0);
    plotB.setAttribute('width', model.plot.width);
    plotB.setAttribute('height', model.plot.height);
  }

  // 3. Render Room base cards & sensors
  renderRoomSensors(model, layers);

  // 4. Render Wall vectors
  renderWalls(model, layers);
  renderRailings(model, layers);

  // 5. Render RCC structural pillars (columns)
  renderPillars(model, layers);

  // 6. Invoke other category visual renderers if loaded
  if (typeof renderOpenings === 'function') renderOpenings(model, layers);
  if (typeof renderFurniture === 'function') renderFurniture(model, layers);
  if (typeof renderMEP === 'function') renderMEP(model, layers);
  if (typeof renderDimensions === 'function') renderDimensions(model, layers);

  applyOrientation();
  toggleBlueprintLayers();
  attachCursorCoordsTracker();
}

function getCADLayers() {
  return {
    architecture: document.getElementById('layer-architecture'),
    furniture: document.getElementById('layer-furniture'),
    dimensions: document.getElementById('layer-dimensions'),
    labels: document.getElementById('layer-labels'),
    ventilation: document.getElementById('layer-ventilation'),
    plumbing: document.getElementById('layer-plumbing'),
    electrical: document.getElementById('layer-electrical')
  };
}

function renderRoomSensors(model, layers) {
  model.rooms.forEach(room => {
    const rx = room.x1;
    const ry = room.y1;
    const rw = room.x2 - room.x1;
    const rh = room.y2 - room.y1;

    const sensor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    sensor.setAttribute('x', rx);
    sensor.setAttribute('y', ry);
    sensor.setAttribute('width', rw);
    sensor.setAttribute('height', rh);
    sensor.setAttribute('class', `room-sensor-bg ${State.selectedComponent && State.selectedComponent.id === room.id ? 'selected' : ''}`);
    sensor.setAttribute('id', `sensor_${room.id}`);
    sensor.addEventListener('click', (e) => {
      e.stopPropagation();
      selectComponent(room, 'room');
    });
    layers.labels.appendChild(sensor);

    const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textLabel.setAttribute('x', rx + rw/2);
    textLabel.setAttribute('y', ry + rh/2 - 4);
    textLabel.setAttribute('class', 'cad-label-room');
    textLabel.textContent = room.name;
    layers.labels.appendChild(textLabel);

    const textArea = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textArea.setAttribute('x', rx + rw/2);
    textArea.setAttribute('y', ry + rh/2 + 10);
    textArea.setAttribute('class', 'cad-label-area');
    textArea.textContent = `${room.width_ft}' x ${room.height_ft}' (${room.area_sqft} sq ft)`;
    layers.labels.appendChild(textArea);
  });
}

function renderWalls(model, layers) {
  model.walls.outerWalls.forEach(w => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    path.setAttribute('x1', w.x1);
    path.setAttribute('y1', w.y1);
    path.setAttribute('x2', w.x2);
    path.setAttribute('y2', w.y2);
    path.setAttribute('class', 'cad-wall-outer');
    path.setAttribute('stroke-width', w.thickness);
    layers.architecture.appendChild(path);
  });

  model.walls.innerWalls.forEach(w => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    path.setAttribute('x1', w.x1);
    path.setAttribute('y1', w.y1);
    path.setAttribute('x2', w.x2);
    path.setAttribute('y2', w.y2);
    path.setAttribute('class', 'cad-wall-inner');
    path.setAttribute('stroke-width', w.thickness);
    layers.architecture.appendChild(path);
  });
}

function renderPillars(model, layers) {
  let layerColumns = document.getElementById('layer-columns');
  if (!layerColumns) {
    layerColumns = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    layerColumns.setAttribute('id', 'layer-columns');
    layers.architecture.appendChild(layerColumns);
  } else {
    layerColumns.innerHTML = '';
  }

  model.columns.forEach(col => {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', col.x);
    r.setAttribute('y', col.y);
    r.setAttribute('width', col.width);
    r.setAttribute('height', col.height);
    r.setAttribute('class', 'cad-column');
    r.setAttribute('rx', 2);
    
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `Structural RCC Pillar (${Math.round(col.width/Generator.SCALE * 12)} in x ${Math.round(col.height/Generator.SCALE * 12)} in)`;
    r.appendChild(title);
    
    layerColumns.appendChild(r);
  });
}

function toggleBlueprintLayers() {
  const layers = {
    architecture: document.getElementById('layer-architecture'),
    furniture: document.getElementById('layer-furniture'),
    ventilation: document.getElementById('layer-ventilation'),
    plumbing: document.getElementById('layer-plumbing'),
    electrical: document.getElementById('layer-electrical')
  };

  if (!layers.architecture) return;

  layers.architecture.style.display = 'block';
  layers.furniture.style.display = (State.activeLayer === 'architecture' || State.activeLayer === 'ventilation') ? 'block' : 'none';
  layers.ventilation.style.display = (State.activeLayer === 'ventilation') ? 'block' : 'none';
  layers.plumbing.style.display = (State.activeLayer === 'plumbing') ? 'block' : 'none';
  layers.electrical.style.display = (State.activeLayer === 'electrical') ? 'block' : 'none';

  // Include Columns display toggle inside architecture layer if active
  const layerColumns = document.getElementById('layer-columns');
  if (layerColumns) {
    layerColumns.style.display = (State.activeLayer === 'architecture') ? 'block' : 'none';
  }
}

function renderRailings(model, layers) {
  if (!model.walls.railings) return;
  model.walls.railings.forEach(r => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    path.setAttribute('x1', r.x1);
    path.setAttribute('y1', r.y1);
    path.setAttribute('x2', r.x2);
    path.setAttribute('y2', r.y2);
    path.setAttribute('class', 'cad-balcony-railing');
    layers.architecture.appendChild(path);
  });
}

function applyOrientation() {
  const model = State.currentModel;
  if (!model) return;

  const facing = model.plot.orientation || 'E';
  let bpAngle = 0;
  let needleAngle = 0;

  if (facing === 'E' || facing === 'east') {
    bpAngle = -90;
    needleAngle = 90;
  } else if (facing === 'S' || facing === 'south') {
    bpAngle = 180;
    needleAngle = 180;
  } else if (facing === 'W' || facing === 'west') {
    bpAngle = 90;
    needleAngle = -90;
  } else {
    bpAngle = 0;
    needleAngle = 0;
  }

  const orientGroup = document.getElementById('orientation-group');
  if (orientGroup) {
    const cx = model.plot.x0 + model.plot.width / 2;
    const cy = model.plot.y0 + model.plot.height / 2;
    orientGroup.setAttribute('transform', `rotate(${bpAngle}, ${cx}, ${cy})`);
  }

  const needleGroup = document.getElementById('compass-needle-group');
  if (needleGroup) {
    needleGroup.setAttribute('transform', `rotate(${needleAngle}, 50, 50)`);
  }
}
