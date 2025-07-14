import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrls: ['./partida.component.css'],
  imports: [CommonModule]
})
export class PartidaComponent implements OnInit, OnDestroy {
  partidaId!: string;
  partida: any = null;
  jugadorActual: any = null;
  oponente: any = null;
  juego: any = null;
  estado: any = null;
  resultadoFinal: any = null;
  ultimoColor: string | null = null;
  inputDeshabilitado: boolean | undefined;

  mensaje: string = '';
  coloresSeleccionados: string[] = [];
  esMiTurno: boolean = false;
  juegoTerminado: boolean = false;
  ganador: any = null;
  cargando: boolean = false;
  private pollingSubscription?: Subscription;
  private apiUrl = environment.apiUrl;


  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.partidaId = this.route.snapshot.params['id'];
    this.cargarEstadoInicial();
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) this.pollingSubscription.unsubscribe();
  }

  cargarEstadoInicial(): void {
    this.cargando = true;
    this.http.get(`${this.apiUrl}/partida/${this.partidaId}`).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.procesarDatos(resp.data);
          this.iniciarPolling();
        }
        this.cargando = false;
      },
      error: () => {
        this.mensaje = 'Error al cargar la partida';
        this.cargando = false;
      }
    });
  }

  procesarDatos(data: any): void {
    this.partida = data.partida;
    this.jugadorActual = data.jugadorActual;
    this.oponente = data.oponente;
    this.juego = data.juego;
    this.estado = data.estado;
    this.ultimoColor = data.juego.ultimoColor;
    this.resultadoFinal = data.resultadoFinal;
    this.esMiTurno = data.estado.esMiTurno;
    this.juegoTerminado = data.estado.juegoTerminado;
    this.ganador = data.estado.ganador;
    this.mensaje = data.estado.mensaje;
  }

  seleccionarColor(color: string): void {
    if (!this.esMiTurno || this.juegoTerminado) return;
    this.coloresSeleccionados.push(color);
    const esCorrecto = this.coloresSeleccionados.every((c, i) => c === this.juego.secuencia[i]);

    if (!esCorrecto) {
      this.mensaje = '¡Secuencia incorrecta!';
      this.coloresSeleccionados = [];
    } else if (this.coloresSeleccionados.length === this.juego.secuencia.length) {
      this.mensaje = '¡Correcto! Espera tu siguiente turno';
      this.coloresSeleccionados = [];
      this.actualizarJuego();
    }
  }

  actualizarJuego(): void {
    this.http.get(`${this.apiUrl}/partida/${this.partidaId}`).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.procesarDatos(resp.data);
        }
      }
    });
  }

  iniciarPolling(): void {
    this.pollingSubscription = interval(3000).pipe(
      switchMap(() => {
        if (!this.juegoTerminado) {
          return this.http.get(`${this.apiUrl}/partida/${this.partidaId}`);
        }
        return of(null);
      }),
      catchError(error => {
        console.error('Error en polling:', error);
        return of(null);
      })
    ).subscribe((resp: any) => {
      if (resp?.success) this.procesarDatos(resp.data);
    });
  }

  volver(): void {
    this.router.navigate(['/partidas']);
  }
}
