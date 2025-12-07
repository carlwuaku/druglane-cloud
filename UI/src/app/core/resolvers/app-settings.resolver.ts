import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AppService } from '../../app.service';
import { Observable } from 'rxjs';
import { AppSettings } from '../../libs/types/AppSettings.interface';

export const appSettingsResolver: ResolveFn<AppSettings> = (route, state, appService = inject(AppService)): Observable<AppSettings> => {
  return appService.getAppSettings();
};
