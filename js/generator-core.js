/**
 * BLUEPRINT PRO - PROCEDURAL ENGINE ORCHESTRATOR
 * Aggregates subdivisions, wall contours, openings, furniture, and utility vectors.
 */

const Generator = {
  SCALE: 18,
  PLOT_PADDING: 50,

  /**
   * Main generation entry point
   * @param {Object} params Config parameters (area, aspectRatio, bhk, bathrooms, style, orientation)
   */
  generate(params) {
    const { area, aspectRatio, bhk, bathrooms, style, orientation } = params;

    // 1. Calculate Plot dimensions in feet & scale units
    const w_ft = Math.round(Math.sqrt(area * aspectRatio));
    const h_ft = Math.round(area / w_ft);
    const w = w_ft * this.SCALE;
    const h = h_ft * this.SCALE;

    const plot = {
      width_ft: w_ft,
      height_ft: h_ft,
      width: w,
      height: h,
      x0: this.PLOT_PADDING,
      y0: this.PLOT_PADDING,
      x1: this.PLOT_PADDING + w,
      y1: this.PLOT_PADDING + h,
      orientation: orientation
    };

    // 2. Procedural subdivisions solver (via layout file)
    const rooms = this.solveSubdivision(plot, bhk, bathrooms, style);

    // 3. Wall segmentation contours solver (via walls file)
    const walls = this.generateWalls(plot, rooms);

    // 4. RCC Columns alignment calculator
    const columns = this.calculateColumns(rooms);

    // 5. Door swings and window openings (via openings file)
    const openings = this.generateOpenings(plot, rooms, style);

    // 6. Furniture assets (via furniture file)
    const furniture = this.generateFurniture(rooms, style);

    // 7. Electrical (via electrical file)
    const electrical = this.generateElectrical ? this.generateElectrical(rooms, openings.doors) : { lights: [], switches: [], wiring: [] };

    // 8. Plumbing (via plumbing file)
    const plumbing = this.generatePlumbing ? this.generatePlumbing(rooms, openings) : { shafts: [], pipes: [] };

    // 9. Ventilation wind vectors (via ventilation file)
    const ventilation = this.generateVentilation ? this.generateVentilation(rooms, openings.windows, orientation) : { vectors: [] };

    return {
      plot,
      rooms,
      walls,
      columns,
      openings,
      furniture,
      electrical,
      plumbing,
      ventilation
    };
  },

  /**
   * Generates structural columns at wall crossings
   */
  calculateColumns(rooms) {
    const cornerNodes = [];
    const threshold = 15;

    rooms.forEach(room => {
      const corners = [
        { x: room.x1, y: room.y1 }, { x: room.x1, y: room.y2 },
        { x: room.x2, y: room.y1 }, { x: room.x2, y: room.y2 }
      ];
      corners.forEach(pt => {
        let exists = false;
        for (let i = 0; i < cornerNodes.length; i++) {
          const n = cornerNodes[i];
          if (Math.abs(n.x - pt.x) < threshold && Math.abs(n.y - pt.y) < threshold) {
            exists = true;
            break;
          }
        }
        if (!exists) cornerNodes.push(pt);
      });
    });

    const columns = [];
    const colSize = Math.round(0.68 * this.SCALE); // ~12px (9 inches equivalent)
    cornerNodes.forEach((node, idx) => {
      columns.push({
        id: `column_${idx}`,
        x: node.x - colSize/2,
        y: node.y - colSize/2,
        width: colSize,
        height: colSize
      });
    });
    return columns;
  }
};
