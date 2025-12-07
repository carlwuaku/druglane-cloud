import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { NotifyService } from '../../libs/services/notify.service';
import { inject } from '@angular/core';
import { map, catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notify = inject(NotifyService);
  return next(request).pipe(
    map((event: HttpEvent<any>) => {
      return event;
    }),
    catchError((error: any) => {
      //display a toast with the error message
      console.log('ErrorInterceptor', error)
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        // client-side error
        errorMessage = `Connection Error: ${error.error.message}`;

      }
      else if (typeof (error.error) === "string") {
        errorMessage = `${error.error}`;
      }
      else if (typeof (error.error) === "object") {

        if ('message' in error.error) {
          errorMessage = error.error.message;
        }
        else if ('errors' in error.error) {
          errorMessage = "";
          for (const key in error.error.errors) {
            errorMessage += `${key}: ${error.error.errors[key]}\n`
          }
        }

        else {
          errorMessage = JSON.stringify(error.error)
        }

      }
      else if ('message' in error) {//this will be something like Http failure response for http://localhost:8080/licenses/details: 400 Bad Request
        errorMessage = error.message;
      }

      else {
        // server-side error

        errorMessage = `Server Error Code: ${error.status}\n Message: ${error.message}`;

      }
      notify.failNotification(errorMessage)
      // this.notify.failNotification(error.message)
      return throwError(() => error);

    })
  );
};
