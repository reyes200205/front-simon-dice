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
  ultimoColorVisible: string | null = null;
  inputDeshabilitado: boolean | undefined;
  mostrarUltimoColor: boolean = false;
  animacionesColores: { [color: string]: boolean } = {};
  clickFeedback: { [color: string]: boolean } = {};
  nivelActual: number = 0;
  mensaje: string = '';
  coloresSeleccionados: string[] = [];
  private ultimoColorAnimado: string | null = null;
  esMiTurno: boolean = false;
  juegoTerminado: boolean = false;
  ganador: any = null;
  cargando: boolean = false;
  private pollingSubscription?: Subscription;
  private apiUrl = environment.apiUrl;

  // Nuevas propiedades para las animaciones mejoradas
  mostrarMensajeUltimoColor: boolean = false;

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
    this.resultadoFinal = data.resultadoFinal;

    this.esMiTurno = data.estado.esMiTurno;
    this.juegoTerminado = data.estado.juegoTerminado;
    if (this.juegoTerminado && this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }

    this.ganador = data.estado.ganador;
    this.mensaje = data.estado.mensaje;

    this.ultimoColor = data.juego.ultimoColor;
    this.mostrarUltimoColor = data.juego.mostrarUltimoColor;
    this.nivelActual = data.juego.nivelActual;

    // Solo mostrar el último color cuando ES mi turno y hay un último color
    if (this.esMiTurno && this.mostrarUltimoColor && this.ultimoColor) {
      this.mostrarMensajeUltimoColor = true;
      // Mantener la animación solo en el botón
      this.ultimoColorVisible = null;
      setTimeout(() => {
        this.ultimoColorVisible = this.ultimoColor;
        setTimeout(() => {
          this.ultimoColorVisible = null;
        }, 800);
      }, 100);
    } else {
      this.mostrarMensajeUltimoColor = false;
    }
  }

  // Eliminamos esta función ya que no la necesitamos
  // mostrarAnimacionUltimoColor(): void {

  seleccionarColor(color: string): void {
    if (!this.esMiTurno || this.juegoTerminado || this.inputDeshabilitado) return;

    this.coloresSeleccionados.push(color);

    // Animación de click mejorada (más opaco y duradero)
    this.clickFeedback[color] = true;
    setTimeout(() => {
      this.clickFeedback[color] = false;
    }, 250); // Aumenté el tiempo para que se vea mejor el efecto

    const longitudSecuenciaCompleta = this.nivelActual + 1;
    
    if (this.coloresSeleccionados.length === longitudSecuenciaCompleta) {
      this.inputDeshabilitado = true;

      this.http.post(`${this.apiUrl}/disparo/${this.partidaId}`, {
        secuencia: this.coloresSeleccionados
      }).subscribe({
        next: (resp: any) => {
          if (resp.success) {
            this.mensaje = resp.resultado.mensaje;
            this.coloresSeleccionados = [];
            this.actualizarJuego();
            this.inputDeshabilitado = false;
          }
        },
        error: () => {
          this.mensaje = 'Error al enviar secuencia.';
          this.inputDeshabilitado = false;
        }
      });
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
    this.router.navigate(['/app/partidas']);
  }
}