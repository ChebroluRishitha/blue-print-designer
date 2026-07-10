/**
 * BLUEPRINT PRO - ELECTRICAL SUB-MODULE
 * Procedurally places ceiling fans, LED lights, wall switches, and wiring lines.
 */

Generator.generateElectrical = function(rooms, doors) {
  const lights = [];
  const switches = [];
  const wiring = [];
  const scale = this.SCALE;

  rooms.forEach(room => {
    const rx = room.x1;
    const ry = room.y1;
    const rw = room.x2 - room.x1;
    const rh = room.y2 - room.y1;

    // 1. Calculate lighting fixture count
    let count = 2;
    if (room.type === 'living') count = 4;
    else if (room.type === 'bedroom' && room.area_sqft > 180) count = 4;
    else if (room.type === 'bathroom') count = 1;

    // 2. Ceiling fan placement
    let hasFan = room.type === 'bedroom' || room.type === 'living';
    let fanNode = null;
    if (hasFan) {
      fanNode = {
        id: `fan_${room.id}`,
        room: room.id,
        type: 'fan',
        x: rx + rw/2,
        y: ry + rh/2
      };
      lights.push(fanNode);
    }

    // 3. LED fixtures symmetry layout
    const roomLights = [];
    if (count === 1) {
      const light = {
        id: `light_${room.id}_1`,
        room: room.id,
        type: 'light',
        x: rx + rw/2,
        y: ry + rh/3
      };
      lights.push(light);
      roomLights.push(light);
    } 
    else if (count === 2) {
      const l1 = {
        id: `light_${room.id}_1`,
        room: room.id,
        type: 'light',
        x: rx + rw/4,
        y: ry + rh/2
      };
      const l2 = {
        id: `light_${room.id}_2`,
        room: room.id,
        type: 'light',
        x: rx + (3 * rw)/4,
        y: ry + rh/2
      };
      lights.push(l1, l2);
      roomLights.push(l1, l2);
    } 
    else if (count === 4) {
      const coords = [
        { x: rx + rw/4, y: ry + rh/4 },
        { x: rx + (3 * rw)/4, y: ry + rh/4 },
        { x: rx + rw/4, y: ry + (3 * rh)/4 },
        { x: rx + (3 * rw)/4, y: ry + (3 * rh)/4 }
      ];
      coords.forEach((coord, index) => {
        const l = {
          id: `light_${room.id}_${index + 1}`,
          room: room.id,
          type: 'light',
          x: coord.x,
          y: coord.y
        };
        lights.push(l);
        roomLights.push(l);
      });
    }

    // 4. Wall switch placement next to doors
    const roomDoor = doors.find(d => d.room === room.id);
    let sX = rx + 10, sY = ry + 10;
    if (roomDoor) {
      if (roomDoor.angle === 0 || roomDoor.angle === 180) {
        sX = roomDoor.x + (roomDoor.width + 10) * (roomDoor.direction === 'in-left' ? 1 : -1);
        sY = roomDoor.y;
      } else {
        sX = roomDoor.x;
        sY = roomDoor.y + (roomDoor.width + 10) * (roomDoor.direction === 'in-left' ? 1 : -1);
      }
    } else if (room.id === 'living') {
      sX = rx + 2 * scale;
      sY = ry + rh - 10;
    }

    const switchBoard = {
      id: `switch_${room.id}`,
      room: room.id,
      x: sX,
      y: sY
    };
    switches.push(switchBoard);

    // 5. Connect wiring pathways
    roomLights.forEach(light => {
      wiring.push({
        from: light.id,
        to: switchBoard.id,
        x1: light.x,
        y1: light.y,
        x2: switchBoard.x,
        y2: switchBoard.y
      });
    });

    if (fanNode) {
      wiring.push({
        from: fanNode.id,
        to: switchBoard.id,
        x1: fanNode.x,
        y1: fanNode.y,
        x2: switchBoard.x,
        y2: switchBoard.y
      });
    }
  });

  return { lights, switches, wiring };
};
