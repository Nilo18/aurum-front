import { Component, signal } from '@angular/core';

interface ProcessStep {
  number: string;
  role: string;
  title: string;
  lead: string;
  description: string;
}

@Component({
  selector: 'app-process',
  imports: [],
  templateUrl: './process.html',
  styleUrl: './process.scss',
})
export class Process {
  readonly activeIndex = signal(0);

  readonly steps: ProcessStep[] = [
    {
      number: '01',
      role: 'Client manager',
      title: 'Your dedicated manager',
      lead: 'Personal contact and consultation',
      description:
        'Your journey begins with a dedicated manager who remains your direct point of contact around the clock, carefully translating every idea and priority into a clear event brief.',
    },
    {
      number: '02',
      role: 'Sales manager',
      title: 'A tailored proposal',
      lead: 'Individual planning and budgeting',
      description:
        'We shape the scope, resources, and commercial plan around your event. Every recommendation is transparent, considered, and aligned with the experience you want to create.',
    },
    {
      number: '03',
      role: 'Event producer',
      title: 'Creative production',
      lead: 'Concept development and coordination',
      description:
        'The producer brings every element together—from creative direction and staging to timing and suppliers—turning the approved concept into one coherent production plan.',
    },
    {
      number: '04',
      role: 'Execution teams',
      title: 'Crew, chefs, and chauffeurs',
      lead: 'Flawless event delivery',
      description:
        'Every team works from one carefully coordinated schedule. Production, hospitality, service, and transport move together so the entire experience feels effortless.',
    },
    {
      number: '05',
      role: 'Quality control',
      title: 'The final quality check',
      lead: 'Precision in every detail',
      description:
        'Before guests arrive, every touchpoint is reviewed against our standards. A final on-site inspection ensures the setting, service, timing, and atmosphere are exactly right.',
    },
  ];

  selectStep(index: number): void {
    this.activeIndex.set(index);
  }
}
