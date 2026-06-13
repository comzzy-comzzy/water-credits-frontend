import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  constructor() {}

  connect(token: string, userId: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${environment.wsUrl}/notifications`, {
      query: { token, userId },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on('connect', () => {
      this.connectedSubject.next(true);
      console.log('Connected to WebSocket');
    });

    this.socket.on('disconnect', () => {
      this.connectedSubject.next(false);
      console.log('Disconnected from WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) return;
      
      this.socket.on(event, (data) => {
        observer.next(data);
      });

      return () => {
        if (this.socket) {
          this.socket.off(event);
        }
      };
    });
  }

  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}
