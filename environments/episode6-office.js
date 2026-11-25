import * as THREE from 'three';
import { ClubOfficeApp } from './club-office.js';

/**
 * Episode 6 dressing pass for the established Buluh FC office.
 * Reuses the existing room, furniture, lighting and layout, adding only
 * story-specific dressing: a stadium-view window, finance ledger and legal
 * extension papers. The original office asset remains unchanged for continuity.
 */
export class Episode6OfficeApp extends ClubOfficeApp {
  async init() {
    await super.init();
    this.addEpisode6Dressing();
    return this;
  }

  makeLabelTexture(title, lines, accent = '#9d2929', amount = 'RM326,500') {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f4f0e4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#b6a98d';
    ctx.lineWidth = 8;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
    ctx.fillStyle = '#25231f';
    ctx.textAlign = 'center';
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillText(title, canvas.width / 2, 86);
    ctx.strokeStyle = '#c7bda8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(54, 116);
    ctx.lineTo(canvas.width - 54, 116);
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#625d52';
    ctx.font = '24px Arial, sans-serif';
    lines.forEach((line, index) => ctx.fillText(line, 62, 174 + index * 58));
    if (amount) {
      ctx.fillStyle = accent;
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(amount, canvas.width / 2, 424);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  makeStadiumViewTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, '#9bb6c5');
    sky.addColorStop(0.58, '#d9d4b7');
    sky.addColorStop(1, '#78925c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#6f8d55';
    ctx.fillRect(0, 300, 1024, 212);
    ctx.fillStyle = '#a9b1ad';
    ctx.beginPath();
    ctx.moveTo(330, 150); ctx.lineTo(700, 150); ctx.lineTo(760, 285); ctx.lineTo(270, 285); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#56636a';
    ctx.fillRect(292, 176, 442, 18);
    for (let row = 0; row < 5; row++) {
      ctx.fillStyle = row % 2 ? '#7d8a8b' : '#aeb6b0';
      ctx.fillRect(310 + row * 7, 202 + row * 15, 406 - row * 14, 10);
    }
    ctx.strokeStyle = '#f0ead8';
    ctx.lineWidth = 5;
    ctx.strokeRect(90, 340, 844, 130);
    ctx.beginPath(); ctx.moveTo(512, 340); ctx.lineTo(512, 470); ctx.stroke();
    ctx.beginPath(); ctx.arc(512, 405, 48, 0, Math.PI * 2); ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  addEpisode6Dressing() {
    const room = this.character;
    if (!room || this.anchors.episode6Dressing) return;
    const group = new THREE.Group();
    group.name = 'Episode6OfficeDressing';

    // Window sits on the existing back wall section, clear of the doorway.
    const windowX = -4.35;
    const windowY = 2.25;
    const windowZ = -5.06;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x292b2c, roughness: 0.58, metalness: 0.18 });
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.35, 1.3),
      new THREE.MeshBasicMaterial({ map: this.makeStadiumViewTexture() })
    );
    glass.position.set(windowX, windowY, windowZ);
    group.add(glass);
    const framePieces = [
      [2.48, 0.09, 0.09, windowX, windowY + 0.69, windowZ - 0.015],
      [2.48, 0.09, 0.09, windowX, windowY - 0.69, windowZ - 0.015],
      [0.09, 1.45, 0.09, windowX - 1.22, windowY, windowZ - 0.015],
      [0.09, 1.45, 0.09, windowX + 1.22, windowY, windowZ - 0.015],
      [0.055, 1.3, 0.055, windowX, windowY, windowZ - 0.03]
    ];
    framePieces.forEach(([w,h,d,x,y,z]) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), frameMat);
      mesh.position.set(x,y,z);
      mesh.castShadow = true;
      group.add(mesh);
    });

    const bookCover = new THREE.MeshStandardMaterial({ color: 0x5a2928, roughness: 0.85 });
    const ledger = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.07, 0.66), bookCover);
    ledger.position.set(-0.78, 0.89, 0.02);
    ledger.rotation.y = -0.12;
    ledger.castShadow = true;
    group.add(ledger);
    const ledgerPage = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.6),
      new THREE.MeshBasicMaterial({ map: this.makeLabelTexture('FINANCE RECORD BOOK', ['BULUH FC  •  DIVISION 5', 'OUTSTANDING CLUB DEBT', 'KEK MAJU CONTRIBUTION: -RM5,000']) })
    );
    ledgerPage.rotation.x = -Math.PI / 2;
    ledgerPage.rotation.z = -0.12;
    ledgerPage.position.set(-0.78, 0.929, 0.02);
    group.add(ledgerPage);

    const legalPaper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.52),
      new THREE.MeshBasicMaterial({ map: this.makeLabelTexture('PERJANJIAN BERSYARAT', ['NOTIS LANJUTAN TEMPOH', 'PEMBEKUAN PENYITAAN STADIUM', 'SAH SEHINGGA TAMAT MUSIM'], '#9d2929', null) })
    );
    legalPaper.rotation.x = -Math.PI / 2;
    legalPaper.rotation.z = 0.18;
    legalPaper.position.set(0.78, 0.87, -0.18);
    group.add(legalPaper);

    room.add(group);
    this.anchors.episode6Dressing = group;
    this.anchors.financeLedger = ledger;
    this.anchors.legalAgreement = legalPaper;
    this.characterParts = { ...this.characterParts, ...this.anchors };
  }
}
