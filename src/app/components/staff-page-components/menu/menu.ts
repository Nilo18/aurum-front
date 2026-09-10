import { Component } from '@angular/core';
import { StaffWorkspace } from '../workspace/workspace';
@Component({
  selector: 'app-menu',
  imports: [StaffWorkspace],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {}
