import { Injectable } from '@angular/core';
import { Observable, of, map, catchError, shareReplay } from 'rxjs';
import { HttpService } from '../../core/services/http/http.service';
interface SignedUrlResponse {
  url: string;
  expires_at: string;
}
interface CachedUrl {
  url: string;
  expiresAt: number;
}
@Injectable({
  providedIn: 'root'
})
export class SecureImageService {


  private cache = new Map<string, CachedUrl>();
  private readonly CACHE_BUFFER = 5 * 60 * 1000; // 5 minutes before actual expiry

  constructor(private http: HttpService) { }

  /**
   * Get a signed URL for secure image access
   */
  getSignedUrl(imageType: string, filename: string): Observable<string> {
    const cacheKey = `${imageType}/${filename}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt - this.CACHE_BUFFER) {
      return of(cached.url);
    }


    return this.http.get<SignedUrlResponse>(
      `file-server/sign-url/${imageType}/${filename}`
    ).pipe(
      map(response => {
        // Cache the URL
        const expiresAt = new Date(response.expires_at).getTime();
        this.cache.set(cacheKey, { url: response.url, expiresAt });
        return response.url;
      }),
      catchError(error => {
        console.error('Error fetching signed URL:', error);
        return of(''); // Return empty string on error
      }),
      shareReplay(1) // Share the result among multiple subscribers
    );
  }

  // /**
  //  * Get image as blob URL (alternative method - uses more bandwidth)
  //  */
  // getImageAsBlob(imageUrl: string): Observable<string> {
  //   const token = localStorage.getItem('auth_token');
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`
  //   });

  //   return this.http.get(imageUrl, {
  //     headers,
  //     responseType: 'blob'
  //   }).pipe(
  //     map(blob => URL.createObjectURL(blob)),
  //     catchError(error => {
  //       console.error('Error fetching image blob:', error);
  //       return of('');
  //     })
  //   );
  // }

  /**
   * Clear cache (useful on logout)
   */
  clearCache(): void {
    this.cache.clear();
  }
}
