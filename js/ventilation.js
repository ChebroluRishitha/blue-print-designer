/**
 * BLUEPRINT PRO - VENTILATION SUB-MODULE
 * Computes window-to-floor area ratios and maps wind flow vectors.
 */

Generator.generateVentilation = function(rooms, windows, orientation) {
  const vectors = [];
  const scale = this.SCALE;

  let windAngle = 0;
  if (orientation === 'N') windAngle = 270;
  else if (orientation === 'E') windAngle = 180;
  else if (orientation === 'S') windAngle = 90;
  else if (orientation === 'W') windAngle = 0;

  rooms.forEach(room => {
    const roomWins = windows.filter(w => w.room === room.id);
    if (roomWins.length === 0) return;

    const rx = room.x1;
    const ry = room.y1;
    const rw = room.x2 - room.x1;
    const rh = room.y2 - room.y1;

    // 1. Calculate window area ratio
    let totalWinArea = 0;
    roomWins.forEach(win => {
      const winW_ft = win.width / scale;
      const h = room.type === 'bathroom' ? 2 : 4;
      totalWinArea += winW_ft * h;
    });

    const ratio = (totalWinArea / room.area_sqft) * 100;
    
    const cx = rx + rw/2;
    const cy = ry + rh/2;

    // 2. Generate airflow vector arrows
    if (roomWins.length === 1) {
      const w1 = roomWins[0];
      const wx = w1.x + w1.width/2;
      const wy = w1.y;

      if (w1.orientation === 'H') {
        const dir = wy < cy ? 1 : -1;
        vectors.push({
          x1: wx,
          y1: wy + (dir * 5),
          x2: wx,
          y2: wy + (dir * 4 * scale)
        });
      } else {
        const dir = wx < cx ? 1 : -1;
        vectors.push({
          x1: wx + (dir * 5),
          y1: wy + w1.width/2,
          x2: wx + (dir * 4 * scale),
          y2: wy + w1.width/2
        });
      }
    } 
    else if (roomWins.length >= 2) {
      const w1 = roomWins[0];
      const w2 = roomWins[1];

      const w1x = w1.x + w1.width/2;
      const w1y = w1.orientation === 'H' ? w1.y : w1.y + w1.width/2;

      const w2x = w2.x + w2.width/2;
      const w2y = w2.orientation === 'H' ? w2.y : w2.y + w2.width/2;

      vectors.push({
        x1: w1x,
        y1: w1y,
        x2: w2x,
        y2: w2y,
        isCross: true
      });
    }

    room.ventilation_ratio = ratio;
    room.ventilation_passed = ratio >= 10.0;
  });

  return { vectors };
};
