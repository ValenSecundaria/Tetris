import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Cell, GameState, Piece } from '../models/types';
import { TETROMINOES, COLS, ROWS, LINES_PER_LEVEL } from '../models/tetromino';

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

@Injectable({ providedIn: 'root' })
export class GameService {
  private board: Cell[][] = [];
  private current!: Piece;
  private bag: (keyof typeof TETROMINOES)[] = [];
  private dropMs = 1000;
  private loopSub?: Subscription;
  private paused = false;

  private state$ = new BehaviorSubject<GameState>({
    board: [], score: 0, level: 0, lines: 0,
    running: false, gameOver: false, playerName: ''
  });

  public readonly snapshot$ = this.state$.asObservable();

  constructor() {
    this.resetBoard();
  }

  start(name: string) {
    this.resetBoard();
    this.state$.next({
      ...this.state$.value,
      score: 0, level: 0, lines: 0,
      running: true, gameOver: false, playerName: name
    });
    this.dropMs = 1000;
    this.paused = false;
    this.spawn();
    this.startLoop();
  }

  stop() {
    this.loopSub?.unsubscribe();
    this.state$.next({ ...this.state$.value, running: false, gameOver: true });
  }

  togglePause() {
    if (!this.state$.value.running) return;
    this.paused = !this.paused;
  }

  move(dx: number) {
    if (!this.state$.value.running || this.paused) return;
    const next = { ...this.current, x: this.current.x + dx };
    if (this.valid(next)) this.current = next;
    this.emitBoard();
  }

  softDrop() {
    if (!this.state$.value.running || this.paused) return;
    const moved = this.tryStep();
    if (moved) this.addScore(1);
  }

  hardDrop() {
    if (!this.state$.value.running || this.paused) return;
    let dist = 0;
    while (this.tryStep()) dist++;
    this.addScore(dist * 2);
  }

  rotate() {
    if (!this.state$.value.running || this.paused) return;
    const next = deepClone(this.current);
    next.rotationIndex = (next.rotationIndex + 1) % TETROMINOES[this.keyOf(next.id)].length;
    next.matrix = TETROMINOES[this.keyOf(next.id)][next.rotationIndex].map(r => [...r]);

    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      const shifted = { ...next, x: next.x + k };
      if (this.valid(shifted)) {
        this.current = shifted;
        this.emitBoard();
        return;
      }
    }
  }

  // ==== Internos ====

  private keyOf(id: number): keyof typeof TETROMINOES {
    return ['','I','O','T','S','Z','J','L'][id] as keyof typeof TETROMINOES;
  }

  private resetBoard() {
    this.board = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 0 as Cell));
    this.emitBoard();
  }

  private nextFromBag(): keyof typeof TETROMINOES {
    if (this.bag.length === 0) {
      this.bag = ['I','O','T','S','Z','J','L'];
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop()!;
  }

  private spawn() {
    const key = this.nextFromBag();
    const mats = TETROMINOES[key];
    const matrix = mats[0].map(r => [...r]);
    const id = matrix.flat().find(v => v>0) as Cell;
    const w = matrix[0].length;
    this.current = {
      id,
      matrix,
      x: Math.floor((COLS - w) / 2),
      y: 0,
      rotationIndex: 0
    };
    if (!this.valid(this.current)) {
      this.stop();
    } else {
      this.emitBoard();
    }
  }

  private startLoop() {
    this.loopSub?.unsubscribe();
    this.loopSub = interval(this.dropMs).subscribe(() => {
      if (!this.paused) this.tryStep();
    });
  }

  private tryStep(): boolean {
    const next = { ...this.current, y: this.current.y + 1 };
    if (this.valid(next)) {
      this.current = next;
      this.emitBoard();
      return true;
    }
    this.merge();
    const cleared = this.clearLines();
    if (cleared > 0) this.handleScoring(cleared);
    this.spawn();
    return false;
  }

  private valid(p: Piece): boolean {
    const m = p.matrix, h = m.length, w = m[0].length;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!m[y][x]) continue;
        const nx = p.x + x, ny = p.y + y;
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
        if (this.board[ny][nx]) return false;
      }
    }
    return true;
  }

  private merge() {
    const m = this.current.matrix, h = m.length, w = m[0].length;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!m[y][x]) continue;
        const nx = this.current.x + x, ny = this.current.y + y;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
          this.board[ny][nx] = this.current.id;
        }
      }
    }
    this.emitBoard();
  }

  private clearLines(): number {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.board[y].every(v => v !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array.from({ length: COLS }, () => 0 as Cell));
        cleared++;
        y++;
      }
    }
    return cleared;
  }

  private handleScoring(lines: number) {
    const points = [0, 100, 300, 500, 800][lines] || 0;
    this.addScore(points);
    const s = this.state$.value;
    const totalLines = s.lines + lines;
    const newLevel = Math.floor(totalLines / LINES_PER_LEVEL);
    if (newLevel > s.level) {
      this.dropMs = Math.max(100, 1000 - newLevel * 100);
      this.startLoop();
    }
    this.state$.next({ ...s, lines: totalLines, level: newLevel });
  }

  private addScore(delta: number) {
    const s = this.state$.value;
    this.state$.next({ ...s, score: s.score + delta });
  }

  private emitBoard() {
    const view = this.render();
    const s = this.state$.value;
    this.state$.next({ ...s, board: view });
  }

  private render(): Cell[][] {
    const view = this.board.map(row => row.slice());
    if (this.current) {
      const m = this.current.matrix, h = m.length, w = m[0].length;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!m[y][x]) continue;
          const nx = this.current.x + x, ny = this.current.y + y;
          if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
            view[ny][nx] = this.current.id;
          }
        }
      }
    }
    return view;
  }
}
