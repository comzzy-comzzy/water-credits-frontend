import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { WalletService } from './wallet.service';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private walletService: WalletService
  ) {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      this.fetchCurrentUser();
    }
  }

  async login(): Promise<boolean> {
    try {
      const wallet = await this.walletService.connect();
      if (!wallet) return false;

      // 1. Get challenge
      const { challenge } = await this.apiService.post<{ challenge: string }>('/auth/challenge', { wallet });

      // 2. Sign challenge
      const signature = await this.walletService.signChallenge(challenge);
      if (!signature) return false;

      // 3. Login
      const { token, user } = await this.apiService.post<{ token: string; user: any }>('/auth/login', {
        wallet,
        signature,
        challenge
      });

      localStorage.setItem('token', token);
      this.userSubject.next(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userSubject.next(null);
    this.walletService.disconnect();
  }

  async fetchCurrentUser(): Promise<void> {
    try {
      const user = await this.apiService.get<any>('/users/me');
      this.userSubject.next(user);
    } catch (error) {
      this.logout();
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
