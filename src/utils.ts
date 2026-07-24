export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
