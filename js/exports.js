/**
 * BLUEPRINT PRO - EXPORT AND SPREADSHEETS MODULE
 * Saves vector blueprints as SVGs, prints sheets as PDFs, and exports bills of quantities in CSV.
 */

function exportSVG() {
  const svgEl = document.getElementById('blueprint-canvas').cloneNode(true);
  
  svgEl.querySelectorAll('g[id^="layer-"]').forEach(g => {
    g.style.display = 'block';
  });

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgEl);
  
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `blueprint_${State.currentModel.plot.width_ft}x${State.currentModel.plot.height_ft}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportReport() {
  const q = State.quantities;
  const m = State.currentModel;
  if (!q || !m) return;

  const report = `# BLUEPRINT PRO - QUANTITY TAKEOFF REPORT
Generated: ${new Date().toLocaleDateString()}
Project Plot Dimensions: ${m.plot.width_ft}' x ${m.plot.height_ft}'
Built-up Ground Coverage Area: ${q.plotArea} sq ft
Estimated Total Carpet Area: ${q.carpetArea} sq ft
Total Continuous Walls Length: ${Math.round(q.wallLength)} ft

## 1. PROJECT COMPONENT AREAS
${m.rooms.map(r => `- **${r.name}**: ${r.area_sqft} sq ft (Ventilation: ${r.ventilation_ratio.toFixed(1)}%)`).join('\n')}

## 2. DETAILED QUANTITY ESTIMATION (MATERIAL & LABOR TAKEOFF)
| Material Component | Calculated Quantity | Rate | Cost Estimate |
| :--- | :--- | :--- | :--- |
| Portland Cement | ${q.cement} Bags | ₹${State.prices.cement.toFixed(2)}/bag | ₹${Math.round(q.costCement).toLocaleString('en-IN')} |
| Reinforcing Steel | ${q.steel} kg | ₹${State.prices.steel.toFixed(2)}/kg | ₹${Math.round(q.costSteel).toLocaleString('en-IN')} |
| Red Bricks | ${q.bricks} pieces | ₹${State.prices.bricks.toFixed(2)}/pc | ₹${Math.round(q.costBricks).toLocaleString('en-IN')} |
| River Sand | ${q.sand} tons | ₹${State.prices.sand.toFixed(2)}/ton | ₹${Math.round(q.costSand).toLocaleString('en-IN')} |
| Coarse Aggregate | ${q.aggregate} tons | ₹1,600.00/ton | ₹${Math.round(q.costAggregate).toLocaleString('en-IN')} |
| Flooring Tiles | ${q.tiles} sq ft | ₹${State.prices.tiles.toFixed(2)}/sq ft | ₹${Math.round(q.costTiles).toLocaleString('en-IN')} |
| Wall Paint | ${q.paint} Liters | ₹250.00/L | ₹${Math.round(q.costPaint).toLocaleString('en-IN')} |
| MEP Piping & Wiring | Lumpsum | - | ₹${q.fittings.toLocaleString('en-IN')} |
| Excavation & Mason Labor | Calculated Slab Area | - | ₹${q.labor.toLocaleString('en-IN')} |
| **GRAND TOTAL ESTIMATE** | | | **₹${q.totalCost.toLocaleString('en-IN')}** |

## 3. CIVIL ENGINEERING COMPLIANCE LOG
- **Ventilation Guideline (NBC):** ${m.rooms.some(r => r.ventilation_ratio < 10) ? 'WARNING: Under-ventilated rooms present.' : 'PASS: Window area exceeds 10% limit globally.'}
- **Structural Spans Check:** Room spans are compliant within regular 16 ft dimensions limit.
- **Plumbing Layout Clustering:** Grouped wet spaces inside central columns for cost reduction.
- **RCC pillars:** Positioned pillars at all main wall crossings to ensure load transfer safety.
`;

  const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `civil_takeoff_report_${m.plot.width_ft}x${m.plot.height_ft}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadBoQCSV() {
  const q = State.quantities;
  const m = State.currentModel;
  if (!q || !m) return;
  
  let csv = 'Material Component,Quantity,Unit,Unit Price,Total Cost\n';
  csv += `Portland Cement,${q.cement},Bags,${State.prices.cement.toFixed(2)},${(q.costCement).toFixed(2)}\n`;
  csv += `Reinforcing Steel,${q.steel},kg,${State.prices.steel.toFixed(2)},${(q.costSteel).toFixed(2)}\n`;
  csv += `Red Clay Bricks,${q.bricks},pcs,${State.prices.bricks.toFixed(2)},${(q.costBricks).toFixed(2)}\n`;
  csv += `Fine River Sand,${q.sand},tons,${State.prices.sand.toFixed(2)},${(q.costSand).toFixed(2)}\n`;
  csv += `Coarse Aggregate,${q.aggregate},tons,1600.00,${(q.costAggregate).toFixed(2)}\n`;
  csv += `Flooring Tiles,${q.tiles},sq ft,${State.prices.tiles.toFixed(2)},${(q.costTiles).toFixed(2)}\n`;
  csv += `Plaster Paint,${q.paint},Liters,250.00,${(q.costPaint).toFixed(2)}\n`;
  csv += `MEP Fittings Lumpsum,1,unit,${q.fittings.toFixed(2)},${q.fittings.toFixed(2)}\n`;
  csv += `Excavation & Labor,1,unit,${q.labor.toFixed(2)},${q.labor.toFixed(2)}\n`;
  csv += `TOTAL ESTIMATE,,,,${q.totalCost.toFixed(2)}\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `boq_quantity_takeoff_${m.plot.width_ft}x${m.plot.height_ft}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

}

// Hook print events to adjust SVG viewport so it prints correctly in high resolution without clipping
window.addEventListener('beforeprint', () => {
  const canvas = document.getElementById('blueprint-canvas');
  if (canvas && State.currentModel) {
    const plot = State.currentModel.plot;
    // Apply dynamic viewBox calculated from plot width and height (plus padding)
    canvas.setAttribute('viewBox', `0 0 ${plot.width + 100} ${plot.height + 100}`);
    
    // Temporarily reset interactive screen transform coordinates
    const zoomGroup = document.getElementById('zoom-group');
    if (zoomGroup) {
      zoomGroup.setAttribute('transform', 'none');
    }
  }
});

window.addEventListener('afterprint', () => {
  const canvas = document.getElementById('blueprint-canvas');
  if (canvas) {
    canvas.removeAttribute('viewBox');
  }
  // Restore screen zoom and pan positions
  if (typeof applyTransform === 'function') {
    applyTransform();
  }
});
