import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartidaService } from '../../core/services/partida.service';
import { PartidasUserResponse, Partidas } from '../../core/services/partida.service';
import { AuthService } from '../../core/services/auth.service';
import { OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mis-partidas',
  imports: [CommonModule],
  templateUrl: './mis-partidas.component.html',
  styleUrl: './mis-partidas.component.css'
})
export class MisPartidasComponent implements OnInit{
  partidas: Partidas[] = [];
  loading: boolean = false;
  currentUserId!: number;


  constructor(private partidaService: PartidaService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loading = true;

    this.authService.getCurrentUser$().subscribe(user=> {
      if (user) {
        this.currentUserId = user.id;
        this.getPartidas();
      }
      else {
        this.router.navigate(['/login']);
        this.loading = false;
      }
    })
  }

  getPartidas(): void {
    this.partidaService.getPartidasUsuario().subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.partidas = resp.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener mis partidas:', err);
      }
    });
  }


  unirsePartida(partida: Partidas): void {
    this.router.navigate(['/app/juego/' + partida.id]);
  }
}
