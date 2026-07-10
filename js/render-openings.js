/**
 * BLUEPRINT PRO - VECTOR RENDERER (OPENINGS)
 * Renders door arcs and window frames into the CAD canvas viewport.
 */

function renderOpenings(model, layers) {
  // Render Windows
  model.openings.windows.forEach(win => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'interactive-node');
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectComponent(win, 'window');
    });

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', win.x);
    rect.setAttribute('y', win.y);
    if (win.orientation === 'H') {
      rect.setAttribute('width', win.width);
      rect.setAttribute('height', 10);
      rect.setAttribute('transform', 'translate(0, -5)');
    } else {
      rect.setAttribute('width', 10);
      rect.setAttribute('height', win.width);
      rect.setAttribute('transform', 'translate(-5, 0)');
    }
    rect.setAttribute('class', 'cad-window-frame');
    g.appendChild(rect);

    const glass = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    if (win.orientation === 'H') {
      glass.setAttribute('x1', win.x);
      glass.setAttribute('y1', win.y);
      glass.setAttribute('x2', win.x + win.width);
      glass.setAttribute('y2', win.y);
    } else {
      glass.setAttribute('x1', win.x);
      glass.setAttribute('y1', win.y);
      glass.setAttribute('x2', win.x);
      glass.setAttribute('y2', win.y + win.width);
    }
    glass.setAttribute('class', 'cad-window-glass');
    g.appendChild(glass);

    layers.architecture.appendChild(g);
  });

  // Render Doors
  model.openings.doors.forEach(door => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${door.x}, ${door.y}) rotate(${door.angle})`);
    
    const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leaf.setAttribute('x1', 0);
    leaf.setAttribute('y1', 0);
    leaf.setAttribute('x2', 0);
    leaf.setAttribute('y2', -door.width);
    leaf.setAttribute('class', 'cad-door-leaf');
    leaf.setAttribute('data-type', door.type);
    g.appendChild(leaf);

    const swing = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathD = door.direction === 'in-left' 
      ? `M 0 -${door.width} A ${door.width} ${door.width} 0 0 0 -${door.width} 0`
      : `M 0 -${door.width} A ${door.width} ${door.width} 0 0 1 ${door.width} 0`;
    swing.setAttribute('d', pathD);
    swing.setAttribute('class', 'cad-door-swing');
    swing.setAttribute('data-type', door.type);
    g.appendChild(swing);

    layers.architecture.appendChild(g);
  });
}
