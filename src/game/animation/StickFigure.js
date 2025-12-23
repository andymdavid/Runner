// Sprite-based animation system using pre-rendered stick figure frames

class StickFigureSpriteSystem {
  constructor() {
    this.frames = [];
    this.processedFrames = [];
    this.loaded = false;
    this.loadSprites();
  }

  loadSprites() {
    const frameCount = 9;
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.onload = () => {
        // Process the frame to remove white background
        this.processedFrames[i] = this.removeWhiteBackground(img);
        loadedCount++;
        if (loadedCount === frameCount) {
          this.loaded = true;
        }
      };
      img.onerror = () => {
        console.error(`Failed to load sprite frame: tmp-${i}.gif`);
      };
      img.src = `/stick-figure/tmp-${i}.gif`;
      this.frames.push(img);
    }
  }

  removeWhiteBackground(img) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the original sprite
    tempCtx.drawImage(img, 0, 0);

    // Get image data and remove white pixels
    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // If pixel is white or very close to white, make it transparent
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }

    // Put the modified image data back
    tempCtx.putImageData(imageData, 0, 0);

    return tempCanvas;
  }

  getFrame(animationFrame) {
    // Map animationFrame (0-1) to frame index (0-8)
    const frameIndex = Math.floor(animationFrame * this.processedFrames.length) % this.processedFrames.length;
    return this.processedFrames[frameIndex];
  }

  drawSprite(ctx, x, y, frame, scale = 1) {
    if (!this.loaded || this.processedFrames.length === 0) {
      // Fallback: draw a simple circle if sprites aren't loaded yet
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x, y - 40, 15, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const sprite = this.getFrame(frame);
    if (!sprite) return;

    // Calculate sprite dimensions
    const spriteWidth = sprite.width * scale;
    const spriteHeight = sprite.height * scale;

    // Draw the transparent sprite centered at x, with feet at y
    ctx.drawImage(
      sprite,
      x - spriteWidth / 2,
      y - spriteHeight,
      spriteWidth,
      spriteHeight
    );
  }
}

// Create singleton instance
const spriteSystem = new StickFigureSpriteSystem();

export const StickFigure = {
  drawRunning(ctx, x, y, frame) {
    spriteSystem.drawSprite(ctx, x, y, frame, 0.15);
  },

  drawSprinting(ctx, x, y, frame) {
    // Use same sprites but potentially at different scale or speed
    spriteSystem.drawSprite(ctx, x, y, frame, 0.15);
  },

  drawCrouched(ctx, x, y) {
    // For crouched, we could use a specific frame or reduce scale
    // Using frame 4 (mid-cycle) as a static crouch pose for now
    spriteSystem.drawSprite(ctx, x, y, 0.5, 0.12);
  },
};
