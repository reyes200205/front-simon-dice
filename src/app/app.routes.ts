import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { GuestGuard } from './core/guards/guest.guard';
import { authenticatedComponent } from './pages/layout/authenticated/authenticated.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './dashboard/home/home.component';
import { PartidaComponent } from './dashboard/partida/partida.component';
import { PartidasIndexComponent } from './dashboard/partidas-index/partidas-index.component';
import { SalaEsperaComponent } from './dashboard/sala-espera/sala-espera.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    canActivate: [GuestGuard]
  },
    {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },

  {
    path: 'app', 
    component: authenticatedComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'sala-espera/:id',
        component: SalaEsperaComponent
      },
      {
        path: 'juego/:id',
        component: PartidaComponent
      },
      {
        path: 'partidas',
        component: PartidasIndexComponent
      },
    ]
  },
];

