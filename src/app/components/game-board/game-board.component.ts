import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COLORS_CLASSIC, COLORS_NEON, COLS, ROWS } from '../../models/tetromino';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl p-4" [class]="theme === 'classic' ? 'bg-slate-800' : 'bg-zinc-900'">
      <div class="relative" [style.width.px]="COLS * 24" [style.height.px]="ROWS * 24">
        <div
          class="grid"
          [style.gridTemplateColumns]="'repeat(' + COLS + ', 1fr)'"
          [style.gridTemplateRows]="'repeat(' + ROWS + ', 1fr)'"
        >
          <ng-container *ngFor="let row of board; let y = index">
            <ng-container *ngFor="let cell of row; let x = index">
              <div class="w-6 h-6 border border-black/20" [class]="cellClass(cell)"></div>
            </ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class GameBoardComponent {
  @Input() board: number[][] = [];
  @Input() theme: 'classic' | 'neon' = 'classic';

  COLS = COLS;
  ROWS = ROWS;

  cellClass(v: number) {
    const map = this.theme === 'classic' ? COLORS_CLASSIC : COLORS_NEON;
    return map[v] || 'bg-transparent';
  }
}
