import { Component, OnInit } from '@angular/core';
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
  logOutOutline
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
export class SidebarComponent implements OnInit {

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
      logOutOutline
    });
  }

  ngOnInit(): void {
  }

}