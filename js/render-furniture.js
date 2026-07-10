/**
 * BLUEPRINT PRO - VECTOR RENDERER (FURNITURE)
 * Places standard interior layout assets like beds, sofas, dining sets, counters.
 */

function renderFurniture(model, layers) {
  model.furniture.forEach(item => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    if (item.type === 'kitchen_counter') {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M ${item.x} ${item.y + item.height} V ${item.y} H ${item.x + item.width}`);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#334155');
      p.setAttribute('stroke-width', item.thickness);
      g.appendChild(p);
    } 
    else if (item.type === 'plant') {
      const cx = item.x + item.width / 2;
      const cy = item.y + item.height / 2;
      const r = Math.min(item.width, item.height) / 2;
      
      // Draw plant leaves depending on subtype
      if (item.subtype === 'fern') {
        // Fern - 6 rounded overlapping circles
        for (let a = 0; a < 360; a += 60) {
          const rad = (a * Math.PI) / 180;
          const lx = cx + Math.cos(rad) * r * 0.45;
          const ly = cy + Math.sin(rad) * r * 0.45;
          const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          leaf.setAttribute('cx', lx);
          leaf.setAttribute('cy', ly);
          leaf.setAttribute('r', r * 0.45);
          leaf.setAttribute('class', 'furniture-plant-leaf');
          g.appendChild(leaf);
        }
      } else if (item.subtype === 'palm') {
        // Palm - 10 radiating spiky lines
        for (let a = 0; a < 360; a += 36) {
          const rad = (a * Math.PI) / 180;
          const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          leaf.setAttribute('x1', cx);
          leaf.setAttribute('y1', cy);
          leaf.setAttribute('x2', cx + Math.cos(rad) * r);
          leaf.setAttribute('y2', cy + Math.sin(rad) * r);
          leaf.setAttribute('class', 'furniture-plant-leaf-spiky');
          g.appendChild(leaf);
        }
      } else {
        // Monstera - 4 broad heart-shaped leaf paths
        const angles = [0, 90, 180, 270];
        angles.forEach(a => {
          const rad = (a * Math.PI) / 180;
          const lx = cx + Math.cos(rad) * r * 0.5;
          const ly = cy + Math.sin(rad) * r * 0.5;
          
          const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const d = `M ${cx} ${cy} Q ${lx + Math.cos(rad+0.55)*r*0.6} ${ly + Math.sin(rad+0.55)*r*0.6} ${cx + Math.cos(rad)*r} ${cy + Math.sin(rad)*r} Q ${lx + Math.cos(rad-0.55)*r*0.6} ${ly + Math.sin(rad-0.55)*r*0.6} ${cx} ${cy}`;
          leaf.setAttribute('d', d);
          leaf.setAttribute('class', 'furniture-plant-leaf-broad');
          g.appendChild(leaf);
        });
      }

      // Draw the pot (small circle)
      const pot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pot.setAttribute('cx', cx);
      pot.setAttribute('cy', cy);
      pot.setAttribute('r', r * 0.35);
      pot.setAttribute('class', 'furniture-plant-pot');
      g.appendChild(pot);
    }
    else {
      const f = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      f.setAttribute('x', item.x);
      f.setAttribute('y', item.y);
      f.setAttribute('width', item.width);
      f.setAttribute('height', item.height);
      f.setAttribute('class', 'furniture-block');
      f.setAttribute('rx', 4);
      if (item.angle) {
        const cx = item.x + item.width/2;
        const cy = item.y + item.height/2;
        f.setAttribute('transform', `rotate(${item.angle}, ${cx}, ${cy})`);
      }
      g.appendChild(f);

      if (item.type === 'bed') {
        const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        p1.setAttribute('x', item.x + 8);
        p1.setAttribute('y', item.y + 6);
        p1.setAttribute('width', item.width/2 - 12);
        p1.setAttribute('height', 14);
        p1.setAttribute('class', 'furniture-contour');
        g.appendChild(p1);

        const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        p2.setAttribute('x', item.x + item.width/2 + 4);
        p2.setAttribute('y', item.y + 6);
        p2.setAttribute('width', item.width/2 - 12);
        p2.setAttribute('height', 14);
        p2.setAttribute('class', 'furniture-contour');
        g.appendChild(p2);
      }
      else if (item.type === 'pooja_mandir') {
        const dome = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const cx = item.x + item.width / 2;
        const d = `M ${item.x + 4} ${item.y + item.height - 4} Q ${item.x + 4} ${item.y + 4} ${cx} ${item.y + 4} Q ${item.x + item.width - 4} ${item.y + 4} ${item.x + item.width - 4} ${item.y + item.height - 4}`;
        dome.setAttribute('d', d);
        dome.setAttribute('fill', 'none');
        dome.setAttribute('stroke', '#8b5a1a');
        dome.setAttribute('stroke-width', 1);
        g.appendChild(dome);

        const centerFlame = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerFlame.setAttribute('cx', cx);
        centerFlame.setAttribute('cy', item.y + item.height / 2 + 2);
        centerFlame.setAttribute('r', 3);
        centerFlame.setAttribute('fill', '#fbbf24');
        g.appendChild(centerFlame);
      }
      else if (item.type === 'closet_hanger') {
        const rod = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rod.setAttribute('x1', item.x + 6);
        rod.setAttribute('y1', item.y + item.height / 2);
        rod.setAttribute('x2', item.x + item.width - 6);
        rod.setAttribute('y2', item.y + item.height / 2);
        rod.setAttribute('stroke', '#8b5a1a');
        rod.setAttribute('stroke-width', 1);
        g.appendChild(rod);

        const numHangers = Math.floor(item.width / 16);
        const step = (item.width - 12) / (numHangers + 1);
        for (let i = 1; i <= numHangers; i++) {
          const hx = item.x + 6 + i * step;
          const hy = item.y + item.height / 2;
          const hanger = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const d = `M ${hx - 4} ${hy + 4} L ${hx + 4} ${hy + 4} L ${hx} ${hy - 2} Z`;
          hanger.setAttribute('d', d);
          hanger.setAttribute('fill', 'none');
          hanger.setAttribute('stroke', '#8b5a1a');
          hanger.setAttribute('stroke-width', 0.8);
          g.appendChild(hanger);
        }
      }
      else if (item.type === 'kitchen_island') {
        const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        inner.setAttribute('x', item.x + 4);
        inner.setAttribute('y', item.y + 4);
        inner.setAttribute('width', item.width - 8);
        inner.setAttribute('height', item.height - 8);
        inner.setAttribute('fill', 'none');
        inner.setAttribute('stroke', '#8b5a1a');
        inner.setAttribute('stroke-width', 0.8);
        g.appendChild(inner);

        // Draw 2 bar stools on the left side
        for (let i = 0; i < 2; i++) {
          const stool = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          stool.setAttribute('cx', item.x - 5);
          stool.setAttribute('cy', item.y + item.height/3 * (i + 1));
          stool.setAttribute('r', 4);
          stool.setAttribute('fill', 'none');
          stool.setAttribute('stroke', '#8b5a1a');
          stool.setAttribute('stroke-width', 1);
          g.appendChild(stool);
        }
      }
      else if (item.type === 'dining_chair') {
        const cx = item.x + item.width / 2;
        const cy = item.y + item.height / 2;
        const r = item.width / 2;

        const chair = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        chair.setAttribute('cx', cx);
        chair.setAttribute('cy', cy);
        chair.setAttribute('r', r);
        chair.setAttribute('class', 'furniture-block');
        g.appendChild(chair);

        const back = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        back.setAttribute('cx', cx);
        back.setAttribute('cy', cy);
        back.setAttribute('r', r * 0.7);
        back.setAttribute('fill', 'none');
        back.setAttribute('stroke', '#8b5a1a');
        back.setAttribute('stroke-width', 0.8);
        g.appendChild(back);
      }
    }
    layers.furniture.appendChild(g);
  });
}
