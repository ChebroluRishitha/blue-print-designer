/**
 * BLUEPRINT PRO - VECTOR RENDERER (MEP)
 * Visualizes plumbing pipe layouts and electrical grids (fan, lights, wiring) on the CAD canvas.
 */

function renderMEP(model, layers) {
  // 1. Riser shafts
  model.plumbing.shafts.forEach(shaft => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    s.setAttribute('x', shaft.x);
    s.setAttribute('y', shaft.y);
    s.setAttribute('width', shaft.width);
    s.setAttribute('height', shaft.height);
    s.setAttribute('class', 'plumb-shaft');
    layers.plumbing.appendChild(s);

    const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l1.setAttribute('x1', shaft.x); l1.setAttribute('y1', shaft.y);
    l1.setAttribute('x2', shaft.x + shaft.width); l1.setAttribute('y2', shaft.y + shaft.height);
    l1.setAttribute('stroke', '#a855f7');
    layers.plumbing.appendChild(l1);

    const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l2.setAttribute('x1', shaft.x + shaft.width); l2.setAttribute('y1', shaft.y);
    l2.setAttribute('x2', shaft.x); l2.setAttribute('y2', shaft.y + shaft.height);
    l2.setAttribute('stroke', '#a855f7');
    layers.plumbing.appendChild(l2);
  });

  // 2. Piping connections
  model.plumbing.pipes.forEach(pipe => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', pipe.path);
    p.setAttribute('class', `plumb-pipe-${pipe.type}`);
    layers.plumbing.appendChild(p);
  });

  // 3. Electrical wiring runs
  model.electrical.wiring.forEach(wire => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const mx = (wire.x1 + wire.x2) / 2;
    const my = (wire.y1 + wire.y2) / 2 - 25;
    p.setAttribute('d', `M ${wire.x1} ${wire.y1} Q ${mx} ${my} ${wire.x2} ${wire.y2}`);
    p.setAttribute('class', 'elec-wire');
    p.setAttribute('id', `wire_from_${wire.from}`);
    layers.electrical.appendChild(p);
  });

  // 4. Electrical lighting nodes & ceiling fans
  model.electrical.lights.forEach(node => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'interactive-node');
    g.setAttribute('id', `grp_${node.id}`);
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectComponent(node, 'electrical');
    });

    if (node.type === 'fan') {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', node.x); c.setAttribute('cy', node.y); c.setAttribute('r', 6);
      c.setAttribute('fill', '#0f172a'); c.setAttribute('stroke', '#fbbf24'); c.setAttribute('stroke-width', 1.5);
      g.appendChild(c);

      for (let i = 0; i < 3; i++) {
        const blade = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const angle = i * 120;
        blade.setAttribute('d', `M ${node.x} ${node.y} Q ${node.x + 10} ${node.y - 10} ${node.x + 18} ${node.y - 4}`);
        blade.setAttribute('fill', 'none'); blade.setAttribute('stroke', '#fbbf24'); blade.setAttribute('stroke-width', 1.5);
        blade.setAttribute('transform', `rotate(${angle}, ${node.x}, ${node.y})`);
        g.appendChild(blade);
      }
    } else {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', node.x); c.setAttribute('cy', node.y); c.setAttribute('r', 8);
      c.setAttribute('class', 'elec-light');
      c.addEventListener('mousedown', (e) => startElementDrag(e, node));
      g.appendChild(c);
      
      const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l1.setAttribute('x1', node.x - 5); l1.setAttribute('y1', node.y - 5);
      l1.setAttribute('x2', node.x + 5); l1.setAttribute('y2', node.y + 5);
      l1.setAttribute('stroke', '#080c14'); l1.setAttribute('pointer-events', 'none');
      g.appendChild(l1);

      const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l2.setAttribute('x1', node.x + 5); l2.setAttribute('y1', node.y - 5);
      l2.setAttribute('x2', node.x - 5); l2.setAttribute('y2', node.y + 5);
      l2.setAttribute('stroke', '#080c14'); l2.setAttribute('pointer-events', 'none');
      g.appendChild(l2);
    }
    layers.electrical.appendChild(g);
  });

  // 5. Switches
  model.electrical.switches.forEach(sw => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    s.setAttribute('x', sw.x - 4); s.setAttribute('y', sw.y - 4);
    s.setAttribute('width', 8); s.setAttribute('height', 8);
    s.setAttribute('class', 'elec-switch');
    layers.electrical.appendChild(s);
  });
}
