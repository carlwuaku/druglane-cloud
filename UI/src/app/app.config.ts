import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeng/themes/material';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { headersInterceptor } from './core/interceptors/headers.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { DatePipe } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withComponentInputBinding(), withRouterConfig({ paramsInheritanceStrategy: 'always' })),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Material,
                options: {
                    darkModeSelector: false
                }
            }
        }),
        provideHttpClient(
            withInterceptors([headersInterceptor, errorInterceptor])
        ),
        MessageService,
        DatePipe,
        provideNativeDateAdapter()
    ]
};
