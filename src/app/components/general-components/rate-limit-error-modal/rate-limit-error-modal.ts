import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-rate-limit-error-modal',
  imports: [],
  templateUrl: './rate-limit-error-modal.html',
  styleUrl: './rate-limit-error-modal.scss',
})
export class RateLimitErrorModal implements OnInit, OnDestroy {
  readonly modal = inject(NgbActiveModal);
  private readonly remaining = signal(60);
  private timer?: ReturnType<typeof setInterval>;
  private deadline = 0;

  get secondsLeft(): number {
    return this.remaining();
  }

  set secondsLeft(value: number) {
    const seconds = Number.isFinite(value) && value > 0 ? Math.ceil(value) : 60;
    this.remaining.set(seconds);
    this.deadline = Date.now() + seconds * 1000;
  }

  ngOnInit(): void {
    if (!this.deadline) {
      this.secondsLeft = this.secondsLeft;
    }
    this.timer = setInterval(() => {
      this.remaining.set(Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000)));
      if (this.secondsLeft === 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
