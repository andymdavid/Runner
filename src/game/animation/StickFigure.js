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

// Running cycle - joints at midpoint, back leg longer with pronounced bend
const runningPose1 = {
  head: { x: 3, y: -55, radius: 15 },
  torso: { x1: 2, y1: -40, x2: -1, y2: -25 },
  // Shoulders at (2, -38) - arms are ~30 units total (15+15)
  // Left arm points OUT to left, then bends down
  leftArm: { x1: 2, y1: -38, x2: -11, y2: -30, x3: -11, y3: -15 },    // out left, elbow at midpoint, hand down
  // Right arm forward
  rightArm: { x1: 2, y1: -38, x2: 10, y2: -28, x3: 14, y3: -18 },     // forward, elbow midpoint
  // Hips at (-1, -25) - legs are ~25 units total (12.5+12.5)
  // Left leg (forward): knee at midpoint ~12-13 units down
  leftLeg: { x1: -1, y1: -25, x2: 8, y2: -13, x3: 6, y3: 0 },         // knee midpoint forward, foot back to ground
  // Right leg (back): LONGER with more pronounced upward bend
  rightLeg: { x1: -1, y1: -25, x2: -7, y2: -13, x3: -11, y3: -6 }     // knee midpoint back, foot bent up high
};

const runningPose2 = {
  head: { x: 3, y: -55, radius: 15 },
  torso: { x1: 2, y1: -40, x2: -1, y2: -25 },
  // Shoulders at (2, -38)
  // Right arm points OUT to left, then bends down
  rightArm: { x1: 2, y1: -38, x2: -11, y2: -30, x3: -11, y3: -15 },   // out left, elbow midpoint, hand down
  // Left arm forward
  leftArm: { x1: 2, y1: -38, x2: 10, y2: -28, x3: 14, y3: -18 },      // forward, elbow midpoint
  // Hips at (-1, -25)
  // Right leg (forward): knee at midpoint
  rightLeg: { x1: -1, y1: -25, x2: 8, y2: -13, x3: 6, y3: 0 },        // knee midpoint forward, foot back to ground
  // Left leg (back): LONGER with more pronounced upward bend
  leftLeg: { x1: -1, y1: -25, x2: -7, y2: -13, x3: -11, y3: -6 }      // knee midpoint back, foot bent up high
};

// Sprinting - more forward lean, joints at midpoint, exaggerated motion
const sprintingPose1 = {
  head: { x: 8, y: -55, radius: 15 },
  torso: { x1: 5, y1: -40, x2: -3, y2: -25 },
  // Shoulders at (5, -38)
  // Left arm points OUT to left, then bends down
  leftArm: { x1: 5, y1: -38, x2: -8, y2: -28, x3: -8, y3: -13 },      // out left, elbow midpoint, hand down
  // Right arm forward (more extended)
  rightArm: { x1: 5, y1: -38, x2: 15, y2: -26, x3: 22, y3: -16 },     // forward, elbow midpoint
  // Hips at (-3, -25)
  // Left leg (forward): knee at midpoint, bigger stride
  leftLeg: { x1: -3, y1: -25, x2: 11, y2: -13, x3: 9, y3: 0 },        // knee midpoint forward, foot back
  // Right leg (back): LONGER, more pronounced upward bend
  rightLeg: { x1: -3, y1: -25, x2: -9, y2: -13, x3: -14, y3: -5 }     // knee midpoint back, foot bent up
};

const sprintingPose2 = {
  head: { x: 8, y: -55, radius: 15 },
  torso: { x1: 5, y1: -40, x2: -3, y2: -25 },
  // Shoulders at (5, -38)
  // Right arm points OUT to left, then bends down
  rightArm: { x1: 5, y1: -38, x2: -8, y2: -28, x3: -8, y3: -13 },     // out left, elbow midpoint, hand down
  // Left arm forward (more extended)
  leftArm: { x1: 5, y1: -38, x2: 15, y2: -26, x3: 22, y3: -16 },      // forward, elbow midpoint
  // Hips at (-3, -25)
  // Right leg (forward): knee at midpoint, bigger stride
  rightLeg: { x1: -3, y1: -25, x2: 11, y2: -13, x3: 9, y3: 0 },       // knee midpoint forward, foot back
  // Left leg (back): LONGER, more pronounced upward bend
  leftLeg: { x1: -3, y1: -25, x2: -9, y2: -13, x3: -14, y3: -5 }      // knee midpoint back, foot bent up
};

const crouchedPose = {
  head: { x: -5, y: -40, radius: 15 },
  torso: { x1: -5, y1: -25, x2: -12, y2: -12 },
  // Arms bent with elbows at midpoint
  leftArm: { x1: -5, y1: -23, x2: -16, y2: -15, x3: -22, y3: -8 },    // elbow midpoint
  rightArm: { x1: -5, y1: -23, x2: -12, y2: -12, x3: -14, y3: -2 },   // elbow midpoint
  // Legs bent with knees at midpoint
  leftLeg: { x1: -12, y1: -12, x2: -20, y2: -6, x3: -18, y3: 0 },     // knee midpoint
  rightLeg: { x1: -12, y1: -12, x2: -8, y2: -6, x3: -3, y3: 0 }       // knee midpoint
};

const drawPose = (ctx, x, y, pose) => {
  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#000000';
  ctx.lineWidth = 8;
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
  ctx.lineWidth = 7;
  drawLimb(pose.rightArm);
  drawLimb(pose.rightLeg);

  // Draw front limbs
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
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
