import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-demo-loading-card',
  imports: [],
  templateUrl: './demo-loading-card.html',
  styleUrl: './demo-loading-card.scss',
})
export class DemoLoadingCard {
  readonly isLoading = input.required<boolean>();
  readonly errorMessage = input.required<string>();
  readonly loadingMessage = input.required<string>();
  readonly retry = output<void>();
}
