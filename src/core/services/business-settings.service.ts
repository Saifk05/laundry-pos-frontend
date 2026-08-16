import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  tap
} from 'rxjs';

import {
  ApiService
} from './api.service';

import {
  BusinessSettings,
  BusinessSettingsRequest
} from '../models/business-settings.model';


@Injectable({
  providedIn: 'root'
})
export class BusinessSettingsService {

  private readonly settingsSubject =
    new BehaviorSubject<BusinessSettings | null>(
      null
    );


  readonly settings$ =
    this.settingsSubject.asObservable();


  constructor(
    private readonly apiService:
      ApiService
  ) {}


  loadSettings(): void {

    this.apiService
      .getBusinessSettings()
      .subscribe({

        next: (
          response:
            BusinessSettings
        ) => {

          this.settingsSubject.next(
            response
          );
        },

        error: (
          error:
            any
        ) => {

          console.error(
            'Unable to load business settings',
            error
          );
        }

      });
  }


  getSettings():
    Observable<BusinessSettings> {

    return this.apiService
      .getBusinessSettings()
      .pipe(

        tap(
          (
            response:
              BusinessSettings
          ) => {

            this.settingsSubject.next(
              response
            );
          }
        )

      );
  }


  updateSettings(
    request:
      BusinessSettingsRequest
  ): Observable<BusinessSettings> {

    return this.apiService
      .updateBusinessSettings(
        request
      )
      .pipe(

        tap(
          (
            response:
              BusinessSettings
          ) => {

            this.settingsSubject.next(
              response
            );
          }
        )

      );
  }
}