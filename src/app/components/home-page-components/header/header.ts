import { Component, HostListener, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isScrolled: WritableSignal<boolean> = signal(false)

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop

    this.isScrolled.set(scrollPosition > 50)
  }
}
