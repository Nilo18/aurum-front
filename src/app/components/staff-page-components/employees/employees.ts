import { Component } from '@angular/core';
import { StaffWorkspace } from '../workspace/workspace';
@Component({
  selector: 'app-employees',
  imports: [StaffWorkspace],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {}
