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

    this.hunters = [
      new Knight(0, 1, true),
      new Knight(5, 1, true),
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
      hunter.moveTowards(victim.x, victim.y, this.width, this.height);

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
      }

      // only one piece per square; if the hunter is sharing one, it doesn't move this turn
      if (pieces.some((p) => p !== hunter && p.x === hunter.x && p.y === hunter.y)) {
        hunter.x = hx;
        hunter.y = hy;
      }
    }
    return pieces;
  }
}
