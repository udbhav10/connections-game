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

  saveProgressData(progressData: any, attempts: number, resultFlag: boolean | null): Observable<any> {
    const inputParams = {
      progressData: progressData,
      attempts: attempts,
      resultFlag: resultFlag
    };
    return this.http.post(`${this.baseUrl}save-progress`, inputParams, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getProgressData() {
    return this.http.get(`${this.baseUrl}get-progress`).pipe(
      catchError(this.handleError)
    );
  }

  getMistakesData() {
    return this.http.get(`${this.baseUrl}get-mistakes`).pipe(
      catchError(this.handleError)
    );
  }

  getUserConfiguration() {
    return this.http.get(`${this.baseUrl}get-configuration`).pipe(
      catchError(this.handleError)
    );
  }

  saveUserConfiguration(doNotShowHelpAgain: boolean) {
    const inputParams = {
      configuration: {
        "doNotShowHelpAgain": doNotShowHelpAgain
      },
    };
    return this.http.post(`${this.baseUrl}save-configuration`, inputParams, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError)
    );
  }

  logout() {
    return this.http.post(`${this.baseUrl}logout`, {});
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
