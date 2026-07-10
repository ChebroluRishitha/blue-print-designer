/**
 * BLUEPRINT PRO - FURNITURE PLACEMENT ENGINE
 * Maps template layout furniture elements for bedrooms, toilets, kitchens, and living rooms.
 */

Generator.generateFurniture = function(rooms, style) {
  const furniture = [];
  const scale = this.SCALE;

  rooms.forEach(room => {
    const rx = room.x1;
    const ry = room.y1;
    const rw = room.x2 - room.x1;
    const rh = room.y2 - room.y1;

    if (room.type === 'bedroom') {
      const bedW = 6.0 * scale;
      const bedH = 6.5 * scale;
      furniture.push({
        type: 'bed', room: room.id,
        x: rx + (rw - bedW)/2, y: ry + 1 * scale,
        width: bedW, height: bedH,
        angle: 0
      });

      const wardW = Math.min(rw - 2 * scale, 8 * scale);
      const wardH = 2.0 * scale;
      const wardX = room.id === 'bed_2'
        ? rx + rw - wardW - 1 * scale
        : rx + 1 * scale;

      furniture.push({
        type: 'wardrobe', room: room.id,
        x: wardX, y: ry + rh - wardH - 1 * scale,
        width: wardW, height: wardH,
        angle: 0
      });

      // Potted plant beside the bed (left side nightstand area)
      furniture.push({
        type: 'plant', subtype: 'palm', room: room.id,
        x: rx + (rw - bedW)/2 - 1.6 * scale, y: ry + 1.2 * scale,
        width: 1.2 * scale, height: 1.2 * scale
      });
    } 
    else if (room.type === 'living') {
      if (style === 'minimal' || style === 'compact') {
        // Rotated lounge layout to avoid bottom-left entrance door!
        // Sofa rotated 90 on the left-middle
        const sofaW = 7.0 * scale;
        const sofaH = 3.0 * scale;
        furniture.push({
          type: 'sofa', room: room.id,
          x: rx + 5.0 * scale, y: ry + rh/2 - sofaH/2,
          width: sofaW, height: sofaH,
          angle: 90
        });

        // TV unit rotated 90 on the left wall
        const tvW = 5.0 * scale;
        const tvH = 1.5 * scale;
        furniture.push({
          type: 'tv_unit', room: room.id,
          x: rx + 1.5 * scale, y: ry + rh/2 - tvW/2,
          width: tvW, height: tvH,
          angle: 90
        });
      } else {
        const sofaW = 7.0 * scale;
        const sofaH = 3.0 * scale;
        furniture.push({
          type: 'sofa', room: room.id,
          x: rx + 2 * scale, y: ry + 2 * scale,
          width: sofaW, height: sofaH,
          angle: 0
        });

        const tvW = 5.0 * scale;
        const tvH = 1.5 * scale;
        furniture.push({
          type: 'tv_unit', room: room.id,
          x: rx + 2 * scale, y: ry + rh - tvH - 1 * scale,
          width: tvW, height: tvH,
          angle: 0
        });
      }

      // Potted broad-leaf plant near the window along the bottom wall
      furniture.push({
        type: 'plant', subtype: 'monstera', room: room.id,
        x: rx + rw/2 - 4.5 * scale, y: ry + rh - 1.8 * scale,
        width: 1.4 * scale, height: 1.4 * scale
      });

      if (style !== 'minimal' && style !== 'compact') {
        const tableW = 5.0 * scale;
        const tableH = 3.2 * scale;
        const tableX = rx + rw - tableW - 2 * scale;
        const tableY = ry + 3 * scale;
        furniture.push({
          type: 'dining_table', room: room.id,
          x: tableX, y: tableY,
          width: tableW, height: tableH,
          angle: 90
        });

        // Push 4 circular dining chairs around the rotated vertical table
        const cx = tableX + tableW / 2;
        const cy = tableY + tableH / 2;
        const chairOffset = 0.4 * scale;
        const chairRadius = 0.5 * scale;
        const chairD = chairRadius * 2;
        
        const xLeft = cx - tableH / 2 - chairOffset - chairD;
        const xRight = cx + tableH / 2 + chairOffset;
        const yTop = cy - 0.9 * scale;
        const yBottom = cy + 0.9 * scale - chairD;

        const standardChairs = [
          { x: xLeft, y: yTop },
          { x: xLeft, y: yBottom },
          { x: xRight, y: yTop },
          { x: xRight, y: yBottom }
        ];

        standardChairs.forEach(pos => {
          furniture.push({
            type: 'dining_chair', room: room.id,
            x: pos.x, y: pos.y,
            width: chairRadius * 2, height: chairRadius * 2,
            angle: 0
          });
        });
      } else {
        // Render integrated open kitchen counter along the right wall
        const counterThickness = 2.0 * scale;
        furniture.push({
          type: 'kitchen_counter', room: room.id,
          x: rx + rw - counterThickness, y: ry,
          width: counterThickness, height: rh,
          thickness: counterThickness
        });
        furniture.push({
          type: 'stove', room: room.id,
          x: rx + rw - 1.8 * scale, y: ry + 2 * scale,
          width: 1.6 * scale, height: 2.2 * scale
        });
        furniture.push({
          type: 'sink', room: room.id,
          x: rx + rw - 1.8 * scale, y: ry + rh - 4 * scale,
          width: 1.8 * scale, height: 2.2 * scale
        });

        // Place kitchen island parallel to right counter
        const islandW = 1.6 * scale;
        const islandH = 4.0 * scale;
        furniture.push({
          type: 'kitchen_island', room: room.id,
          x: rx + rw - 6.2 * scale, y: ry + rh/2 - islandH/2,
          width: islandW, height: islandH,
          angle: 0
        });

        // Place dining table on the left side of the island (centered vertically)
        const tableW = 6.0 * scale; // Increased to 6ft to fit 8 chairs
        const tableH = 3.2 * scale;
        const tableX = rx + rw - 6.2 * scale - tableW - 2.2 * scale;
        const tableY = ry + rh/2 - tableH/2;
        furniture.push({
          type: 'dining_table', room: room.id,
          x: tableX, y: tableY,
          width: tableW, height: tableH,
          angle: 0
        });

        // Push 8 circular dining chairs around the table (3 top, 3 bottom, 1 left, 1 right)
        const chairOffset = 0.5 * scale;
        const chairRadius = 0.5 * scale;
        const chairD = chairRadius * 2;
        
        const chairPositions = [
          // Top side (3 chairs)
          { x: tableX + 0.6 * scale, y: tableY - chairOffset - chairD },
          { x: tableX + tableW/2 - chairRadius, y: tableY - chairOffset - chairD },
          { x: tableX + tableW - 0.6 * scale - chairD, y: tableY - chairOffset - chairD },
          
          // Bottom side (3 chairs)
          { x: tableX + 0.6 * scale, y: tableY + tableH + chairOffset },
          { x: tableX + tableW/2 - chairRadius, y: tableY + tableH + chairOffset },
          { x: tableX + tableW - 0.6 * scale - chairD, y: tableY + tableH + chairOffset },
          
          // Left side (1 chair)
          { x: tableX - chairOffset - chairD, y: tableY + tableH/2 - chairRadius },
          
          // Right side (1 chair)
          { x: tableX + tableW + chairOffset, y: tableY + tableH/2 - chairRadius }
        ];

        chairPositions.forEach((pos) => {
          furniture.push({
            type: 'dining_chair', room: room.id,
            x: pos.x, y: pos.y,
            width: chairRadius * 2, height: chairRadius * 2,
            angle: 0
          });
        });
      }
    } 
    else if (room.type === 'kitchen') {
      const counterThickness = 2.0 * scale;
      furniture.push({
        type: 'kitchen_counter', room: room.id,
        x: rx, y: ry,
        width: rw, height: rh,
        thickness: counterThickness
      });

      furniture.push({
        type: 'stove', room: room.id,
        x: rx + rw - 3.5 * scale, y: ry + 0.3 * scale,
        width: 2.2 * scale, height: 1.6 * scale
      });

      furniture.push({
        type: 'sink', room: room.id,
        x: rx + 0.3 * scale, y: ry + rh/2 - 1 * scale,
        width: 2.2 * scale, height: 1.8 * scale
      });
    } 
    else if (room.type === 'bathroom') {
      const wcW = 1.8 * scale;
      const wcH = 2.2 * scale;
      const basinW = 1.6 * scale;
      const basinH = 1.6 * scale;

      if (room.id === 'bath_2') {
        // Mirrored layout for Bed 2 Washroom (because the door is on the top-right!)
        furniture.push({
          type: 'wc', room: room.id,
          x: rx + 1.0 * scale, y: ry + 1.2 * scale,
          width: wcW, height: wcH
        });

        furniture.push({
          type: 'washbasin', room: room.id,
          x: rx + 1.0 * scale, y: ry + rh - basinH - 1.2 * scale,
          width: basinW, height: basinH
        });

        furniture.push({
          type: 'shower', room: room.id,
          x: rx + rw - 2.8 * scale - 0.8 * scale, y: ry + rh - 2.8 * scale - 0.8 * scale,
          width: 2.8 * scale, height: 2.8 * scale
        });
      } else {
        // Standard layout for Master/Common Washrooms (where doors are on the left)
        furniture.push({
          type: 'wc', room: room.id,
          x: rx + rw - wcW - 1.0 * scale, y: ry + 1.2 * scale,
          width: wcW, height: wcH
        });

        furniture.push({
          type: 'washbasin', room: room.id,
          x: rx + rw - basinW - 1.0 * scale, y: ry + rh - basinH - 1.2 * scale,
          width: basinW, height: basinH
        });

        furniture.push({
          type: 'shower', room: room.id,
          x: rx + 0.8 * scale, y: ry + 0.8 * scale,
          width: 2.8 * scale, height: 2.8 * scale
        });
      }
    }
    else if (room.type === 'balcony') {
      // Corner planters on the balcony
      furniture.push({
        type: 'plant', subtype: 'fern', room: room.id,
        x: rx + 0.5 * scale, y: ry + 0.5 * scale,
        width: 1.3 * scale, height: 1.3 * scale
      });
      furniture.push({
        type: 'plant', subtype: 'palm', room: room.id,
        x: rx + rw - 1.8 * scale, y: ry + 0.5 * scale,
        width: 1.3 * scale, height: 1.3 * scale
      });
    }
    else if (room.type === 'pooja') {
      // Mandir cabinet shelf on the bottom wall (opposite to the entrance door)
      furniture.push({
        type: 'pooja_mandir', room: room.id,
        x: rx + (rw - 2.2 * scale)/2, y: ry + rh - 1.6 * scale - 0.5 * scale,
        width: 2.2 * scale, height: 1.6 * scale
      });
    }
    else if (room.type === 'closet') {
      // Closet hangers wardrobe
      furniture.push({
        type: 'closet_hanger', room: room.id,
        x: rx + 0.3 * scale, y: ry + 0.3 * scale,
        width: rw - 0.6 * scale, height: 1.4 * scale
      });
    }
  });

  return furniture;
};
