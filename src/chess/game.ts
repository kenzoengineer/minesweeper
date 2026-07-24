type coord = {
  x: number,
  y: number
};

export interface Piece {
  x: number;
  y: number;
  hunter: boolean;
  speed: number;
  moveTowards(tx: number, ty: number, width: number, height: number): void;
  moveRandomLegal(steps: number, width: number, height: number): void;
}

const ROOK_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRECTIONS = [[-1, -1], [1, 1], [1, -1], [-1, 1]];

// check every direction, starting randomly, and only accept if it moved
const stepRandom = (
  piece: Piece,
  directions: number[][],
  steps: number,
  width: number,
  height: number,
): void => {
  const start = Math.floor(Math.random() * directions.length);
  for (let k = 0; k < directions.length; k++) {
    const [dx, dy] = directions[(start + k) % directions.length];
    const nx = piece.x + dx * steps;
    const ny = piece.y + dy * steps;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      piece.x = nx;
      piece.y = ny;
      return;
    }
  }
};

export class Rook implements Piece {
  x;
  y;
  hunter;
  speed;
  constructor(x: number, y: number, hunter: boolean) {
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.hunter = hunter;
  }
  moveTowards(tx: number, ty: number, _width: number, _height: number): void {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if (dx > dy) {
      this.x = tx;
    } else {
      this.y = ty;
    }
  }

  moveRandomLegal(steps: number, width: number, height: number): void {
    stepRandom(this, ROOK_DIRECTIONS, steps, width, height);
  }
}

export class Knight implements Piece {
  x;
  y;
  speed;
  hunter;
  constructor(x: number, y: number, hunter: boolean) {
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.hunter = hunter;
  }
  moveTowards(tx: number, ty: number, width: number, height: number): void {
    const { x, y } = bfs(this.x, this.y, tx, ty, width, height);
    this.x = x;
    this.y = y;
  }

  // TODO
  moveRandomLegal(_steps: number, _width: number, _height: number): void {}
}

const MOVE_ARRAY = [
  [-1, -2],
  [-1, 2],
  [1, 2],
  [1, -2],
  [-2, -1],
  [-2, 1],
  [2, -1],
  [2, 1]
];

// the first step of a shortest knight path from (x, y) to (tx, ty), bounded to
// the [0, width) x [0, height) board. Returns the start square if already there
// or if the target is unreachable.
export const bfs = (
  x: number,
  y: number,
  tx: number,
  ty: number,
  width: number,
  height: number,
): coord => {
  if (x === tx && y === ty) {
    return { x, y };
  }

  const start = `${x}.${y}`;
  const queue = [[x, y]];
  const parent = new Map<string, string>();
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    for (const [dx, dy] of MOVE_ARRAY) {
      const nx = cx + dx;
      const ny = cy + dy;
      // stay on the board in every direction
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
        continue;
      }
      const nk = `${nx}.${ny}`;
      if (visited.has(nk)) {
        continue;
      }
      visited.add(nk);
      parent.set(nk, `${cx}.${cy}`);

      if (nx === tx && ny === ty) {
        // walk back from the target to the first step out of the start square
        let curr = nk;
        while (parent.get(curr) !== start) {
          curr = parent.get(curr)!;
        }
        const [rx, ry] = curr.split(".").map((n) => parseInt(n));
        return { x: rx, y: ry };
      }

      queue.push([nx, ny]);
    }
  }

  // unreachable
  return { x, y };
}

export class Bishop implements Piece {
  x;
  y;
  hunter;
  speed;
  constructor(x: number, y: number, hunter: boolean) {
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.hunter = hunter;
  }

  // TODO (non-trivial)
  moveTowards(_tx: number, _ty: number, _width: number, _height: number): void {}

  moveRandomLegal(steps: number, width: number, height: number): void {
    stepRandom(this, BISHOP_DIRECTIONS, steps, width, height);
  }

}
