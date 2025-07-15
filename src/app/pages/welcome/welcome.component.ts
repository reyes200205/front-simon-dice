import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html'
})
export class WelcomeComponent implements OnInit, OnDestroy {
  activeCircle: string = '';
  private animationInterval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCircleAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  startCircleAnimation(): void {
    const circles = ['red', 'blue', 'yellow', 'green'];
    let currentIndex = 0;

    this.animationInterval = setInterval(() => {
      this.activeCircle = circles[currentIndex];
      currentIndex = (currentIndex + 1) % circles.length;
      
      setTimeout(() => {
        this.activeCircle = '';
      }, 300);
    }, 800);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}