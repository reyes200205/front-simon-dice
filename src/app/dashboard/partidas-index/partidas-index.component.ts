import { Component, OnInit, OnDestroy } from '@angular/core';
import { PartidaService, PartidaAPi } from '../../core/services/partida.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-partidas-index',
  imports: [CommonModule],
  templateUrl: './partidas-index.component.html',
  styleUrls: ['./partidas-index.component.css']
})
export class PartidasIndexComponent implements OnInit, OnDestroy {
  partidas: PartidaAPi[] = [];
  loading: boolean = false;
  private pollingSubscription?: Subscription;

  constructor(private partidaService: PartidaService, private router: Router) {}

  ngOnInit(): void {
    this.getPartidas();
    this.iniciarPolling();
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private getPartidas(): void {
    this.loading = true;
    this.partidaService.getPartidas().subscribe({
      next: (partidas: PartidaAPi[]) => {
        this.partidas = partidas;
        this.loading = false;
        console.log('Partidas obtenidas:', partidas);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  unirsePartida(partida: PartidaAPi): void {
    this.partidaService.unirsePartida(partida).subscribe({
      next: (response) => {
        console.log('Respuesta al unirse a partida:', response);

        if (response && response.success && response.data && response.data.partida) {
          const partidaId = response.data.partida.id;
          if (partidaId) {
            if (this.pollingSubscription) {
              this.pollingSubscription.unsubscribe();
            }
            this.router.navigate(['/app/juego', partidaId]);
          } else {
            console.error('No se pudo obtener el ID de la partida');
          }
        } else {
          console.error('Respuesta inesperada del servidor:', response);
        }
      },
      error: (error) => {
        console.error('Error al unirse a la partida:', error);
      }
    });
  }

  iniciarPolling(): void {
    this.pollingSubscription = interval(5000).pipe( 
      switchMap(() => {
        return this.partidaService.getPartidas();
      }),
      catchError(error => {
        console.error('Error en polling de partidas:', error);
        return of([]); 
      })
    ).subscribe((partidas: PartidaAPi[]) => {
      if (partidas && partidas.length >= 0) {
        this.partidas = partidas;
      }
    });
  }

  pausarPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  reanudarPolling(): void {
    if (!this.pollingSubscription || this.pollingSubscription.closed) {
      this.iniciarPolling();
    }
  }

  refrescarPartidas(): void {
    this.getPartidas();
  }
}