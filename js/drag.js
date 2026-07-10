/**
 * BLUEPRINT PRO - ELEMENT DRAG & DROP
 * Supports drag and drop operations to reposition electrical nodes inside rooms.
 */

function startElementDrag(e, node) {
  if (State.activeLayer !== 'electrical') return;
  e.stopPropagation();
  e.preventDefault();
  
  const canvas = document.getElementById('blueprint-canvas');
  const zoomGroup = document.getElementById('zoom-group');
  
  const pt = canvas.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const localPt = pt.matrixTransform(zoomGroup.getScreenCTM().inverse());
  
  State.dragTarget = {
    element: e.target,
    node: node,
    startX: localPt.x,
    startY: localPt.y,
    nodeOrigX: node.x,
    nodeOrigY: node.y
  };
}

function handleElementDrag(e) {
  if (!State.dragTarget) return;
  e.preventDefault();
  
  const canvas = document.getElementById('blueprint-canvas');
  const zoomGroup = document.getElementById('zoom-group');
  
  const pt = canvas.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const localPt = pt.matrixTransform(zoomGroup.getScreenCTM().inverse());
  
  const dx = localPt.x - State.dragTarget.startX;
  const dy = localPt.y - State.dragTarget.startY;
  
  let newX = Math.round(State.dragTarget.nodeOrigX + dx);
  let newY = Math.round(State.dragTarget.nodeOrigY + dy);
  
  const room = State.currentModel.rooms.find(r => r.id === State.dragTarget.node.room);
  if (room) {
    const pad = 10;
    newX = Math.max(room.x1 + pad, Math.min(room.x2 - pad, newX));
    newY = Math.max(room.y1 + pad, Math.min(room.y2 - pad, newY));
  }
  
  State.dragTarget.node.x = newX;
  State.dragTarget.node.y = newY;
  
  State.dragTarget.element.setAttribute('cx', newX);
  State.dragTarget.element.setAttribute('cy', newY);
  
  const parentGroup = document.getElementById(`grp_${State.dragTarget.node.id}`);
  if (parentGroup) {
    const lines = parentGroup.getElementsByTagName('line');
    if (lines.length >= 2) {
      lines[0].setAttribute('x1', newX - 5);
      lines[0].setAttribute('y1', newY - 5);
      lines[0].setAttribute('x2', newX + 5);
      lines[0].setAttribute('y2', newY + 5);
      
      lines[1].setAttribute('x1', newX + 5);
      lines[1].setAttribute('y1', newY - 5);
      lines[1].setAttribute('x2', newX - 5);
      lines[1].setAttribute('y2', newY + 5);
    }
  }
  
  const switchBoard = State.currentModel.electrical.switches.find(s => s.room === room.id);
  const wire = State.currentModel.electrical.wiring.find(w => w.from === State.dragTarget.node.id);
  
  if (wire && switchBoard) {
    wire.x1 = newX;
    wire.y1 = newY;
    const wirePath = document.getElementById(`wire_from_${wire.from}`);
    if (wirePath) {
      const mx = (newX + switchBoard.x) / 2;
      const my = (newY + switchBoard.y) / 2 - 25;
      wirePath.setAttribute('d', `M ${newX} ${newY} Q ${mx} ${my} ${switchBoard.x} ${switchBoard.y}`);
    }
  }

  if (State.selectedComponent && State.selectedComponent.id === room.id) {
    updateRoomInspector(room);
  }
}

function endElementDrag() {
  if (State.dragTarget) {
    State.dragTarget = null;
    updateCivilEstimations();
    updateWarningsChecklist();
  }
}
