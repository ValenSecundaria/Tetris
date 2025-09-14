import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface Highscore {
  name: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private _highscore$ = new BehaviorSubject<Highscore>({ name: '—', score: 0 });
  public highscore$ = this._highscore$.asObservable();

  constructor(private http: HttpClient) {
    this.refresh();
  }

  async refresh() {
    try {
      const hs = await firstValueFrom(this.http.get<Highscore>('/api/highscore'));
      this._highscore$.next(hs);
    } catch {
      // en dev si el server no inició aún
    }
  }

  async tryUpdate(name: string, score: number) {
    try {
      const hs = await firstValueFrom(
        this.http.post<Highscore>('/api/highscore', { name, score })
      );
      this._highscore$.next(hs);
      return hs;
    } catch {
      return this._highscore$.value;
    }
  }
}
