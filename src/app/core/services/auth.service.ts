import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  fullName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ValidationError {
  field: string;
  message: string;
}
export interface ApiErrorResponse {
  message: string;
  errors?: ValidationError[];
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private token_key = 'auth_token';
  private user_key = 'auth_user';

  constructor(private http: HttpClient, private router: Router) {}
  

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );


  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getCurrentUser()
  );

  getCurrentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  getToken(): string {
    return localStorage.getItem(this.token_key) || '';
  }

  private hasToken(): boolean {
    const token = this.getToken();
    return !!token && token.trim().length > 0;
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.user_key);
    return userJson ? JSON.parse(userJson) : null;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: LoginData): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(tap((response) => this.handleAuthResponse(response)))
      .pipe(catchError(this.handleError));
  }

  register(userData: RegisterData): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(tap((response) => this.handleAuthResponse(response)))
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap({
          next: () => {
            this.handleLogout();
          },
          error: () => {
            this.handleLogout();
          },
        }),
        catchError((error) => {
          this.handleLogout();
          return of({ message: 'Logout completed' });
        })
      );
  }

  private clearUserData(): void {
    localStorage.removeItem(this.token_key);
    localStorage.removeItem(this.user_key);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  clearToken(): void {
    localStorage.removeItem(this.token_key);
    this.isAuthenticatedSubject.next(false);
  }

  private handleAuthResponse(response: LoginResponse): void {
    localStorage.setItem(this.token_key, response.token);
    localStorage.setItem(this.user_key, JSON.stringify(response.user));

    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(response.user);
  }

  private handleLogout(): void {
    this.clearUserData();
    console.log('logout');
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse) {
    let errorResponse: ApiErrorResponse = {
      message: 'Ha ocurrido un error al procesar la petición',
      errors: [],
    };

    if (error.error instanceof ErrorEvent) {
      errorResponse.message = error.error.message;
    } else {
      if (error.error && typeof error.error === 'object') {
        errorResponse = {
          message: error.error.message || 'Error al procesar la petición',
          errors: error.error.errors || [],
        };
      } else {
        errorResponse.message = error.message;
      }
    }
    return throwError(errorResponse);
  }


  initAuthService() {
    const token = this.getToken();
    if (token) {
      this.validateTokenWithAPI(token);
    }
  }

  
  private validateTokenWithAPI(token: string) {
    this.http
      .get(`${this.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          this.isAuthenticatedSubject.next(true);
        },
        error: (error) => {
          if (error.status === 401 || error.status === 403) {
            this.isAuthenticatedSubject.next(false);
            this.clearUserData();
          }
        },
      });
  }
}
