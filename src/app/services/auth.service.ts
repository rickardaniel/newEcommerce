import { computed, Injectable, signal } from '@angular/core';
import { User } from '../interface/user';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ClientSession } from '../interface/clientSession';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //   public userLogin = {
  //   name: '',
  //   imagen: '',
  //   login: false,
  //   rol: '',
  //   user:''
  // }

  userLogin: ClientSession
  // Signals para el estado de autenticación
  private _currentUser = signal<any | null>(null);
  private _isLoading = signal<boolean>(false);
  // Signals car
  private _carUser = signal<any | null>(null);
  private _isLoadingCar = signal<boolean>(false);

  // Computed signals (solo lectura)
  public currentUser = this._currentUser.asReadonly();
  public isLoading = this._isLoading.asReadonly();
  public isAuthenticated = computed(() => this._currentUser() !== null);
  public isAuthenticatedCar = computed(() => this._carUser() !== null);

  // private readonly TOKEN_KEY = 'auth_token';
  // private readonly USER_KEY = 'current_user';
  urlBilling = environment.urlBilling;


  constructor(
    private http: HttpClient,
    private router: Router
  )
  {
    // this.initializeAuthState();
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  initializeAuthState(loginStorage): void {
    console.log('loginStorage', loginStorage);
    
    const userData = localStorage.getItem(loginStorage);
    
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('user',user);
        this._currentUser.set(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData(loginStorage);
      }
    }
  }
   /**
   * Proceso de login
   */
  login(credentials: User): Observable<any> {
    this._isLoading.set(true);

    return new Observable(observer => {
      this.http.get<{token: string, user: User}>(`${this.urlBilling}login_user?usuario=${credentials.usuario}&clave=${credentials.clave}` )
        .subscribe({
          next: (response:any) => {
            this._isLoading.set(false);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            this._isLoading.set(false);
            observer.error(error);
          }
        });
    });
  }

  /**
   * Almacena los datos de autenticación
   */
  setAuthData( user: any, loginStorage, rol): void {
    // localStorage.setItem(this.TOKEN_KEY, token);
     let nameAll = user.nombres + ' ' + user.apellidos;
    user.rol = rol;
    if (nameAll) {
      if (nameAll.length <= 30) {
        user.nameUser = nameAll;
      } else {
        user.nameUser = nameAll.slice(0, 30);
      }
    } else {
      user.nameUser = 'DEFAULT NAME';
    }

 
        this.userLogin = {
          name: user.nameUser,
          imagen: user.imagen,
          login: true,
          rol: user.rol,
          user: user
        }

    localStorage.setItem(loginStorage, JSON.stringify( this.userLogin));
    this._currentUser.set(this.userLogin);

   
    
  }

  /**
   * Proceso de logout
   */
  logout(loginStorage): void {
    this.clearAuthData(loginStorage);
    // this.router.navigate(['/login']);
  }

  /**
   * Limpia todos los datos de autenticación
   */
  private clearAuthData(loginStorage): void {
    // localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(loginStorage);
    this._currentUser.set(null);
  }

  /**
   * Obtiene el token almacenado
   */
  // getToken(): string | null {
  //   return localStorage.getItem(this.TOKEN_KEY);
  // }

  /**
   * Verifica si el token existe y es válido
   */
  // hasValidToken(): boolean {
  //   const token = this.getToken();
  //   if (!token) return false;

  //   try {
  //     // Decodifica el JWT para verificar expiración (opcional)
  //     const payload = JSON.parse(atob(token.split('.')[1]));
  //     const currentTime = Math.floor(Date.now() / 1000);
  //     return payload.exp > currentTime;
  //   } catch {
  //     return false;
  //   }
  // }

  /**
   * Refresca el token (opcional)
   */
  // refreshToken(): Observable<any> {
  //   return this.http.post<{token: string}>('/api/auth/refresh', {});
  // }

    getCurrentUserValue() {
    return this._currentUser();
  }
    getCurrentCarValue() {
    return this._carUser();
  }
}
