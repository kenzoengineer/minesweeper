import { Bishop, Knight, Piece, Rook } from "./game";

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

    this.hunters = [new Knight(0, 0, true), new Rook(5, 5, true)];
    this.victims = [new Bishop(5, 5, false),new Bishop(5, 5, false)];
  }

  step(): Piece[] {
    this.tick++;
    for (let i = 0; i < this.hunters.length; i++) {
      const hunter = this.hunters[i];
      const victim = this.victims[i];
      if (this.tick % hunter.speed != 0) {
        continue;
      }
      hunter.moveTowards(victim.x, victim.y, this.width, this.height);

      // caught! respawn the victim somewhere else on the board
      if (hunter.x == victim.x && hunter.y == victim.y) {
        victim.moveRandomLegal(5, this.width, this.height);
      }
    }
    return [...this.hunters, ...this.victims];
  }
}
