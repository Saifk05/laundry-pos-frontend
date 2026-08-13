import { Component } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  homeOutline,
  walkOutline,
  bicycleOutline,
  cartOutline,
  cartSharp,
  personAddOutline,
  walletOutline,
  checkmarkDoneOutline,
  receiptOutline,
  cardOutline,
  cubeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonIcon
  ]
})
export class SidebarComponent {

  constructor() {

    addIcons({
      homeOutline,
      walkOutline,
      bicycleOutline,
      cartOutline,
      cartSharp,
      personAddOutline,
      walletOutline,
      checkmarkDoneOutline,
      receiptOutline,
      cardOutline,
      cubeOutline
    });
  }
}