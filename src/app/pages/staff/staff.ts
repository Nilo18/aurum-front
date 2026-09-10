import { Component } from '@angular/core';
import { Sidebar } from '../../components/staff-page-components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-staff',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './staff.html',
  styleUrl: './staff.scss',
})
export class Staff {

}
