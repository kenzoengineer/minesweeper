import { Knight, Piece, Rook } from "./game";

export class Chaser {
  hunters: Piece[];
  victims: Piece[];

  private width: number;
  private height: number;
  private tick: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.tick = 0;

    this.hunters = [new Knight(0, 0, true), new Rook(5,5, true)];
    this.victims = [new Rook(width - 1, height - 1, false), new Rook(2, 2, false)];
  }

  step(): Piece[] {
    this.tick++;
    for (let i = 0; i < this.hunters.length; i++) {
      const hunter = this.hunters[i];
      const victim = this.victims[i];
      if (this.tick % hunter.speed != 0) {
        continue;
      }
      const { x, y } = hunter.moveTowards(
        hunter.x,
        hunter.y,
        victim.x,
        victim.y,
        this.width,
        this.height,
      );
      hunter.x = x;
      hunter.y = y;

      // caught! respawn the victim somewhere else on the board
      if (hunter.x == victim.x && hunter.y == victim.y) {
        do {
          victim.x = Math.floor(Math.random() * this.width);
          victim.y = Math.floor(Math.random() * this.height);
        } while (victim.x === hunter.x && victim.y === hunter.y);
      }
    }
    return [...this.hunters, ...this.victims];
  }
}
