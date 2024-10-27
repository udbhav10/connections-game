import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // baseUrl = 'http://localhost:3000/';
  baseUrl = '/';

  constructor(private http: HttpClient) {}

  getTodaysWords(): Observable<any> {
    return this.http.get(`${this.baseUrl}api/todays-words`).pipe(
      catchError(this.handleError)
    );
  }

  getLoginStatus(): Observable<any> {
    return this.http.get<{ isLoggedIn: boolean }>(`${this.baseUrl}login-status`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
