/**
 * BLUEPRINT PRO - PROCEDURAL SUBDIVISION ENGINE
 * Divides the floor plan plot into zoned rooms according to BHK count and style.
 */

Generator.solveSubdivision = function(plot, bhk, bathrooms, style) {
  const rooms = [];
  const { x0, y0, width, height, width_ft, height_ft } = plot;

  const w_ft = width_ft;
  const h_ft = height_ft;

  // Split ratio between private rear bedrooms and public front living spaces
  let rearRatio = 0.55;
  if (style === 'vastu') rearRatio = 0.58;
  else if (style === 'luxury') rearRatio = 0.52;

  const rearHeight_ft = Math.max(9.5, Math.min(h_ft * rearRatio, h_ft - 8.5));
  const frontHeight_ft = h_ft - rearHeight_ft;
  const splitY_ft = y0 / this.SCALE + rearHeight_ft;

  // Zoned columns subdivision widths
  let col1_ratio = 0.38, col3_ratio = 0.38;
  if (bhk === 1) { col1_ratio = 0.60; col3_ratio = 0.40; }
  else if (bhk === 3) { col1_ratio = 0.35; col3_ratio = 0.38; }
  else if (bhk === 4) { col1_ratio = 0.30; col3_ratio = 0.32; }

  const col1_width_ft = w_ft * col1_ratio;
  const col3_width_ft = w_ft * col3_ratio;
  const col2_width_ft = w_ft - col1_width_ft - col3_width_ft;

  const col1_x_ft = x0 / this.SCALE + col1_width_ft;
  const col2_x_ft = col1_x_ft + col2_width_ft;

  // Add room helper
  const addRoom = (id, name, type, x1_ft, y1_ft, x2_ft, y2_ft) => {
    rooms.push({
      id, name, type,
      x1: Math.round(x1_ft * this.SCALE),
      y1: Math.round(y1_ft * this.SCALE),
      x2: Math.round(x2_ft * this.SCALE),
      y2: Math.round(y2_ft * this.SCALE),
      width_ft: Math.round(x2_ft - x1_ft),
      height_ft: Math.round(y2_ft - y1_ft),
      area_sqft: Math.round((x2_ft - x1_ft) * (y2_ft - y1_ft))
    });
  };

  const plotX0_ft = x0 / this.SCALE;
  const plotY0_ft = y0 / this.SCALE;
  const plotX1_ft = (x0 + width) / this.SCALE;
  const plotY1_ft = (y0 + height) / this.SCALE;

  // --- REAR ROW GENERATION ---
  if (bhk === 1) {
    addRoom('balcony', 'Balcony', 'balcony', plotX0_ft, plotY0_ft, col1_x_ft, plotY0_ft + 4);
    rooms[rooms.length - 1].room_parent = 'master_bed';

    addRoom('master_bed', 'Master Bedroom', 'bedroom', plotX0_ft, plotY0_ft + 4, col1_x_ft, splitY_ft);
    addRoom('master_bath', 'Master Washroom', 'bathroom', col1_x_ft, plotY0_ft, plotX1_ft, splitY_ft);
  } 
  else {
    // 2, 3, 4 BHK
    // Balcony
    addRoom('balcony', 'Balcony', 'balcony', col2_x_ft, plotY0_ft, plotX1_ft, plotY0_ft + 4);
    rooms[rooms.length - 1].room_parent = 'bed_2';

    // Master Bedroom and Walk-in closet
    if (style === 'luxury') {
      const dresserWidth_ft = 5;
      addRoom('master_bed', 'Master Bedroom', 'bedroom', plotX0_ft, plotY0_ft, col1_x_ft - dresserWidth_ft, splitY_ft);
      addRoom('walkin_closet', 'Walk-in Dresser', 'closet', col1_x_ft - dresserWidth_ft, plotY0_ft, col1_x_ft, splitY_ft);
    } else {
      addRoom('master_bed', 'Master Bedroom', 'bedroom', plotX0_ft, plotY0_ft, col1_x_ft, splitY_ft);
    }

    addRoom('bed_2', 'Bedroom 2', 'bedroom', col2_x_ft, plotY0_ft + 4, plotX1_ft, splitY_ft);

    // Dynamic Washrooms generation based on bathroom count!
    const bathH_ft = splitY_ft - plotY0_ft;
    if (bathrooms === 1) {
      // 1 Washroom: Common Washroom occupying the full height
      addRoom('common_bath', 'Common Washroom', 'bathroom', col1_x_ft, plotY0_ft, col2_x_ft, splitY_ft);
    }
    else if (bathrooms === 2) {
      // 2 Washrooms: Master Washroom (top) and Common Washroom (bottom)
      const splitY = plotY0_ft + bathH_ft * 0.5;
      addRoom('master_bath', 'Master Washroom', 'bathroom', col1_x_ft, plotY0_ft, col2_x_ft, splitY);
      addRoom('common_bath', 'Common Washroom', 'bathroom', col1_x_ft, splitY, col2_x_ft, splitY_ft);
    }
    else {
      // 3 or 4 Washrooms: Split Column 2 into 3 Washrooms
      // Master Washroom (top), Bed 2 Washroom (middle), Common Washroom (bottom)
      const splitY1 = plotY0_ft + bathH_ft * 0.33;
      const splitY2 = plotY0_ft + bathH_ft * 0.66;
      addRoom('master_bath', 'Master Washroom', 'bathroom', col1_x_ft, plotY0_ft, col2_x_ft, splitY1);
      addRoom('bath_2', 'Bed 2 Washroom', 'bathroom', col1_x_ft, splitY1, col2_x_ft, splitY2);
      addRoom('common_bath', 'Common Washroom', 'bathroom', col1_x_ft, splitY2, col2_x_ft, splitY_ft);
    }
  }

  // --- FRONT ROW GENERATION ---
  if (bhk === 1) {
    const frontSplitX_ft = plotX0_ft + w_ft * 0.65;
    if (style === 'minimal' || style === 'compact') {
      addRoom('living', 'Open Living & Kitchen', 'living', plotX0_ft, splitY_ft, plotX1_ft, plotY1_ft);
    } else {
      addRoom('living', 'Living Room & Dining', 'living', plotX0_ft, splitY_ft, frontSplitX_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', frontSplitX_ft, splitY_ft, plotX1_ft, plotY1_ft);
    }
  } 
  else if (bhk === 2) {
    if (style === 'minimal' || style === 'compact') {
      // Combined living & kitchen
      addRoom('living', 'Open Living & Kitchen', 'living', plotX0_ft, splitY_ft, plotX1_ft, plotY1_ft);
    } 
    else if (style === 'vastu') {
      // Vastu layout: add a Pooja Room
      const poojaWidth_ft = 4.5;
      const frontSplitX_ft = plotX0_ft + w_ft * 0.65;
      addRoom('living', 'Living & Dining Room', 'living', plotX0_ft, splitY_ft, frontSplitX_ft - poojaWidth_ft, plotY1_ft);
      addRoom('vastu_pooja', 'Pooja Room', 'pooja', frontSplitX_ft - poojaWidth_ft, splitY_ft, frontSplitX_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', frontSplitX_ft, splitY_ft, plotX1_ft, plotY1_ft);
    } 
    else if (style === 'luxury') {
      // Luxury layout: Living, Kitchen, guest powder toilet (half bath)
      const powderWidth_ft = 5;
      const frontSplitX_ft = plotX0_ft + w_ft * 0.65;
      addRoom('living', 'Living & Dining Area', 'living', plotX0_ft, splitY_ft, frontSplitX_ft - powderWidth_ft, plotY1_ft);
      addRoom('powder_bath', 'Powder Room', 'bathroom', frontSplitX_ft - powderWidth_ft, splitY_ft, frontSplitX_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', frontSplitX_ft, splitY_ft, plotX1_ft, plotY1_ft);
    } 
    else {
      // Modern style
      const frontSplitX_ft = plotX0_ft + w_ft * 0.68;
      addRoom('living', 'Living & Dining Room', 'living', plotX0_ft, splitY_ft, frontSplitX_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', frontSplitX_ft, splitY_ft, plotX1_ft, plotY1_ft);
    }
  } 
  else if (bhk === 3) {
    if (style === 'minimal' || style === 'compact') {
      addRoom('bed_3', 'Bedroom 3', 'bedroom', plotX0_ft, splitY_ft, col1_x_ft, plotY1_ft);
      addRoom('living', 'Open Living & Kitchen', 'living', col1_x_ft, splitY_ft, plotX1_ft, plotY1_ft);
    } 
    else if (style === 'vastu') {
      const poojaWidth_ft = 4.5;
      addRoom('bed_3', 'Bedroom 3', 'bedroom', plotX0_ft, splitY_ft, col1_x_ft, plotY1_ft);
      addRoom('living', 'Living & Dining Room', 'living', col1_x_ft, splitY_ft, col2_x_ft - poojaWidth_ft, plotY1_ft);
      addRoom('vastu_pooja', 'Pooja Room', 'pooja', col2_x_ft - poojaWidth_ft, splitY_ft, col2_x_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', col2_x_ft, splitY_ft, plotX1_ft, plotY1_ft);
    }
    else if (style === 'luxury') {
      const powderWidth_ft = 5;
      addRoom('bed_3', 'Bedroom 3', 'bedroom', plotX0_ft, splitY_ft, col1_x_ft, plotY1_ft);
      addRoom('living', 'Living & Dining Area', 'living', col1_x_ft, splitY_ft, col2_x_ft - powderWidth_ft, plotY1_ft);
      addRoom('powder_bath', 'Powder Room', 'bathroom', col2_x_ft - powderWidth_ft, splitY_ft, col2_x_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', col2_x_ft, splitY_ft, plotX1_ft, plotY1_ft);
    }
    else {
      addRoom('bed_3', 'Bedroom 3', 'bedroom', plotX0_ft, splitY_ft, col1_x_ft, plotY1_ft);
      addRoom('living', 'Living & Dining Room', 'living', col1_x_ft, splitY_ft, col2_x_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', col2_x_ft, splitY_ft, plotX1_ft, plotY1_ft);
    }
  } 
  else {
    // 4 BHK
    const splitX3_ft = plotX0_ft + col1_width_ft;
    const splitX4_ft = splitX3_ft + col2_width_ft * 0.55;
    const splitX_living_ft = plotX1_ft - col3_width_ft * 0.70;

    if (style === 'minimal' || style === 'compact') {
      addRoom('bed_3', 'Bedroom 3', 'bedroom', plotX0_ft, splitY_ft, splitX3_ft, plotY1_ft);
      addRoom('bed_4', 'Guest Bedroom 4', 'bedroom', splitX3_ft, splitY_ft, splitX4_ft, plotY1_ft);
      addRoom('living', 'Open Living & Kitchen', 'living', splitX4_ft, splitY_ft, plotX1_ft, plotY1_ft);
    } 
    else if (style === 'vastu') {
      const poojaWidth_ft = 4.0;
      addRoom('bed_3', 'Bedroom 3', 'bedroom', plotX0_ft, splitY_ft, splitX3_ft, plotY1_ft);
      addRoom('bed_4', 'Guest Bedroom 4', 'bedroom', splitX3_ft, splitY_ft, splitX4_ft, plotY1_ft);
      addRoom('living', 'Living & Dining Room', 'living', splitX4_ft, splitY_ft, splitX_living_ft - poojaWidth_ft, plotY1_ft);
      addRoom('vastu_pooja', 'Pooja Room', 'pooja', splitX_living_ft - poojaWidth_ft, splitY_ft, splitX_living_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', splitX_living_ft, splitY_ft, plotX1_ft, plotY1_ft);
    }
    else if (style === 'luxury') {
      const powderWidth_ft = 4.5;
      addRoom('bed_3', 'Bedroom 3', 'bedroom', plotX0_ft, splitY_ft, splitX3_ft, plotY1_ft);
      addRoom('bed_4', 'Guest Bedroom 4', 'bedroom', splitX3_ft, splitY_ft, splitX4_ft, plotY1_ft);
      addRoom('living', 'Living & Dining Area', 'living', splitX4_ft, splitY_ft, splitX_living_ft - powderWidth_ft, plotY1_ft);
      addRoom('powder_bath', 'Powder Room', 'bathroom', splitX_living_ft - powderWidth_ft, splitY_ft, splitX_living_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', splitX_living_ft, splitY_ft, plotX1_ft, plotY1_ft);
    }
    else {
      addRoom('bed_3', 'Bedroom 3', 'bedroom', plotX0_ft, splitY_ft, splitX3_ft, plotY1_ft);
      addRoom('bed_4', 'Guest Bedroom 4', 'bedroom', splitX3_ft, splitY_ft, splitX4_ft, plotY1_ft);
      addRoom('living', 'Living & Dining Room', 'living', splitX4_ft, splitY_ft, splitX_living_ft, plotY1_ft);
      addRoom('kitchen', 'Kitchen', 'kitchen', splitX_living_ft, splitY_ft, plotX1_ft, plotY1_ft);
    }
  }

  return rooms;
};
