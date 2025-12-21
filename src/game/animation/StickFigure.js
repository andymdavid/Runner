const degToRad = (deg) => (deg * Math.PI) / 180;

const drawLimb = (ctx, startX, startY, length, angleDeg) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  const angle = degToRad(angleDeg);
  ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
  ctx.stroke();
};

export const StickFigure = {
  drawRunning(ctx, x, y, frame) {
    const loopFrame = frame % 1;
    const groundY = y - 2;
    const headRadius = 8;
    const torsoTopY = groundY - 30;
    const torsoBottomY = groundY - 14;
    const limbLength = 12;

    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;

    // Head
    ctx.beginPath();
    ctx.arc(x, groundY - 38, headRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(x, torsoTopY);
    ctx.lineTo(x, torsoBottomY);
    ctx.stroke();

    const armBaseX = x;
    const armBaseY = torsoTopY + 4;

    const leftArmAngle = -30 + loopFrame * 60;
    const rightArmAngle = 30 - loopFrame * 60;

    drawLimb(ctx, armBaseX, armBaseY, limbLength, leftArmAngle);
    drawLimb(ctx, armBaseX, armBaseY, limbLength, rightArmAngle);

    const legBaseX = x;
    const legBaseY = groundY - limbLength;

    const leftLegAngle = -20 + loopFrame * 40;
    const rightLegAngle = 20 - loopFrame * 40;

    drawLimb(ctx, legBaseX, legBaseY, limbLength, leftLegAngle + 90);
    drawLimb(ctx, legBaseX, legBaseY, limbLength, rightLegAngle + 90);

    ctx.restore();
  },

  drawSprinting(ctx, x, y, frame) {
    const loopFrame = (frame * 1.5) % 1;
    ctx.save();
    ctx.translate(x, y - 2);
    ctx.rotate(degToRad(15));
    this.drawRunning(ctx, 0, 0, loopFrame);
    ctx.restore();
  },

  drawCrouched(ctx, x, y, frame) {
    const loopFrame = frame % 1;
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.scale(1, 0.6);

    const scaledY = (y - 2) / 0.6;

    ctx.beginPath();
    ctx.arc(x, scaledY - 32, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, scaledY - 26);
    ctx.lineTo(x - 6, scaledY - 10);
    ctx.lineTo(x, scaledY - 6);
    ctx.stroke();

    drawLimb(ctx, x - 6, scaledY - 10, 14, -30 + loopFrame * 30);
    drawLimb(ctx, x - 6, scaledY - 10, 14, 30 - loopFrame * 30);

    drawLimb(ctx, x, scaledY - 6, 12, 150 - loopFrame * 30);
    drawLimb(ctx, x, scaledY - 6, 12, 210 + loopFrame * 30);

    ctx.restore();
  },
};
