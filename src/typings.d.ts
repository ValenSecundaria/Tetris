// Minimal typings for 'howler' to satisfy TS7016 during dev
declare module 'howler' {
  export class Howl {
    constructor(options: any);
    play(id?: number | string): number;
    pause(id?: number | string): void;
    stop(id?: number | string): void;
    volume(vol?: number): number;
    loop(loop?: boolean): boolean;
  }
  export const Howler: any;
}

