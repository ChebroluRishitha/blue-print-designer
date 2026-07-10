/**
 * BLUEPRINT PRO - ELEMENT INSPECTION HANDLERS
 * Updates details panels, calculating local ventilation, lighting ratios, and storage spaces.
 */

function selectComponent(comp, category) {
  State.selectedComponent = comp;
  document.querySelectorAll('.room-sensor-bg').forEach(rect => rect.classList.remove('selected'));
  
  if (category === 'room') {
    const rect = document.getElementById(`sensor_${comp.id}`);
    if (rect) rect.classList.add('selected');
    updateRoomInspector(comp);
  } else if (category === 'window') {
    updateWindowInspector(comp);
  } else {
    updateElectricalInspector(comp);
  }
}

function hideInspectorDetails() {
  document.getElementById('inspector-placeholder').style.display = 'flex';
  document.getElementById('inspector-details').style.display = 'none';
}

function updateRoomInspector(room) {
  document.getElementById('inspector-placeholder').style.display = 'none';
  const details = document.getElementById('inspector-details');
  details.style.display = 'block';

  document.getElementById('inspect-room-name').textContent = room.name;
  document.getElementById('inspect-room-area').textContent = `${room.area_sqft} sq ft`;
  document.getElementById('inspect-room-type').textContent = room.type.toUpperCase();

  // 1. Lux Level Calculations
  const lights = State.currentModel.electrical.lights.filter(l => l.room === room.id && l.type === 'light');
  const totalLights = lights.length;
  
  const lumenPerFixture = 850;
  const cu = 0.5;
  const mf = 0.8;
  const areaSqm = room.area_sqft * 0.092903;
  const lux = Math.round((totalLights * lumenPerFixture * cu * mf) / areaSqm);
  const target = TARGET_LUX[room.type] || 100;

  const luxStatus = document.getElementById('inspect-lighting-status');
  const luxBar = document.getElementById('inspect-lighting-bar');
  const luxCurr = document.getElementById('inspect-lighting-curr');
  const luxTarget = document.getElementById('inspect-lighting-target');

  luxCurr.textContent = `${lux} Lux Calculated`;
  luxTarget.textContent = `Target: ${target} Lux`;

  const lightingRatio = Math.min(100, (lux / target) * 100);
  luxBar.style.width = `${lightingRatio}%`;

  if (lux >= target) {
    luxStatus.textContent = 'PASS';
    luxStatus.className = 'badge badge-success';
    luxBar.style.backgroundColor = 'var(--accent-emerald)';
  } else {
    luxStatus.textContent = 'LOW LUX';
    luxStatus.className = 'badge badge-warning';
    luxBar.style.backgroundColor = 'var(--accent-amber)';
  }

  // 2. Ventilation compliance
  const roomWins = State.currentModel.openings.windows.filter(w => w.room === room.id);
  let winArea = 0;
  roomWins.forEach(w => {
    const h = room.type === 'bathroom' ? 2 : 4;
    winArea += (w.width / Generator.SCALE) * h;
  });
  
  const ventRatio = ((winArea / room.area_sqft) * 100).toFixed(1);
  const ventStatus = document.getElementById('inspect-vent-status');
  const ventBar = document.getElementById('inspect-vent-bar');
  const ventCurr = document.getElementById('inspect-vent-curr');

  ventCurr.textContent = `${ventRatio}% Window-to-Floor`;
  const fillRatio = Math.min(100, (parseFloat(ventRatio) / 10) * 100);
  ventBar.style.width = `${fillRatio}%`;

  if (parseFloat(ventRatio) >= 10.0) {
    ventStatus.textContent = 'PASS';
    ventStatus.className = 'badge badge-success';
    ventBar.style.backgroundColor = 'var(--accent-emerald)';
  } else {
    ventStatus.textContent = 'DEFICIENT';
    ventStatus.className = 'badge badge-error';
    ventBar.style.backgroundColor = 'var(--accent-rose)';
  }

  // 3. Storage compliance
  const cupboards = State.currentModel.furniture.filter(f => f.room === room.id && f.type === 'wardrobe');
  const storageStatus = document.getElementById('inspect-storage-status');
  const storageDetails = document.getElementById('inspect-storage-details');

  if (room.type === 'bedroom') {
    if (cupboards.length > 0) {
      storageStatus.textContent = 'SUFFICIENT';
      storageStatus.className = 'badge badge-success';
      const w_ft = Math.round(cupboards[0].width / Generator.SCALE);
      storageDetails.textContent = `1 Built-in wardrobe (${w_ft} ft width, 2 ft depth)`;
    } else {
      storageStatus.textContent = 'MISSING';
      storageStatus.className = 'badge badge-error';
      storageDetails.textContent = 'No wardrobe placed. Target: ≥ 5 ft closet';
    }
    document.getElementById('compliance-storage').style.display = 'block';
  } else if (room.type === 'kitchen') {
    storageStatus.textContent = 'OPTIMAL';
    storageStatus.className = 'badge badge-success';
    storageDetails.textContent = 'Modular L-counter cupboards allocated.';
    document.getElementById('compliance-storage').style.display = 'block';
  } else {
    document.getElementById('compliance-storage').style.display = 'none';
  }
}

function updateWindowInspector(win) {
  document.getElementById('inspector-placeholder').style.display = 'none';
  const details = document.getElementById('inspector-details');
  details.style.display = 'block';

  const w_ft = (win.width / Generator.SCALE).toFixed(1);
  const room = State.currentModel.rooms.find(r => r.id === win.room);

  document.getElementById('inspect-room-name').textContent = `Exterior Window`;
  document.getElementById('inspect-room-area').textContent = `${w_ft} ft Width`;
  document.getElementById('inspect-room-type').textContent = `WINDOW FIXTURE`;

  document.getElementById('compliance-lighting').style.display = 'none';
  document.getElementById('compliance-storage').style.display = 'none';
  
  const ventStatus = document.getElementById('inspect-vent-status');
  const ventBar = document.getElementById('inspect-vent-bar');
  const ventCurr = document.getElementById('inspect-vent-curr');
  
  document.getElementById('compliance-ventilation').style.display = 'block';
  ventStatus.textContent = 'ACTIVE';
  ventStatus.className = 'badge badge-info';
  ventBar.style.width = '100%';
  ventCurr.textContent = `Provides fresh air connectivity to ${room ? room.name : 'structure'}`;
}

function updateElectricalInspector(node) {
  document.getElementById('inspector-placeholder').style.display = 'none';
  const details = document.getElementById('inspector-details');
  details.style.display = 'block';

  document.getElementById('inspect-room-name').textContent = node.type === 'fan' ? 'Ceiling Fan' : 'LED Light point';
  document.getElementById('inspect-room-area').textContent = node.type === 'fan' ? '5-Star Energy Rated' : '9W LED (850 lumens)';
  document.getElementById('inspect-room-type').textContent = `ELECTRICAL POINT`;

  document.getElementById('compliance-ventilation').style.display = 'none';
  document.getElementById('compliance-storage').style.display = 'none';
  
  const luxStatus = document.getElementById('inspect-lighting-status');
  const luxBar = document.getElementById('inspect-lighting-bar');
  const luxCurr = document.getElementById('inspect-lighting-curr');
  const luxTarget = document.getElementById('inspect-lighting-target');
  
  document.getElementById('compliance-lighting').style.display = 'block';
  luxStatus.textContent = 'FUNCTIONAL';
  luxStatus.className = 'badge badge-success';
  luxBar.style.width = '100%';
  luxBar.style.backgroundColor = 'var(--accent-amber)';
  luxCurr.textContent = `Connected to Switchboard in room`;
  luxTarget.textContent = ``;
}
