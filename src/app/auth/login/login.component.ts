import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // ✅ Agregar RouterModule
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ErrorTranslator } from '../../shared/utils/error-translator.util';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string = '';
  fieldErrors: { [key: string]: string } = {}; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      this.fieldErrors = {}; 

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading = false; 
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;

          if (err.errors && err.errors.length > 0) {
            err.errors.forEach((error: { field: string; message: string }) => {
              const translateMessage = ErrorTranslator.translateError(
                error.message
              );
              this.fieldErrors[error.field] = translateMessage;
            });
          } else {
            this.error = err.message || 'Error logging in';
          }
        }
      });
    }   
  }

  getFieldError(fieldName: string): string | null {
    return this.fieldErrors[fieldName] || null;
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.getFieldError(fieldName);
  }
}