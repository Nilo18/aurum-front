import { Component, HostListener, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private observer?: IntersectionObserver
  isScrolled: WritableSignal<boolean> = signal(false)
  readonly activeSection = signal('services')

  private readonly sectionIds = [
    'services',
    'about',
    'events',
    'process',
    'team',
    'contact'
  ]

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(entries => {
      const visibleIntersection = entries.find(entry => entry.isIntersecting)

      if (visibleIntersection) {
        this.activeSection.set(visibleIntersection.target.id)
      }
    }, {
      rootMargin: '-72px 0px -65% 0px',
      threshold: 0,
    })

    this.sectionIds.forEach(id => {
      const section = document.getElementById(id)

      if (section) {
        this.observer?.observe(section)
      }
    })
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop

    this.isScrolled.set(scrollPosition > 50)
  }
}
