import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Partida {
  id: number;
  nombre: string;
  descripcion: string;
}

interface UsuarioPartida {
  id: number;
  fullName: string;
  email: string;
}

export interface UnirsePartidaData {
  partida: PartidaAPi;
  jugador_numero: number;
  total_jugadores: number;
}

export interface unirsePartidaResponse {
  success: boolean;
  message: string;
  data: UnirsePartidaData;
}

export interface PartidaAPi {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  ganadorId: number | null;
  createdAt: string;
  updatedAt: string;
  jugador1:{
    id:number;
    fullName:string;
    email:string;
  }
}

export interface IndexPartidasResponse {
  success: boolean;
  data: PartidaAPi[];
}

export interface EstadoPartida {
  [x: string]: any;
  totalJugadores: number;
  puedeIniciar: boolean;
  estado: string;
}

export interface PartidaResponse {
  partida: Partida;
  totalJugadores: number;
}

interface MisPartidasResponse {
  success: boolean;
  data: any[];
  message?: string;
  error?: string;
}

export interface CreatePartidaData {
  nombre: string;
  descripcion: string;
  colores_disponibles: string[];
}


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreatePartidaApiData {
  partida: Partida;
  JugadoresPartida: any;
}

@Injectable({
  providedIn: 'root',
})
export class PartidaService {
  private apiUrl = environment.apiUrl; 
  private partidasUrl = `${this.apiUrl}/partidas`;

  constructor(private http: HttpClient) {}

  verificarEstado(partidaId: number): Observable<EstadoPartida> {
    if (!partidaId || isNaN(partidaId)) {
      return throwError(() => new Error('ID de partida inválido'));
    } 

    return this.http
      .get<EstadoPartida>(`${this.apiUrl}/verificar-estado/${partidaId}`)
      .pipe(
        catchError((error) => {
          console.error('Error al verificar estado:', error);
          return throwError(() => error);
        })
      );
  }

  cancelarPartida(partidaId: number): Observable<any> {
    if (!partidaId || isNaN(partidaId)) {
      return throwError(() => new Error('ID de partida inválido'));
    }

    return this.http.delete<any>(`${this.partidasUrl}/${partidaId}`).pipe(
      catchError((error) => {
        console.error('Error al cancelar partida:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerPartida(partidaId: number): Observable<PartidaResponse> {
    if (!partidaId || isNaN(partidaId)) {
      return throwError(() => new Error('ID de partida inválido'));
    }

    return this.http
      .get<PartidaResponse>(`${this.apiUrl}/partida/${partidaId}`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener partida:', error);
          return throwError(() => error);
        })
      );
  }


  getPartidas(): Observable<PartidaAPi[]> {
    return this.http.get<IndexPartidasResponse>(this.partidasUrl).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error('Respuesta de API inválida');
        }
      }),
      catchError((error) => {
        console.error('Error al obtener partidas:', error);
        return throwError(() => error);
      })
    );
  }

  createPartida(data: CreatePartidaData): Observable<Partida> {
    if (!data || !data.nombre || !data.descripcion || !data.colores_disponibles) {
      return throwError(() => new Error('Datos de partida inválidos'));
    }

    return this.http
      .post<{ message: string; partida: Partida }>(this.partidasUrl, data)
      .pipe(
        map((response) => {
          if (response.partida && response.partida.id) {
            return response.partida;
          } else {
            throw new Error('Respuesta de API inválida');
          }
        }),
        catchError((error) => {
          console.error('Error al crear partida:', error);
          return throwError(() => error);
        })
      );
  }


  updatePartida(partida: Partida): Observable<Partida> {
    if (!partida || !partida.id || isNaN(partida.id)) {
      return throwError(() => new Error('Partida inválida'));
    }

    return this.http
      .put<Partida>(`${this.partidasUrl}/${partida.id}`, partida)
      .pipe(
        catchError((error) => {
          console.error('Error al actualizar partida:', error);
          return throwError(() => error);
        })
      );
  }

  getMisPartidas(): Observable<MisPartidasResponse> {
    return this.http
      .get<MisPartidasResponse>(`${this.apiUrl}/mis-partidas`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener mis partidas:', error);
          return throwError(() => error);
        })
      );
  }

  unirsePartida(partida: PartidaAPi): Observable<unirsePartidaResponse> {
    return this.http.post<unirsePartidaResponse>(
      `${this.apiUrl}/unirse-partida/${partida.id}`,
      partida
    );

  }

  deletePartida(id: number): Observable<any> {
    if (!id || isNaN(id)) {
      return throwError(() => new Error('ID de partida inválido'));
    }

    return this.http.delete<any>(`${this.partidasUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar partida:', error);
        return throwError(() => error);
      })
    );
  }


 getEstadisticas(): Observable<{ success: boolean; ganadas: number; perdidas: number }> {
    return this.http.get<{ success: boolean; ganadas: number; perdidas: number }>(
      `${this.apiUrl}/estadisticas`
    );
  }

  getPartidasFiltradas(tipo: 'ganadas' | 'perdidas'): Observable<{
    success: boolean;
    partidas: any[];
    tipo: string;
  }> {
    return this.http.get<{ success: boolean; partidas: any[]; tipo: string }>(
      `${this.apiUrl}/estadisticas/partidas/${tipo}`
    );
  }
   

}
