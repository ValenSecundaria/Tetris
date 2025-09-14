import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({ providedIn: 'root' })
export class AudioService {
private bg?: Howl;
private enabled = true;
private ensureInit() {
  if (this.bg) return;
  this.bg = new Howl({
    src: ['assets/audio/tetris-bg.mp3'], // coloca tu MP3 aquí
    loop: true,
    volume: 0.3,
    html5: true
  });
}

playBg() { if (!this.enabled) return; this.ensureInit(); this.bg!.play(); }
pauseBg() { this.bg?.pause(); }
toggle() { this.enabled = !this.enabled; this.enabled ? this.playBg() : this.pauseBg(); }
setVolume(v: number) { this.bg?.volume(v); }
isEnabled() { return this.enabled; }

}
