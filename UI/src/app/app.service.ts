import { inject, Injectable } from '@angular/core';
import { HttpService } from './core/services/http/http.service';
import { AppSettings } from './libs/types/AppSettings.interface';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { User } from './core/models/user.model';



@Injectable({
    providedIn: 'root'
})
export class AppService {
    private httpService = inject(HttpService)
    appSettings: AppSettings = {
        appName: 'Druglane Online',
        appVersion: '1.0.0',
        appLongName: 'Druglane Online',
        logo: 'assets/logo.png',
    };
    constructor() {

    }

    getUserTypes() {
        return this.httpService.get<{ data: { label: string, value: string }[] }>('portal/user-types')
    }

    getAppSettings(): Observable<AppSettings> {
        return of(this.appSettings);
    }


}
