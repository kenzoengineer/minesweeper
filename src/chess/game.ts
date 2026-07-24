type coord = {
  x: number,
  y: number
};

export interface Piece {
  x: number,
  y: number,
  hunter: boolean,
  moveTowards(x: number, y: number, tx: number, ty: number): coord;
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
  moveTowards(x: number, y: number, tx: number, ty: number): coord {
    return bfs(x, y, tx, ty);
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
// knight move
export const bfs = (x: number, y: number, tx: number, ty: number): coord => {
  const queue = [[x, y]];
  const parent = new Map();
  const visited = new Set();
  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    visited.add(`${x}.${y}`);
    if (x === tx && y === ty) {
      const path: string[] = [];
      let curr = `${x}.${y}`;
      while(true) {
        const p = parent.get(curr);
        if (p == undefined || p == null) {
          break;
        }
        path.push(p);
        curr = p;
      }
      if (path.length == 1) {
        return { x: tx, y: ty };
      }
      const [rX, rY] = path[path.length - 2].split(".").map((x) => parseInt(x));
      return { x: rX, y: rY };
    }
    for (const [dx, dy] of MOVE_ARRAY) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX < 0 || newY < 0) {
        continue;
      }
      if (visited.has(`${newX}.${newY}`)) {
        continue;
      }
      parent.set(`${newX}.${newY}`, `${x}.${y}`);
      queue.push([newX, newY]);
    }
  }
  return {x: 0, y: 0}
}
