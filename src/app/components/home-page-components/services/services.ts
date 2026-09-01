import { Component, signal } from '@angular/core';

interface ServiceItem {
  numeral: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
  imageAlt: string;
}

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  readonly activeIndex = signal(0);

  readonly services: ServiceItem[] = [
    {
      numeral: 'I',
      title: 'Event Programming',
      subtitle: 'Creative direction',
      description:
        'From the first idea to the final applause, we shape distinctive event programs with a clear concept, seamless rhythm, and memorable guest experience.',
      features: [
        'Concept and creative theme development',
        'Complete event script and show direction',
        'Artist, speaker, and entertainment curation',
        'Full production planning and coordination',
      ],
      image: '/service-event-programming.png',
      imageAlt: 'A lively concert audience beneath warm stage lights',
    },
    {
      numeral: 'II',
      title: 'Fine Dining',
      subtitle: 'Culinary service',
      description:
        'We create refined dining experiences through thoughtful menus, impeccable presentation, and service that feels effortless from the first course to the last.',
      features: [
        'Bespoke menus designed with leading chefs',
        'Curated wine and beverage pairings',
        'Elegant tablescapes and presentation',
        'Professional service teams and coordination',
      ],
      image: '/service-fine-dining.png',
      imageAlt: 'A server presenting a refined dish at an elegant dinner',
    },
    {
      numeral: 'III',
      title: 'Premium Logistics',
      subtitle: 'Luxury transport',
      description:
        'Discreet, punctual transportation keeps every arrival effortless. We coordinate premium vehicles and experienced chauffeurs around your complete event schedule.',
      features: [
        'Luxury executive vehicles and private transfers',
        'Professional, multilingual chauffeurs',
        'Airport welcoming and guest coordination',
        'Real-time route and schedule management',
      ],
      image: '/service-premium-logistics.png',
      imageAlt: 'A professional chauffeur driving through the city at dusk',
    },
  ];

  selectService(index: number): void {
    this.activeIndex.set(index);
  }
}
