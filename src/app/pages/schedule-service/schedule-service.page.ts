import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-schedule-service',
  templateUrl: './schedule-service.page.html',
  styleUrls: ['./schedule-service.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ScheduleServicePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
