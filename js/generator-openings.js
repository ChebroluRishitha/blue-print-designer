/**
 * BLUEPRINT PRO - OPENINGS PLACEMENT ENGINE
 * Allocates entrance/internal doors and external ventilation windows.
 */

Generator.generateOpenings = function(plot, rooms, style) {
  const doors = [];
  const windows = [];
  const scale = this.SCALE;

  const getRoom = id => rooms.find(r => r.id === id);

  // 1. Entrance Door
  const living = getRoom('living');
  if (living) {
    const doorW = 3.2 * scale;
    const facing = plot.orientation || 'E';
    let entX = living.x1 + 3 * scale;
    let entY = living.y2;
    
    if (facing === 'N' || facing === 'north') {
      if (style === 'minimal' || style === 'compact') {
        entX = living.x1 + 1.5 * scale; // Shift to the left side in open kitchen design to avoid kitchen!
      } else {
        entX = living.x2 - doorW - 1.5 * scale; // Position on the right side of the front wall
      }
    }
    else if (facing === 'S' || facing === 'south') {
      entX = living.x1 + 1.2 * scale; // Position on the left side
    }

    doors.push({
      id: 'door_entrance',
      room: 'living',
      type: 'entrance',
      x: entX,
      y: entY,
      width: doorW,
      direction: 'in-right',
      angle: 0
    });
  }

  // 2. Room-wise Inner Doors
  rooms.forEach(room => {
    if (room.id === 'living') return;

    let doorX = 0, doorY = 0, doorAngle = 0, doorDir = 'in-left';
    let doorW = 3.0 * scale;

    if (room.type === 'bathroom') doorW = 2.5 * scale;

    if (room.id === 'master_bed') {
      doorX = room.x2 - 0.4 * scale;
      doorY = room.y2;
      doorAngle = 0;
      doorDir = 'in-left';
    } 
    else if (room.id === 'bed_2') {
      doorX = room.x1 + 0.4 * scale;
      doorY = room.y2;
      doorAngle = 0;
      doorDir = 'in-left';
    } 
    else if (room.id === 'bed_3') {
      doorX = room.x2;
      doorY = room.y1 + 0.4 * scale;
      doorAngle = 270;
      doorDir = 'in-left';
    } 
    else if (room.id === 'bed_4') {
      doorX = room.x1 + 0.4 * scale;
      doorY = room.y1;
      doorAngle = 180;
      doorDir = 'in-left';
    } 
    else if (room.id === 'master_bath') {
      const bed = getRoom('master_bed');
      const startY = bed ? Math.max(room.y1, bed.y1) : room.y1;
      doorX = room.x1;
      doorY = startY + 0.4 * scale;
      doorAngle = 90;
      doorDir = 'in-right';
    }
    else if (room.id === 'common_bath') {
      doorX = room.x1;
      doorY = room.y2 - 0.4 * scale;
      doorAngle = 90;
      doorDir = 'in-left';
    }
    else if (room.id === 'bath_2') {
      doorX = room.x2;
      doorY = room.y1 + 0.4 * scale;
      doorAngle = 270;
      doorDir = 'in-left';
    }
    else if (room.id === 'walkin_closet') {
      doorX = room.x1;
      doorY = room.y1 + 0.4 * scale;
      doorAngle = 90;
      doorDir = 'in-right';
    }
    else if (room.id === 'vastu_pooja') {
      doorX = room.x1;
      doorY = room.y1 + 0.4 * scale;
      doorAngle = 90;
      doorDir = 'in-right';
    }
    else if (room.id === 'kitchen') {
      doorX = room.x1;
      doorY = room.y1 + 0.4 * scale;
      doorAngle = 90;
      doorDir = 'in-right';
    }
    else if (room.id === 'powder_bath') {
      doorX = room.x1;
      doorY = room.y1 + 0.4 * scale;
      doorAngle = 90;
      doorDir = 'in-right';
    }

    if (doorX !== 0) {
      doors.push({
        id: `door_${room.id}`,
        room: room.id,
        type: room.type === 'bathroom' ? 'toilet' : 'room',
        x: doorX,
        y: doorY,
        width: doorW,
        direction: doorDir,
        angle: doorAngle
      });
    }
  });

  // Balcony Door Placement
  const balcony = rooms.find(r => r.type === 'balcony');
  if (balcony) {
    const parentId = balcony.room_parent;
    const parentRoom = rooms.find(r => r.id === parentId);
    if (parentRoom) {
      const doorW = 2.8 * scale;
      doors.push({
        id: `door_balcony`,
        room: parentId,
        type: 'balcony',
        x: balcony.x1 + (balcony.x2 - balcony.x1)/2 - doorW/2,
        y: balcony.y2,
        width: doorW,
        direction: 'in-left',
        angle: 0
      });
    }
  }

  // 3. Windows Placement on Exterior Walls
  rooms.forEach(room => {
    if (room.type === 'balcony') return;
    const isTopExterior = Math.abs(room.y1 - plot.y0) < 5;
    const isBottomExterior = Math.abs(room.y2 - plot.y1) < 5;
    const isLeftExterior = Math.abs(room.x1 - plot.x0) < 5;
    const isRightExterior = Math.abs(room.x2 - plot.x1) < 5;

    let winId = 1;
    let winW = 4.5 * scale;
    if (room.type === 'bathroom') winW = 2.0 * scale;
    else if (room.type === 'living') winW = 5.5 * scale;

    const addWindow = (x, y, orientation, w) => {
      windows.push({
        id: `win_${room.id}_${winId++}`,
        room: room.id,
        x: x, y: y,
        width: w,
        orientation: orientation
      });
    };

    if (isTopExterior) {
      const cx = room.x1 + (room.x2 - room.x1) / 2;
      addWindow(cx - winW/2, room.y1, 'H', winW);
    }
    if (isBottomExterior) {
      const cx = room.x1 + (room.x2 - room.x1) / 2;
      if (room.id === 'living') {
        const facing = plot.orientation || 'E';
        // If main door is on the right (facing North and not design 3), place window on the left.
        // Otherwise (main door is on the left), place window on the right.
        if ((facing === 'N' || facing === 'north') && style !== 'minimal' && style !== 'compact') {
          addWindow(room.x1 + 1.5 * scale, room.y2, 'H', winW);
        } else {
          addWindow(room.x2 - winW - 2 * scale, room.y2, 'H', winW);
        }
      } else {
        addWindow(cx - winW/2, room.y2, 'H', winW);
      }
    }
    if (isLeftExterior) {
      const cy = room.y1 + (room.y2 - room.y1) / 2;
      addWindow(room.x1, cy - winW/2, 'V', winW);
    }
    if (isRightExterior) {
      const cy = room.y1 + (room.y2 - room.y1) / 2;
      addWindow(room.x2, cy - winW/2, 'V', winW);
    }
  });

  return { doors, windows };
};
