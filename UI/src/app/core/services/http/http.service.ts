import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private httpClient = inject(HttpClient);
  public baseUrl = environment.host;
  constructor() { }

  public constructURL(url: string, doNotEncode?: boolean): string {
    if (doNotEncode) {
      return `${environment.host}${url}`;
    }
    return encodeURI(
      `${environment.host}${url}`
    );
  }

  private getHeaders(additionalHeaders?: HttpHeaders): HttpHeaders {
    const result: HttpHeaders = new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      "cache-control": "no-cache",
      Pragma: "no-cache",
      Expires: "Sat, 01 Jan 2000 00:00:00 GMT"
    });

    if (!additionalHeaders) {
      return result;
    } // No additional headers, do an early exit

    for (const key in additionalHeaders.keys()) {
      if (result.has(key)) {
        // Header already exists, update its value
        result.set(key, additionalHeaders.get(key)!);
        continue;
      }

      result.append(key, additionalHeaders.get(key)!);
    }

    return result;
  }



  public get<T>(url: string, doNotEncode?: boolean): Observable<T> {
    const headers = this.getHeaders();
    // if (url.indexOf("?") == -1) {
    //   url += "?ts=" + this.dateService.getToday("timestamp")
    // }
    // else {
    //   url += "&ts=" + this.dateService.getToday("timestamp")
    // }

    return this.httpClient.get<T>(this.constructURL(url), { headers: headers }).pipe(
      map(data => {
        return data;
      })
    );
  }

  public post<T>(url: string, data: any): Observable<T> {
    return this.httpClient.post<T>(this.constructURL(url), data)
  }

  public postWithProgress<T>(url: string, data: any): Observable<HttpEvent<T>> {
    return this.httpClient.post<T>(this.constructURL(url), data, {
      reportProgress: true,
      observe: 'events'
    })
  }

  public put<T>(url: string, data: any): Observable<T> {
    if (data instanceof FormData) {
      const object: { [key: string]: any } = {};
      data.forEach((value, key) => object[key] = value);
      data = object;
    }
    return this.httpClient.put<T>(this.constructURL(url), data)
  }

  public delete<T>(url: string, data?: any): Observable<T> {
    const options = {
      body: data
    };

    return this.httpClient.delete<T>(this.constructURL(url), options);
  }

}
