import { TestBed } from '@angular/core/testing';
import { Header } from './header';
describe('Header', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it('observes sections, selects visible navigation and disconnects on destruction', () => {
    let callback!: IntersectionObserverCallback;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const section = document.createElement('section');
    section.id = 'services';
    document.body.append(section);
    try {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      expect(observe).toHaveBeenCalledWith(section);
      const entry = { isIntersecting: true, target: { id: 'team' } } as IntersectionObserverEntry;
      callback([entry], {} as IntersectionObserver);
      expect(fixture.componentInstance.activeSection()).toBe('team');
      callback([], {} as IntersectionObserver);
      expect(fixture.componentInstance.activeSection()).toBe('team');
      fixture.destroy();
      expect(disconnect).toHaveBeenCalledOnce();
    } finally {
      section.remove();
    }
  });
  it('updates the scrolled state at the threshold', () => {
    const component = TestBed.createComponent(Header).componentInstance;
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(51);
    component.onWindowScroll();
    expect(component.isScrolled()).toBe(true);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(50);
    component.onWindowScroll();
    expect(component.isScrolled()).toBe(false);
  });
});
