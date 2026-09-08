import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  imports: [
    RouterLink,
    IonButton,
    IonContent
  ]
})
export class LandingPage implements OnInit {

  constructor() {}

  ngOnInit(): void {
  }

  ionViewWillEnter(): void {
  }
}