import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { WalletService } from './wallet.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { STORAGE_KEYS } from '../constants/app.constants';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private walletService: WalletService,
    private loggingService: LoggingService,
  ) {
    const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (savedToken) {
      this.fetchCurrentUser();
    }
  }

  async login(): Promise<boolean> {
    try {
      const wallet = await this.walletService.connect();
      if (!wallet) return false;
      const { challenge } = await this.apiService.post<{ challenge: string }>('/auth/challenge', {
        wallet,
      });
      const signature = await this.walletService.signChallenge(challenge);
      if (!signature) return false;
      const { token, user } = await this.apiService.post<{ token: string; user: User }>(
        '/auth/login',
        { wallet, signature, challenge },
      );
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      this.userSubject.next(user);
      return true;
    } catch (error) {
      this.loggingService.error('Login failed:', error);
      return false;
    }
  }

  async requestChallenge(wallet: string): Promise<{ challenge: string }> {
    return this.apiService.post<{ challenge: string }>('/auth/challenge', { wallet });
  }

  async loginWithCreds(
    wallet: string,
    signature: string,
    challenge: string,
  ): Promise<{ token: string; user: User }> {
    return this.apiService.post<{ token: string; user: User }>('/auth/login', {
      wallet,
      signature,
      challenge,
    });
  }

  async register(
    wallet: string,
    email?: string,
    displayName?: string,
  ): Promise<{ token: string; user: User }> {
    return this.apiService.post<{ token: string; user: User }>('/auth/register', {
      wallet,
      email,
      displayName,
    });
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.userSubject.next(null);
    this.walletService.disconnect();
  }

  async fetchCurrentUser(): Promise<void> {
    try {
      const user = await this.apiService.get<User>('/users/me');
      this.userSubject.next(user);
    } catch {
      this.logout();
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.apiService.get<User>('/users/me');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}
