import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
  imports: [
    RouterOutlet,
    SidebarComponent
  ]
})
export class AppLayoutComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
  }
}