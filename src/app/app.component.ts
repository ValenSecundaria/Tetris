import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 necesario para [(ngModel)]
import { GameBoardComponent } from './components/game-board/game-board.component';
import { GameService } from './services/game.service';
import { ScoreService } from './services/score.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, GameBoardComponent], // 👈 FormsModule agregado
  template: `
  <div [class]="theme() === 'classic' ? 'min-h-screen bg-slate-900 text-white' : 'min-h-screen bg-black text-white'">
    <div class="max-w-5xl mx-auto p-4 flex flex-col gap-4">
      <header class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <h1 class="text-3xl font-bold tracking-tight">Tetris Angular</h1>
        <div class="flex items-center gap-2">
          <label class="text-sm opacity-80">Tema:</label>
          <button (click)="toggleTheme()" class="px-3 py-1 rounded-xl border border-white/20">
            {{ theme() === 'classic' ? 'Classic' : 'Neon' }}
          </button>
        </div>
      </header>

      <section class="grid md:grid-cols-[1fr_auto] gap-6">
        <div class="flex flex-col items-center gap-3">
          <game-board [board]="board()" [theme]="theme()"></game-board>
          <div class="flex items-center gap-2">
            <input [(ngModel)]="playerName" placeholder="Tu nombre" class="px-3 py-2 rounded-lg text-black" />
            <button (click)="onPlay()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500">Play</button>
          </div>
          <p class="text-sm opacity-80">Récord:
            <strong>{{ highscore()?.score || 0 }}</strong> por
            <em>{{ highscore()?.name || '—' }}</em>
          </p>
        </div>

        <aside class="flex flex-col gap-3 min-w-[260px]">
          <div class="p-4 rounded-2xl border border-white/10">
            <h2 class="font-semibold mb-2">Estado</h2>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <span>Puntaje</span><span class="text-right">{{ score() }}</span>
              <span>Nivel</span><span class="text-right">{{ level() }}</span>
              <span>Líneas</span><span class="text-right">{{ lines() }}</span>
            </div>
          </div>
          <div class="p-4 rounded-2xl border border-white/10 text-sm">
            <h2 class="font-semibold mb-2">Controles</h2>
            <ul class="list-disc list-inside space-y-1 opacity-90">
              <li>←/→ mover</li>
              <li>↓ bajar suave</li>
              <li>↑ rotar</li>
              <li>Espacio caída rápida</li>
              <li>P pausar</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  </div>
  `,
  styles: [``]
})
export class AppComponent {
  playerName = '';
  theme = signal<'classic'|'neon'>('classic');

  board = signal<number[][]>([]);
  score = signal(0);
  level = signal(0);
  lines = signal(0);
  highscore = signal<{name:string;score:number}|null>(null);

  constructor(private game: GameService, private scores: ScoreService) {
    this.game.snapshot$.subscribe(s => {
      this.board.set(s.board);
      this.score.set(s.score);
      this.level.set(s.level);
      this.lines.set(s.lines);
      if (s.gameOver) {
        this.onGameOver(s.playerName, s.score);
      }
    });

    this.scores.highscore$.subscribe(h => this.highscore.set(h));
  }

  toggleTheme() {
    this.theme.set(this.theme() === 'classic' ? 'neon' : 'classic');
  }

  onPlay() {
    const name = this.playerName?.trim() || 'Jugador';
    this.game.start(name);
  }

  async onGameOver(name: string, score: number) {
    await this.scores.tryUpdate(name, score);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowLeft': this.game.move(-1); break;
      case 'ArrowRight': this.game.move(1); break;
      case 'ArrowDown': this.game.softDrop(); break;
      case 'ArrowUp': this.game.rotate(); break;
      case ' ': this.game.hardDrop(); e.preventDefault(); break;
      case 'p': case 'P': this.game.togglePause(); break;
    }
  }
}
