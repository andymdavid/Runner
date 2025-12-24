export class Player {
  constructor() {
    this.position = { x: 100, y: 400 };
    this.velocity = { x: 0, y: 0 };
    this.baseSpeed = 10;
    this.width = 20;
    this.height = 28;
    this.previousPosition = { ...this.position };
  }

  reset() {
    this.position = { x: 100, y: 400 };
    this.previousPosition = { ...this.position };
    this.velocity = { x: 0, y: 0 };
  }
}
