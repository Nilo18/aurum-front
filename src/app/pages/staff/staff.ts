import { Component } from '@angular/core';
import { Sidebar } from '../../components/staff-page-components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  host: { class: 'staff-page' },
  selector: 'app-staff',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './staff.html',
  styleUrl: './staff.scss',
})
export class Staff {}
