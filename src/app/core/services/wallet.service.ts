import { Injectable } from '@angular/core';
import freighter from '@stellar/freighter-api';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private publicKeySubject = new BehaviorSubject<string | null>(null);
  public publicKey$ = this.publicKeySubject.asObservable();

  constructor() {}

  async checkConnection(): Promise<boolean> {
    try {
      const result = await freighter.isConnected();
      if (result.isConnected) {
        const addressResult = await freighter.getAddress();
        if (addressResult.address) {
          this.publicKeySubject.next(addressResult.address);
          return true;
        }
      }
    } catch (e) {
      console.error('Check connection failed', e);
    }
    return false;
  }

  async connect(): Promise<string | null> {
    try {
      const result = await freighter.getAddress();
      if (result.address) {
        this.publicKeySubject.next(result.address);
        return result.address;
      }
      return null;
    } catch (error) {
      console.error('Failed to connect to Freighter:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    this.publicKeySubject.next(null);
  }

  async signChallenge(challenge: string): Promise<string | null> {
    try {
      // signMessage is the replacement for signBlob/signMessage in v6
      const result = await freighter.signMessage(challenge);
      if ('signedMessage' in result && result.signedMessage) {
        if (typeof result.signedMessage === 'string') {
          return result.signedMessage;
        }
        // Uint8Array to base64
        const binary = String.fromCharCode(...result.signedMessage);
        return window.btoa(binary);
      }
      return null;
    } catch (error) {
      console.error('Failed to sign challenge:', error);
      return null;
    }
  }

  async signTx(xdr: string, network: string, networkPassphrase?: string): Promise<string | null> {
    try {
      const result = await freighter.signTransaction(xdr, { 
        networkPassphrase 
      });
      if (result.signedTxXdr) {
        return result.signedTxXdr;
      }
      return null;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      return null;
    }
  }

  getStoredPublicKey(): string | null {
    return this.publicKeySubject.value;
  }
}
