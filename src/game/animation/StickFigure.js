// Position-based keyframe animation system
// All positions are relative to the base point (x, y)

const lerp = (a, b, t) => a + (b - a) * t;

const lerpPose = (pose1, pose2, t) => {
  const result = {};
  for (const limb in pose1) {
    result[limb] = {};
    for (const point in pose1[limb]) {
      result[limb][point] = lerp(pose1[limb][point], pose2[limb][point], t);
    }
  }
  return result;
};

// Running cycle - back leg with LONGER upper thigh
const runningPose1 = {
  head: { x: 3, y: -68, radius: 12 },
  torso: { x1: 2, y1: -53, x2: -1, y2: -38 },
  // Shoulders at (2, -51)
  // Left arm: upper arm more level, then bends down
  leftArm: { x1: 2, y1: -51, x2: -11, y2: -47, x3: -11, y3: -28 },    // upper arm more level, hand down
  // Right arm forward: upper arm more level
  rightArm: { x1: 2, y1: -51, x2: 10, y2: -46, x3: 14, y3: -31 },     // upper arm more level
  // Hips at (-1, -38)
  // Left leg (forward): knee forward, foot back to ground
  leftLeg: { x1: -1, y1: -38, x2: 8, y2: -19, x3: 6, y3: 0 },         // knee midpoint forward, foot to ground
  // Right leg (back): LONGER upper thigh extends further back and down
  rightLeg: { x1: -1, y1: -38, x2: -14, y2: -18, x3: -22, y3: -28 }   // longer thigh to knee, lower leg angles UP
};

const runningPose2 = {
  head: { x: 3, y: -68, radius: 12 },
  torso: { x1: 2, y1: -53, x2: -1, y2: -38 },
  // Shoulders at (2, -51)
  // Right arm: upper arm more level, then bends down
  rightArm: { x1: 2, y1: -51, x2: -11, y2: -47, x3: -11, y3: -28 },   // upper arm more level, hand down
  // Left arm forward: upper arm more level
  leftArm: { x1: 2, y1: -51, x2: 10, y2: -46, x3: 14, y3: -31 },      // upper arm more level
  // Hips at (-1, -38)
  // Right leg (forward): knee forward, foot back to ground
  rightLeg: { x1: -1, y1: -38, x2: 8, y2: -19, x3: 6, y3: 0 },        // knee midpoint forward, foot to ground
  // Left leg (back): LONGER upper thigh extends further back and down
  leftLeg: { x1: -1, y1: -38, x2: -14, y2: -18, x3: -22, y3: -28 }    // longer thigh to knee, lower leg angles UP
};

// Sprinting - back leg with LONGER upper thigh, more exaggerated
const sprintingPose1 = {
  head: { x: 8, y: -68, radius: 12 },
  torso: { x1: 5, y1: -53, x2: -3, y2: -38 },
  // Shoulders at (5, -51)
  // Left arm: upper arm more level, then bends down
  leftArm: { x1: 5, y1: -51, x2: -8, y2: -46, x3: -8, y3: -26 },      // upper arm more level, hand down
  // Right arm forward: upper arm more level
  rightArm: { x1: 5, y1: -51, x2: 15, y2: -45, x3: 22, y3: -29 },     // upper arm more level
  // Hips at (-3, -38)
  // Left leg (forward): bigger stride
  leftLeg: { x1: -3, y1: -38, x2: 11, y2: -19, x3: 9, y3: 0 },        // knee forward, foot back
  // Right leg (back): LONGER thigh, extends way back
  rightLeg: { x1: -3, y1: -38, x2: -16, y2: -16, x3: -26, y3: -30 }   // longer thigh, lower leg angles UP high
};

const sprintingPose2 = {
  head: { x: 8, y: -68, radius: 12 },
  torso: { x1: 5, y1: -53, x2: -3, y2: -38 },
  // Shoulders at (5, -51)
  // Right arm: upper arm more level, then bends down
  rightArm: { x1: 5, y1: -51, x2: -8, y2: -46, x3: -8, y3: -26 },     // upper arm more level, hand down
  // Left arm forward: upper arm more level
  leftArm: { x1: 5, y1: -51, x2: 15, y2: -45, x3: 22, y3: -29 },      // upper arm more level
  // Hips at (-3, -38)
  // Right leg (forward): bigger stride
  rightLeg: { x1: -3, y1: -38, x2: 11, y2: -19, x3: 9, y3: 0 },       // knee forward, foot back
  // Left leg (back): LONGER thigh, extends way back
  leftLeg: { x1: -3, y1: -38, x2: -16, y2: -16, x3: -26, y3: -30 }    // longer thigh, lower leg angles UP high
};

const crouchedPose = {
  head: { x: -5, y: -48, radius: 12 },
  torso: { x1: -5, y1: -33, x2: -12, y2: -20 },
  // Arms bent with elbows at midpoint
  leftArm: { x1: -5, y1: -31, x2: -16, y2: -23, x3: -22, y3: -16 },   // elbow midpoint
  rightArm: { x1: -5, y1: -31, x2: -12, y2: -20, x3: -14, y3: -10 },  // elbow midpoint
  // Legs bent with knees at midpoint
  leftLeg: { x1: -12, y1: -20, x2: -20, y2: -10, x3: -18, y3: 0 },    // knee midpoint
  rightLeg: { x1: -12, y1: -20, x2: -8, y2: -10, x3: -3, y3: 0 }      // knee midpoint
};

const drawPose = (ctx, x, y, pose) => {
  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw torso
  ctx.beginPath();
  ctx.moveTo(x + pose.torso.x1, y + pose.torso.y1);
  ctx.lineTo(x + pose.torso.x2, y + pose.torso.y2);
  ctx.stroke();

  // Draw limbs (arms and legs)
  const drawLimb = (limb) => {
    ctx.beginPath();
    ctx.moveTo(x + limb.x1, y + limb.y1);
    ctx.lineTo(x + limb.x2, y + limb.y2);
    ctx.lineTo(x + limb.x3, y + limb.y3);
    ctx.stroke();
  };

  // Draw back limbs slightly darker for depth
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  drawLimb(pose.rightArm);
  drawLimb(pose.rightLeg);

  // Draw front limbs
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  drawLimb(pose.leftArm);
  drawLimb(pose.leftLeg);

  // Draw head last (on top)
  ctx.beginPath();
  ctx.arc(x + pose.head.x, y + pose.head.y, pose.head.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const StickFigure = {
  drawRunning(ctx, x, y, frame) {
    // Simple 2-keyframe cycle with fixed pivot points
    const cycle = frame * 2; // 0 to 2
    let t, pose1, pose2;

    if (cycle < 1) {
      // First half: pose1 -> pose2
      t = cycle;
      pose1 = runningPose1;
      pose2 = runningPose2;
    } else {
      // Second half: pose2 -> pose1
      t = cycle - 1;
      pose1 = runningPose2;
      pose2 = runningPose1;
    }

    const interpolatedPose = lerpPose(pose1, pose2, t);
    drawPose(ctx, x, y, interpolatedPose);
  },

  drawSprinting(ctx, x, y, frame) {
    // Same 2-keyframe approach, more exaggerated
    const cycle = frame * 2; // 0 to 2
    let t, pose1, pose2;

    if (cycle < 1) {
      t = cycle;
      pose1 = sprintingPose1;
      pose2 = sprintingPose2;
    } else {
      t = cycle - 1;
      pose1 = sprintingPose2;
      pose2 = sprintingPose1;
    }

    const interpolatedPose = lerpPose(pose1, pose2, t);
    drawPose(ctx, x, y, interpolatedPose);
  },

  drawCrouched(ctx, x, y) {
    drawPose(ctx, x, y, crouchedPose);
  },
};
