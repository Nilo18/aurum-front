import { Component } from '@angular/core';
import { StaffWorkspace } from '../workspace/workspace';
@Component({
  selector: 'app-products',
  imports: [StaffWorkspace],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {}
