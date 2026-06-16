import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { WalletService } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Droplets } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-bg dark:to-dark-bg-lighter p-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-stellar-blue flex items-center justify-center mx-auto mb-4">
            <lucide-angular [img]="DropletsIcon" class="w-8 h-8 text-white"></lucide-angular>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Water Credits</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Connect your Stellar wallet to continue</p>
        </div>

        <div class="bg-white dark:bg-dark-bg-lighter rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <div class="text-center mb-6">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Sign In</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Authenticate with your Stellar wallet</p>
          </div>

          <div class="space-y-4">
            <button (click)="handleLogin()" [disabled]="loading" class="btn btn-primary w-full flex items-center justify-center gap-2 py-3">
              <svg *ngIf="loading" class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ loading ? 'Connecting...' : 'Connect Wallet' }}
            </button>
          </div>

          <div class="mt-6 text-center">
            <p class="text-xs text-slate-400">
              By connecting, you agree to the
              <a href="#" class="text-stellar-blue hover:underline">Terms of Service</a>
            </p>
          </div>
        </div>

        <div class="mt-4 text-center">
          <p class="text-xs text-slate-400">
            New to Water Credits?
            <a routerLink="/auth/register" class="text-stellar-blue hover:underline">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  protected loading = false;
  protected readonly DropletsIcon = Droplets;

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private router: Router,
  ) {}

  async handleLogin(): Promise<void> {
    this.loading = true;
    try {
      const success = await this.authService.login();
      if (success) {
        this.router.navigateByUrl('/dashboard');
      }
    } finally {
      this.loading = false;
    }
  }
}
