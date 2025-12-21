export class Platform {
  constructor(x, y, width, height, color = 'white') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(renderSystem) {
    renderSystem.drawRect(this.x, this.y, this.width, this.height, this.color);
  }
}
