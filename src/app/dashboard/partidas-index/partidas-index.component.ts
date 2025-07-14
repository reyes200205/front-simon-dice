import { Component, OnInit } from '@angular/core';
import { PartidaService, PartidaAPi } from '../../core/services/partida.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partidas-index',
  imports: [CommonModule],
  templateUrl: './partidas-index.component.html',
  styleUrls: ['./partidas-index.component.css']
})
export class PartidasIndexComponent implements OnInit {
  partidas: PartidaAPi[] = [];
  loading: boolean = false;

  constructor(private partidaService: PartidaService, private router: Router) {}

  ngOnInit(): void {
    this.getPartidas();
  }

  private getPartidas(): void {
    this.loading = true;
    this.partidaService.getPartidas().subscribe({
      next: (partidas: PartidaAPi[]) => {
        this.partidas = partidas;
        this.loading = false;
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

} 
