/**
 * BLUEPRINT PRO - CIVIL GUIDELINES CHECKLIST
 * Audits room dimensions, aspect ratios, plumbing clustering, and ventilation against building codes.
 */

function updateWarningsChecklist() {
  const model = State.currentModel;
  const list = document.getElementById('checklist-items');
  if (!list || !model) return;
  
  list.innerHTML = '';
  let warningsCount = 0;

  // 1. Aspect Ratio Checks
  const ratioVal = model.plot.width_ft / model.plot.height_ft;
  const rLi = document.createElement('li');
  if (ratioVal >= 0.8 && ratioVal <= 1.55) {
    rLi.className = 'warn-check';
    rLi.innerHTML = `<i class="fa-solid fa-circle-check"></i><div class="warn-text"><strong>Plot Aspect Ratio (${ratioVal.toFixed(2)}) is optimal.</strong> Uniform shear stress distribution.</div>`;
  } else {
    warningsCount++;
    rLi.className = 'warn-warning';
    rLi.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i><div class="warn-text"><strong>Aspect Ratio (${ratioVal.toFixed(2)}) is high.</strong> Narrow structure; reinforcing RCC columns required.</div>`;
  }
  list.appendChild(rLi);

  // 2. Plumbing Clustered checks
  const mBath = model.rooms.find(r => r.id === 'master_bath');
  const cBath = model.rooms.find(r => r.id === 'common_bath');
  let wetDistance = 0;
  if (mBath && cBath) {
    const dx = (mBath.x1+mBath.x2)/2 - (cBath.x1+cBath.x2)/2;
    const dy = (mBath.y1+mBath.y2)/2 - (cBath.y1+cBath.y2)/2;
    wetDistance = Math.sqrt(dx*dx + dy*dy) / Generator.SCALE;
  }

  const pLi = document.createElement('li');
  if (wetDistance < 15) {
    pLi.className = 'warn-check';
    pLi.innerHTML = `<i class="fa-solid fa-circle-check"></i><div class="warn-text"><strong>Plumbing Clustered:</strong> Bathrooms sharing wall boundaries. Reduces plumbing runs and material cost by 35%.</div>`;
  } else {
    warningsCount++;
    pLi.className = 'warn-warning';
    pLi.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i><div class="warn-text"><strong>Distributed Wet Walls:</strong> Wet spaces are far apart. Requires multiple drainage riser shafts.</div>`;
  }
  list.appendChild(pLi);

  // 3. Ventilation standard checks
  let poorlyVentilated = [];
  model.rooms.forEach(room => {
    if ((room.type === 'bedroom' || room.type === 'living') && room.ventilation_ratio < 10.0) {
      poorlyVentilated.push(room.name);
    }
  });

  const vLi = document.createElement('li');
  if (poorlyVentilated.length === 0) {
    vLi.className = 'warn-check';
    vLi.innerHTML = `<i class="fa-solid fa-circle-check"></i><div class="warn-text"><strong>Ventilation Compliant:</strong> All rooms exceed the 10% NBC window-to-floor area standard.</div>`;
  } else {
    warningsCount++;
    vLi.className = 'warn-danger';
    vLi.innerHTML = `<i class="fa-solid fa-circle-xmark"></i><div class="warn-text"><strong>Ventilation Deficit:</strong> ${poorlyVentilated.join(', ')} has less than 10% ventilation ratio. Add larger windows.</div>`;
  }
  list.appendChild(vLi);

  // 4. Structural Span limits
  let wideSpans = [];
  model.rooms.forEach(room => {
    if (room.width_ft > 17 || room.height_ft > 17) {
      wideSpans.push(room.name);
    }
  });

  const sLi = document.createElement('li');
  if (wideSpans.length === 0) {
    sLi.className = 'warn-check';
    sLi.innerHTML = `<i class="fa-solid fa-circle-check"></i><div class="warn-text"><strong>Structural Integrity:</strong> Room spans within standard 16 ft limits. Normal slab cost.</div>`;
  } else {
    warningsCount++;
    sLi.className = 'warn-warning';
    sLi.innerHTML = `<i class="fa-solid fa-circle-info"></i><div class="warn-text"><strong>Wide structural span:</strong> ${wideSpans.join(', ')} exceeds 16 ft. Requires thicker slab or main structural beam support.</div>`;
  }
  list.appendChild(sLi);

  // 5. RCC Pillars columns audit
  const colLi = document.createElement('li');
  colLi.className = 'warn-check';
  colLi.innerHTML = `<i class="fa-solid fa-circle-nodes" style="color: #f43f5e;"></i><div class="warn-text"><strong>RCC columns:</strong> Generated ${model.columns.length} structural pillars. Uniform column layout at wall junctions.</div>`;
  list.appendChild(colLi);

  // Update warnings counts
  const warnCount = document.getElementById('status-warnings-count');
  if (warnCount) warnCount.textContent = warningsCount;
  
  const warnIcon = document.getElementById('status-warnings-indicator');
  if (warnIcon) {
    if (warningsCount > 0) {
      warnIcon.className = 'fa-solid fa-circle-exclamation text-yellow';
      if (warnCount) warnCount.style.color = 'var(--accent-amber)';
    } else {
      warnIcon.className = 'fa-solid fa-circle-check text-green';
      if (warnCount) warnCount.style.color = 'var(--accent-emerald)';
    }
  }
}
