/**
 * BLUEPRINT PRO - PLUMBING SUB-MODULE
 * Generates vertical riser shafts, wet-wall groupings, cold/hot water networks, and drainage paths.
 */

Generator.generatePlumbing = function(rooms, openings) {
  const pipes = [];
  const shafts = [];
  const scale = this.SCALE;

  const getRoom = id => rooms.find(r => r.id === id);

  // 1. Plumbing Shaft Riser placement
  const masterBath = getRoom('master_bath');
  const commonBath = getRoom('common_bath');
  const kitchen = getRoom('kitchen');

  let shaft1 = null;
  let shaft2 = null;

  if (masterBath && commonBath) {
    shaft1 = {
      id: 'shaft_bath_cluster',
      x: masterBath.x2 - 1.5 * scale,
      y: masterBath.y2 - 0.75 * scale,
      width: 1.5 * scale,
      height: 1.5 * scale
    };
    shafts.push(shaft1);
  } else if (masterBath) {
    shaft1 = {
      id: 'shaft_bath_cluster',
      x: masterBath.x2 - 1.5 * scale,
      y: masterBath.y1,
      width: 1.5 * scale,
      height: 1.5 * scale
    };
    shafts.push(shaft1);
  }

  if (kitchen) {
    shaft2 = {
      id: 'shaft_kitchen',
      x: kitchen.x1,
      y: kitchen.y1,
      width: 1.2 * scale,
      height: 1.2 * scale
    };
    shafts.push(shaft2);
  }

  // 2. Generate plumbing runs
  rooms.forEach(room => {
    const rx = room.x1;
    const ry = room.y1;
    const rw = room.x2 - room.x1;
    const rh = room.y2 - room.y1;

    if (room.type === 'bathroom') {
      const toiletShaft = shaft1 || { x: rx + 20, y: ry + 20 };
      const scx = toiletShaft.x + toiletShaft.width/2;
      const scy = toiletShaft.y + toiletShaft.height/2;

      const showerX = rx + 2 * scale;
      const showerY = ry + 2 * scale;

      const basinX = rx + rw - 1.8 * scale;
      const basinY = ry + rh - 1.8 * scale;

      const wcX = rx + 1.8 * scale;
      const wcY = ry + rh - 2.1 * scale;

      // Cold Water pipe connections
      pipes.push({
        type: 'cold',
        path: `M ${scx} ${scy} H ${showerX} V ${showerY}`
      });
      pipes.push({
        type: 'cold',
        path: `M ${scx} ${scy} H ${basinX} V ${basinY}`
      });
      pipes.push({
        type: 'cold',
        path: `M ${scx} ${scy} H ${wcX} V ${wcY}`
      });

      // Hot Water pipe connections (geyser to shower and basin)
      pipes.push({
        type: 'hot',
        path: `M ${showerX} ${showerY} H ${basinX}`
      });

      // Drainage pipe connections (leads to shaft)
      pipes.push({
        type: 'drain',
        path: `M ${showerX} ${showerY} H ${scx} V ${scy}`
      });
      pipes.push({
        type: 'drain',
        path: `M ${basinX} ${basinY} H ${scx} V ${scy}`
      });
      pipes.push({
        type: 'drain',
        path: `M ${wcX} ${wcY} H ${scx} V ${scy}`
      });
    } 
    else if (room.type === 'kitchen') {
      const kitchenShaft = shaft2 || { x: rx + 10, y: ry + 10 };
      const kscx = kitchenShaft.x + kitchenShaft.width/2;
      const kscy = kitchenShaft.y + kitchenShaft.height/2;

      const sinkX = rx + 1.4 * scale;
      const sinkY = ry + rh/2 - 0.2 * scale;

      pipes.push({
        type: 'cold',
        path: `M ${kscx} ${kscy} H ${sinkX} V ${sinkY}`
      });
      pipes.push({
        type: 'drain',
        path: `M ${sinkX} ${sinkY} H ${kscx} V ${kscy}`
      });
    }
  });

  return { shafts, pipes };
};
