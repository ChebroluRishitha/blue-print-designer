/**
 * BLUEPRINT PRO - ESTIMATION SUB-MODULE
 * Performs civil quantity takeoff calculations and budget breakdowns in INR.
 */

const Estimator = {
  /**
   * Run material takeoff calculations based on structural elements
   * @param {Object} model Calculated layout model
   * @param {Object} prices Custom material price dictionary
   * @returns {Object} Quantity breakdowns and project cost sum
   */
  calculate(model, prices) {
    const plotArea = model.plot.width_ft * model.plot.height_ft;

    // 1. Calculate structural properties
    let outerWallLen = 0;
    model.walls.outerWalls.forEach(w => {
      const len = Math.sqrt((w.x2-w.x1)*(w.x2-w.x1) + (w.y2-w.y1)*(w.y2-w.y1)) / Generator.SCALE;
      outerWallLen += len;
    });

    let innerWallLen = 0;
    model.walls.innerWalls.forEach(w => {
      const len = Math.sqrt((w.x2-w.x1)*(w.x2-w.x1) + (w.y2-w.y1)*(w.y2-w.y1)) / Generator.SCALE;
      innerWallLen += len;
    });

    const totalWallLen = outerWallLen + innerWallLen;
    const wallHeight = 10.0; // 10 ft ceiling height

    // 2. Concrete Volume calculations (Foundation + Pillars + Beams + Roof slab)
    // Add columns RCC concrete volume: ~12 pillars (9"x9"x10ft) = 12 * (0.75 * 0.75 * 10) = 67.5 CFT
    const columnsVolCFT = model.columns.length * (0.75 * 0.75 * 10);
    const slabVolCFT = plotArea * 0.5; // 6 inch slab
    const beamsVolCFT = plotArea * 0.12; // beam network estimate
    const concreteVolCFT = slabVolCFT + beamsVolCFT + columnsVolCFT;
    const concreteVolCum = concreteVolCFT * 0.0283168; // CFT to cubic meters

    // 3. Bricks count
    const outerWallVol = outerWallLen * wallHeight * 0.75; // outer 9"
    const innerWallVol = innerWallLen * wallHeight * 0.375; // inner 4.5"
    const brickworkVol = outerWallVol + innerWallVol;
    const bricksCount = Math.round(brickworkVol * 13.5);

    // 4. Cement Bags: 7.2 bags per m3 concrete + 0.25 bags per CFT mortar + plastering
    const concreteCement = concreteVolCum * 7.2;
    const brickworkCement = brickworkVol * 0.25;
    const plasterCement = (totalWallLen * 2 * wallHeight) * 0.06;
    const cementBags = Math.round(concreteCement + brickworkCement + plasterCement);

    // 5. Reinforcing Steel (Rebar) (75 kg per cubic meter of concrete)
    const steelWeightKg = Math.round(concreteVolCum * 75);

    // 6. Sand Volume (Tons)
    const sandTons = Math.round((concreteVolCum * 0.45) + (brickworkVol * 0.03));

    // 7. Aggregate Volume (Coarse gravel)
    const aggregateTons = Math.round(concreteVolCum * 0.85);

    // 8. Paint (Liters)
    const wallPlasterArea = totalWallLen * 2 * wallHeight;
    const paintLiters = Math.round(wallPlasterArea / 45);

    // Carpet area
    let carpetArea = 0;
    model.rooms.forEach(r => carpetArea += r.area_sqft);

    // Tiles Area
    const tilesSqft = Math.round(carpetArea * 1.08);

    // --- Compute Costs (INR) ---
    const costCement = cementBags * prices.cement;
    const costSteel = steelWeightKg * prices.steel;
    const costBricks = bricksCount * prices.bricks;
    const costSand = sandTons * prices.sand;
    const costAggregate = aggregateTons * 1600; // aggregate at ₹1600/ton fixed
    const costTiles = tilesSqft * prices.tiles;
    const costPaint = paintLiters * 250; // paint at ₹250/L fixed
    
    const costFittings = 45000 + (model.rooms.length * 8000);
    const costLabor = Math.round(plotArea * 250);

    const totalProjectCost = Math.round(
      costCement + costSteel + costBricks + costSand + costAggregate + costTiles + costPaint + costFittings + costLabor
    );

    return {
      cement: cementBags,
      steel: steelWeightKg,
      bricks: bricksCount,
      sand: sandTons,
      aggregate: aggregateTons,
      tiles: tilesSqft,
      paint: paintLiters,
      fittings: costFittings,
      labor: costLabor,
      totalCost: totalProjectCost,
      plotArea: plotArea,
      carpetArea: carpetArea,
      wallLength: totalWallLen,
      
      // Cost breakdowns
      costCement,
      costSteel,
      costBricks,
      costSand,
      costAggregate,
      costTiles,
      costPaint
    };
  }
};

function updateCivilEstimations() {
  const model = State.currentModel;
  if (!model) return;
  const q = Estimator.calculate(model, State.prices);

  document.getElementById('total-cost-val').textContent = `₹${q.totalCost.toLocaleString('en-IN')}`;
  
  document.getElementById('qty-cement-desc').textContent = `${q.cement.toLocaleString('en-IN')} bags @ ₹${State.prices.cement.toFixed(2)}/bag`;
  document.getElementById('qty-cement-cost').textContent = `₹${Math.round(q.costCement).toLocaleString('en-IN')}`;

  document.getElementById('qty-steel-desc').textContent = `${q.steel.toLocaleString('en-IN')} kg @ ₹${State.prices.steel.toFixed(2)}/kg`;
  document.getElementById('qty-steel-cost').textContent = `₹${Math.round(q.costSteel).toLocaleString('en-IN')}`;

  document.getElementById('qty-bricks-desc').textContent = `${q.bricks.toLocaleString('en-IN')} pcs @ ₹${State.prices.bricks.toFixed(2)}/pc`;
  document.getElementById('qty-bricks-cost').textContent = `₹${Math.round(q.costBricks).toLocaleString('en-IN')}`;

  document.getElementById('qty-sand-desc').textContent = `${q.sand.toLocaleString('en-IN')} tons @ ₹${State.prices.sand.toFixed(2)}/ton`;
  document.getElementById('qty-sand-cost').textContent = `₹${Math.round(q.costSand).toLocaleString('en-IN')}`;

  document.getElementById('qty-aggregate-desc').textContent = `${q.aggregate.toLocaleString('en-IN')} tons @ ₹1,600.00/ton`;
  document.getElementById('qty-aggregate-cost').textContent = `₹${Math.round(q.costAggregate).toLocaleString('en-IN')}`;

  document.getElementById('qty-tiles-desc').textContent = `${q.tiles.toLocaleString('en-IN')} sq ft @ ₹${State.prices.tiles.toFixed(2)}/sq ft`;
  document.getElementById('qty-tiles-cost').textContent = `₹${Math.round(q.costTiles).toLocaleString('en-IN')}`;

  document.getElementById('qty-paint-desc').textContent = `${q.paint.toLocaleString('en-IN')} Liters @ ₹250.00/L`;
  document.getElementById('qty-paint-cost').textContent = `₹${Math.round(q.costPaint).toLocaleString('en-IN')}`;

  document.getElementById('qty-mep-cost').textContent = `₹${q.fittings.toLocaleString('en-IN')}`;
  document.getElementById('qty-labor-cost').textContent = `₹${q.labor.toLocaleString('en-IN')}`;

  State.quantities = q;
}
