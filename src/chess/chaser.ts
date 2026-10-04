import { Bishop, King, Knight, Piece, Rook } from "./game";

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

    this.hunters = [
      new Knight(0, 1, true),
      new King(5, 1, true),
      new Rook(10, 1, true),
    ];
    this.victims = [
      new Bishop(3, 3, false),
      new Bishop(10, 2, false),
      new Bishop(15, 3, false),
    ];
  }

  step(): Piece[] {
    this.tick++;
    const pieces = [...this.hunters, ...this.victims];

    for (let i = 0; i < this.hunters.length; i++) {
      const hunter = this.hunters[i];
      const victim = this.victims[i];
      if (this.tick % hunter.speed != 0) {
        continue;
      }
      const [hx, hy] = [hunter.x, hunter.y];
      hunter.moveTowards(victim, pieces, [victim], this.width, this.height);

      // caught! respawn the victim on a free square, shortening the hop if boxed in
      if (hunter.x == victim.x && hunter.y == victim.y) {
        for (let steps = 3; steps > 0; steps--) {
          victim.moveRandomLegal(steps, this.width, this.height);
          if (!pieces.some((p) => p !== victim && p.x === victim.x && p.y === victim.y)) {
            break;
          }
          victim.x = hunter.x;
          victim.y = hunter.y;
        }
        // nowhere for the victim to go, so the capture doesn't happen this turn
        if (hunter.x == victim.x && hunter.y == victim.y) {
          hunter.x = hx;
          hunter.y = hy;
        }
      }
    }
    return pieces;
  }
}
