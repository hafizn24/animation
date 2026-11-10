export class CharacterInspector {
  constructor(manager) {
    this.manager = manager;
    this.character = manager.character;
    this.inspectorPanel = null;
    this.selectedObject = null;
  }

  updateCharacter(character) {
    this.character = character;
    this.update();
  }

  setCharName(name) {
    if (this.character?.userData) {
      this.character.userData.charName = name;
    }
  }

  createPanel(container) {
    this.inspectorPanel = document.createElement('div');
    this.inspectorPanel.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 280px;
      max-height: 80vh;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 100;
    `;
    container.appendChild(this.inspectorPanel);
    this.update();
    return this.inspectorPanel;
  }

  update() {
    if (!this.inspectorPanel || !this.character) return;

    const charName = this.character.userData.charName || 'Unknown';
    
    this.inspectorPanel.innerHTML = `
      <div style="margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 10px;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">🧩 Character Inspector</div>
        <div style="color: #888;">Selection: ${this.selectedObject ? this.selectedObject.name || 'Unknown' : 'None (click on object)'}</div>
        <div style="font-size: 11px; color: #4a90d9; margin-top: 5px;">Current: ${charName}</div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">POSITION</div>
        <div>pos: (${this.sanitize(this.character.position.x)}, ${this.sanitize(this.character.position.y)}, ${this.sanitize(this.character.position.z)})</div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">ROTATION (Euler)</div>
        <div>rot: (${this.sanitize(this.character.rotation.x)}, ${this.sanitize(this.character.rotation.y)}, ${this.sanitize(this.character.rotation.z)})</div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">SCALE</div>
        <div>scale: (${this.sanitize(this.character.scale.x)}, ${this.sanitize(this.character.scale.y)}, ${this.sanitize(this.character.scale.z)})</div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">TRANSFORM</div>
        <div>matrix: 4x4</div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">CHILD OBJECTS (${this.character.children.length})</div>
        ${this.character.children.map((child, i) => `
          <div style="display: flex; justify-content: space-between; padding: 3px 0; cursor: pointer;"
               onmouseover="this.style.background='rgba(255,255,255,0.1)'"
               onmouseout="this.style.background='transparent'"
               onclick="inspector.selectObject(${i})">
            <span style="color: ${child.isMesh ? '#90EE90' : '#87CEEB'}">${child.name || `Object ${i}`}</span>
            <span>(${child.type})</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  selectObject(index) {
    this.selectedObject = this.character.children[index] || null;
    this.update();
  }

  sanitize(value) {
    const num = Number(value);
    if (isNaN(num)) return 'NaN';
    return num.toFixed(3);
  }
}
