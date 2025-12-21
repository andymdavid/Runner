import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

export const RenderSystem = {
  ctx: null,
  cameraX: 0,

  init(canvasContext) {
    this.ctx = canvasContext;
    this.cameraX = 0;
  },

  setCameraX(x) {
    this.cameraX = x;
  },

  clear() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - this.cameraX, y, width, height);
  },

  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x - this.cameraX, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
};
