import { RenderSystem } from '../systems/RenderSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { InputSystem } from '../systems/InputSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { CeilingSystem } from '../systems/CeilingSystem';
import { TerrainSystem } from '../systems/TerrainSystem';
import { GameState } from './GameState';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, MAP_LENGTH } from '../../constants';
import { Player } from '../entities/Player';
import { Ceiling } from '../entities/Ceiling';
import { AnimationController } from '../animation/AnimationController';
import { LevelGenerator } from '../levels/LevelGenerator';

export class GameLoop {
  constructor(canvasContext) {
    this.canvasContext = canvasContext;
    this.lastTime = null;
    this.animationFrameId = null;
    this.isRunning = false;
    this.maxDelta = 100; // cap delta to avoid giant physics steps
    this.loopCallback = this.gameLoop.bind(this);

    // Initialize RenderSystem
    RenderSystem.init(this.canvasContext);

    // Create player instance
    this.player = new Player();

    const initialY = LevelGenerator.getTerrainY(0);
    TerrainSystem.init(initialY);
    this.nextChunkX = 0;
    this.terrainEndY = initialY;

    for (let i = 0; i < 3; i += 1) {
      this.generateNextChunk();
    }

    this.snapPlayerToTerrain();

    this.ceiling = new Ceiling();
    this.showCrushMessage = false;
    this.crushMessageTimer = 0;

    this.debugCameraX = 0;
    this.debugCameraPanSpeed = 10;

    InputSystem.init(() => GameState.toggleDebugMode());
  }

  start() {
    this.isRunning = true;
    this.lastTime = null; // force seeding on first frame
    this.animationFrameId = requestAnimationFrame(this.loopCallback);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = null;
    this.lastTime = null;
  }

  gameLoop(currentTime) {
    if (!this.isRunning) {
      return;
    }

    // Seed lastTime before processing the first frame after start/resume
    if (this.lastTime === null) {
      this.lastTime = currentTime;
      this.animationFrameId = requestAnimationFrame(this.loopCallback);
      return;
    }

    // Calculate deltaTime
    const deltaTimeRaw = currentTime - this.lastTime;
    const deltaTime = Math.min(deltaTimeRaw, this.maxDelta);

    // Update game state
    this.update(deltaTime);

    // Render game
    this.render();

    // Store current time for next frame
    this.lastTime = currentTime;

    // Continue loop if running
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.loopCallback);
    }
  }

  update(deltaTime) {
    if (GameState.isGameOver) {
      return;
    }

    if (GameState.debugMode) {
      // Debug mode: manual camera panning
      const panX = InputSystem.getCameraPan();
      this.debugCameraX += panX * this.debugCameraPanSpeed;
      this.debugCameraX = Math.max(0, Math.min(this.debugCameraX, MAP_LENGTH - CANVAS_WIDTH));
      RenderSystem.setCameraX(this.debugCameraX);

      // Still update terrain chunks for debug camera
      if (this.debugCameraX + CANVAS_WIDTH > this.nextChunkX) {
        this.generateNextChunk();
      }
    } else {
      // Normal gameplay mode
      const speedModifier = InputSystem.getSpeedModifier();
      this.player.velocity.x = this.player.baseSpeed * speedModifier;
      this.player.previousPosition = { ...this.player.position };
      AnimationController.update(this.player, deltaTime);

      // Update physics
      PhysicsSystem.update(this.player, deltaTime);

      CollisionSystem.resolveTerrainCollision(this.player);

      if (this.player.position.y > CANVAS_HEIGHT + 100) {
        GameState.loseLife();
        this.player.reset();
        this.snapPlayerToTerrain();
      }

      GameState.updateDistance(this.player.position.x);

      CeilingSystem.update(this.ceiling, deltaTime, TerrainSystem);

      if (this.player.position.x + CANVAS_WIDTH > this.nextChunkX) {
        this.generateNextChunk();
      }

      // Prune terrain well outside the visible area (2 screens behind camera)
      const prunePosition = RenderSystem.cameraX - CANVAS_WIDTH * 2;
      if (prunePosition > 0) {
        TerrainSystem.prune(prunePosition);
      }

      if (CollisionSystem.checkCeilingCollision(this.player)) {
        GameState.loseLife();
        this.player.reset();
        this.snapPlayerToTerrain();
        this.showCrushMessage = true;
        this.crushMessageTimer = 1000;
      }

      if (this.showCrushMessage) {
        this.crushMessageTimer -= deltaTime;
        if (this.crushMessageTimer <= 0) {
          this.showCrushMessage = false;
        }
      }

      const targetCameraX = this.player.position.x - CANVAS_WIDTH / 2;
      RenderSystem.setCameraX(targetCameraX);
    }
  }

  render() {
    // Clear canvas
    RenderSystem.clear();

    const ceilingColor = GameState.isGameOver ? '#000000' : '#000000';
    TerrainSystem.draw(RenderSystem, ceilingColor, '#000000', '#cfcfcf');

    // Draw start marker
    this.drawStartMarker();

    // Draw end flag
    this.drawEndFlag();

    if (!GameState.debugMode) {
      AnimationController.draw(RenderSystem.ctx, this.player, RenderSystem.cameraX);
    }

    RenderSystem.ctx.fillStyle = 'white';
    RenderSystem.ctx.font = '20px Arial';
    RenderSystem.ctx.fillText(`Lives: ${GameState.lives}`, 10, 30);
    RenderSystem.ctx.fillText(`Distance: ${GameState.distance}m`, 10, 60);

    // Debug mode overlay
    if (GameState.debugMode) {
      this.drawDebugOverlay();
    }

    if (GameState.isGameOver) {
      RenderSystem.ctx.fillStyle = 'red';
      RenderSystem.ctx.font = '48px Arial';
      RenderSystem.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT / 2);
    }

    if (this.showCrushMessage) {
      RenderSystem.ctx.fillStyle = 'red';
      RenderSystem.ctx.font = '36px Arial';
      RenderSystem.ctx.fillText('CRUSHED!', CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2);
    }
  }

  drawStartMarker() {
    const ctx = RenderSystem.ctx;
    const cameraX = RenderSystem.cameraX;
    const startX = 0 - cameraX;

    // Only draw if visible
    if (startX < -50 || startX > CANVAS_WIDTH + 50) {
      return;
    }

    // Draw a green vertical line
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, CANVAS_HEIGHT);
    ctx.stroke();

    // Draw "START" text
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('START', startX + 10, 100);
  }

  drawEndFlag() {
    const ctx = RenderSystem.ctx;
    const cameraX = RenderSystem.cameraX;
    const endX = MAP_LENGTH - cameraX;

    // Only draw if visible
    if (endX < -100 || endX > CANVAS_WIDTH + 100) {
      return;
    }

    const groundY = TerrainSystem.getSurfaceY(MAP_LENGTH);
    const flagY = groundY !== Infinity ? groundY : GROUND_Y;

    // Draw flag pole
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(endX, flagY);
    ctx.lineTo(endX, flagY - 120);
    ctx.stroke();

    // Draw checkered flag
    const flagWidth = 60;
    const flagHeight = 40;
    const checkSize = 10;
    const flagLeft = endX;
    const flagTop = flagY - 120;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? '#FFFFFF' : '#000000';
        ctx.fillRect(
          flagLeft + col * checkSize,
          flagTop + row * checkSize,
          checkSize,
          checkSize
        );
      }
    }

    // Draw "FINISH" text
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('FINISH', endX - 60, flagY - 140);
  }

  drawDebugOverlay() {
    const ctx = RenderSystem.ctx;

    // Debug mode indicator
    ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('DEBUG MODE', 10, 90);

    // Camera position
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Camera X: ${Math.floor(this.debugCameraX)}`, 10, 120);
    ctx.fillText(`Map Length: ${MAP_LENGTH}`, 10, 140);
    ctx.fillText('Controls: A/D to pan camera', 10, 160);
    ctx.fillText('Shift+D to toggle debug mode', 10, 180);
  }

  generateNextChunk() {
    const difficulty = LevelGenerator.getDifficulty(this.nextChunkX);
    const chunk = LevelGenerator.generateChunk(this.nextChunkX, this.terrainEndY, difficulty);
    TerrainSystem.addChunk(chunk);
    this.nextChunkX = chunk.endX;
    this.terrainEndY = chunk.endPoint.y;
  }

  snapPlayerToTerrain() {
    const surfaceY = Math.round(TerrainSystem.getSurfaceY(this.player.position.x));
    if (surfaceY !== Infinity) {
      this.player.position.y = surfaceY;
      this.player.velocity.y = 0;
    }
  }
}
