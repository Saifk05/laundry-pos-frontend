import { Injectable } from '@angular/core';
import {
  ToastController
} from '@ionic/angular';

type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private readonly toastController: ToastController
  ) {}


  async success(
    message: string,
    actionText?: string,
    actionHandler?: () => void
  ): Promise<void> {

    await this.showToast(
      'success',
      message,
      actionText,
      actionHandler
    );
  }


  async error(
    message: string,
    actionText?: string,
    actionHandler?: () => void
  ): Promise<void> {

    await this.showToast(
      'error',
      message,
      actionText,
      actionHandler
    );
  }


  async warning(
    message: string,
    actionText?: string,
    actionHandler?: () => void
  ): Promise<void> {

    await this.showToast(
      'warning',
      message,
      actionText,
      actionHandler
    );
  }


  async info(
    message: string,
    actionText?: string,
    actionHandler?: () => void
  ): Promise<void> {

    await this.showToast(
      'info',
      message,
      actionText,
      actionHandler
    );
  }


  private async showToast(
    type: NotificationType,
    message: string,
    actionText?: string,
    actionHandler?: () => void
  ): Promise<void> {

    const toast =
      await this.toastController.create({

        message,

        duration:
          actionText
            ? 5000
            : 3500,

        position: 'top',

        cssClass: [
          'app-notification-toast',
          `app-notification-${type}`
        ],

        icon:
          this.getIcon(
            type
          ),

        buttons:
          actionText
            ? [
                {
                  text:
                    actionText.toUpperCase(),

                  handler: () => {

                    actionHandler?.();

                    return true;
                  }
                }
              ]
            : [
                {
                  icon: 'close-outline',
                  role: 'cancel'
                }
              ]
      });

    await toast.present();
  }


  private getIcon(
    type: NotificationType
  ): string {

    switch (type) {

      case 'success':
        return 'checkmark-circle';

      case 'error':
        return 'alert-circle';

      case 'warning':
        return 'warning';

      case 'info':
      default:
        return 'information-circle';
    }
  }
}