import { Component, signal } from '@angular/core';

interface TeamRole {
  number: string;
  role: string;
  title: string;
  description: string;
  details: string[];
}

@Component({
  selector: 'app-team',
  imports: [],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class Team {
  readonly activeIndex = signal<number | null>(null);

  readonly roles: TeamRole[] = [
    {
      number: '01',
      role: 'Client manager',
      title: 'Dedicated client manager',
      description:
        'Your direct partner from first conversation to final delivery, ensuring every request is understood and acted on.',
      details: ['Languages: EN, GE, RU', '15+ years of experience', 'Available around the clock'],
    },
    {
      number: '02',
      role: 'Event producer',
      title: 'Event production lead',
      description:
        'Responsible for the full production plan, connecting creative direction, timing, partners, and on-site execution.',
      details: ['Creative production', 'Supplier coordination', 'On-site direction'],
    },
    {
      number: '03',
      role: 'Art group',
      title: 'Creative and art team',
      description:
        'Designers and creative specialists turn the event concept into a distinctive visual world with atmosphere and character.',
      details: ['Visual concepts', 'Scenography and styling', 'Floral and decorative design'],
    },
    {
      number: '04',
      role: 'Head chef',
      title: 'Culinary director',
      description:
        'Our culinary lead develops an individual menu and ensures every plate meets the event’s standard of taste and presentation.',
      details: ['Menu development', 'Service coordination', 'Quality and presentation'],
    },
    {
      number: '05',
      role: 'Purchasing manager',
      title: 'Procurement manager',
      description:
        'Every product and material is sourced through trusted partners, with careful attention to quality, timing, and consistency.',
      details: ['Trusted suppliers', 'Quality assurance', 'Delivery coordination'],
    },
    {
      number: '06',
      role: 'Sales manager',
      title: 'Commercial planning manager',
      description:
        'Creates a clear, transparent proposal and keeps the commercial plan aligned with the event’s scope and priorities.',
      details: ['Clear proposals', 'Budget coordination', 'Flexible planning'],
    },
  ];

  toggleRole(index: number): void {
    this.activeIndex.update((active) => (active === index ? null : index));
  }
}
