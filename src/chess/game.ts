type coord = {
  x: number,
  y: number
};

export interface Piece {
  x: number,
  y: number,
  hunter: boolean,
  moveTowards(x: number, y: number, tx: number, ty: number, width: number, height: number): coord;
}

export class Rook implements Piece {
  x;
  y;
  hunter;
  constructor(x: number, y: number, hunter: boolean) {
    this.x = x;
    this.y = y;
    this.hunter = hunter;
  }
  moveTowards(x: number, y: number, tx: number, ty: number): coord {
    const dx = Math.abs(tx - x);
    const dy = Math.abs(ty - y);
    if (dx > dy) {
      return { x: tx, y };
    }
    return { x, y: ty };
  }
}

export class Knight implements Piece {
  x;
  y;
  hunter;
  constructor(x: number, y: number, hunter: boolean) {
    this.x = x;
    this.y = y;
    this.hunter = hunter;
  }
  moveTowards(x: number, y: number, tx: number, ty: number, width: number, height: number): coord {
    return bfs(x, y, tx, ty, width, height);
  }
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
  // mark on enqueue (not dequeue) so each square is queued exactly once and its
  // parent pointer is never overwritten — otherwise the path isn't shortest
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

  // unreachable — stay put
  return { x, y };
}
