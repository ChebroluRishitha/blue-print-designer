/**
 * BLUEPRINT PRO - WALLS SOLVER ENGINE
 * Generates wall segment arrays based on room boundaries and plot coordinates.
 */

Generator.generateWalls = function(plot, rooms) {
  const outerWalls = [];
  const innerWalls = [];
  const border = 0.5;

  const outerThickness = Math.round(0.75 * this.SCALE); // 9 inches outer
  const innerThickness = Math.round(0.4 * this.SCALE);  // 4.8 inches inner

  const segments = [];

  rooms.forEach(room => {
    segments.push({ x1: room.x1, y1: room.y1, x2: room.x2, y2: room.y1, rooms: [room.id] });
    segments.push({ x1: room.x1, y1: room.y2, x2: room.x2, y2: room.y2, rooms: [room.id] });
    segments.push({ x1: room.x1, y1: room.y1, x2: room.x1, y2: room.y2, rooms: [room.id] });
    segments.push({ x1: room.x2, y1: room.y1, x2: room.x2, y2: room.y2, rooms: [room.id] });
  });

  const merged = [];
  segments.forEach(seg => {
    let found = false;
    for (let i = 0; i < merged.length; i++) {
      const m = merged[i];
      const matchCoord = 
        (Math.abs(m.x1 - seg.x1) < border && Math.abs(m.y1 - seg.y1) < border && Math.abs(m.x2 - seg.x2) < border && Math.abs(m.y2 - seg.y2) < border) ||
        (Math.abs(m.x1 - seg.x2) < border && Math.abs(m.y1 - seg.y2) < border && Math.abs(m.x2 - seg.x1) < border && Math.abs(m.y2 - seg.y1) < border);
      
      if (matchCoord) {
        if (!m.rooms.includes(seg.rooms[0])) m.rooms.push(seg.rooms[0]);
        found = true;
        break;
      }
    }
    if (!found) merged.push({ ...seg });
  });

  const railings = [];

  merged.forEach(wall => {
    const isPlotBoundary = 
      Math.abs(wall.y1 - plot.y0) < border && Math.abs(wall.y2 - plot.y0) < border ||
      Math.abs(wall.y1 - plot.y1) < border && Math.abs(wall.y2 - plot.y1) < border ||
      Math.abs(wall.x1 - plot.x0) < border && Math.abs(wall.x2 - plot.x0) < border ||
      Math.abs(wall.x1 - plot.x1) < border && Math.abs(wall.x2 - plot.x1) < border;

    const isBalconyRailing = wall.rooms.length === 1 && wall.rooms[0] === 'balcony' && isPlotBoundary;

    if (isBalconyRailing) {
      railings.push({ ...wall });
    } else if (isPlotBoundary) {
      outerWalls.push({ ...wall, thickness: outerThickness });
    } else {
      innerWalls.push({ ...wall, thickness: innerThickness });
    }
  });

  return { outerWalls, innerWalls, railings };
};
