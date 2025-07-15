import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PartidaService } from '../../core/services/partida.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  showModal = false;
  createGameForm: FormGroup;
  isLoading = false;
  errorMessage = ''; 

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private partidaService: PartidaService
  ) {
    this.createGameForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      cantidadColores: [2, [Validators.required, Validators.min(2), Validators.max(10)]],
      colores: this.formBuilder.array([], this.noDuplicateColorsValidator)  // Agregar validador personalizado
    });
    this.actualizarColores();
  }

  // Validador personalizado para verificar colores duplicados
  noDuplicateColorsValidator(control: AbstractControl): ValidationErrors | null {
    const coloresArray = control as FormArray;
    const colores = coloresArray.controls.map(ctrl => ctrl.value?.toLowerCase());
    
    // Verificar duplicados
    const duplicados = colores.filter((color, index) => colores.indexOf(color) !== index);
    
    if (duplicados.length > 0) {
      return { duplicateColors: true };
    }
    
    return null;
  }

  openModal(): void {
    this.showModal = true;
    this.errorMessage = ''; 
  }

  closeModal(): void {
    this.showModal = false;
    this.createGameForm.reset();
    this.isLoading = false;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.createGameForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = ''; 
      
     const formData = {
      nombre: this.createGameForm.value.nombre,
      descripcion: this.createGameForm.value.descripcion,
      colores_disponibles: this.createGameForm.value.colores.map((color: string) => color.toLowerCase()) 
    };
      
      console.log('Enviando datos:', formData);

      this.partidaService.createPartida(formData).subscribe({
        next: (partida) => {  
          console.log('Partida creada:', partida);
          
          if (partida && partida.id && !isNaN(partida.id)) {
            this.router.navigate(['/app/sala-espera/' + partida.id]);
            this.closeModal();
          } else {
            console.error('Partida creada sin ID válido:', partida);
            this.errorMessage = 'Error: La partida se creó pero no tiene un ID válido.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error al crear la partida:', err);
          this.isLoading = false;
          
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.message) {
            this.errorMessage = err.message;
          } else {
            this.errorMessage = 'Error al crear la partida. Por favor, inténtalo de nuevo.';
          }
        }
      });
    } else {
      console.warn('Formulario inválido o ya está enviando');
      if (this.createGameForm.invalid) {
        Object.keys(this.createGameForm.controls).forEach(key => {
          this.createGameForm.get(key)?.markAsTouched();
        });
        
        this.coloresFormArray.controls.forEach((control: AbstractControl) => {
          control.markAsTouched();
        });
      }
    }
  }

  navigateToPartidas(): void {
    this.router.navigate(['app/partidas']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createGameForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.createGameForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `El campo ${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `El campo ${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  get coloresFormArray() {
    return this.createGameForm.get('colores') as FormArray;
  }

  hasColoresDuplicados(): boolean {
    const coloresControl = this.createGameForm.get('colores');
    return coloresControl ? coloresControl.errors?.['duplicateColors'] : false;
  }

  getColoresDuplicadosError(): string {
    if (this.hasColoresDuplicados()) {
      return 'No puedes seleccionar el mismo color más de una vez';
    }
    return '';
  }

  isColorDuplicado(index: number): boolean {
    const colores = this.coloresFormArray.controls.map(ctrl => ctrl.value?.toLowerCase());
    const colorActual = colores[index];
    
    return colores.filter(color => color === colorActual).length > 1;
  }

  actualizarColores(): void {
    const cantidad = this.createGameForm.get('cantidadColores')?.value || 0;
    const colores = this.coloresFormArray;

    const coloresDefault = [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
      '#ff00ff', '#00ffff', '#ffa500', '#800080',
      '#ffc0cb', '#a52a2a', '#808080', '#000000',
      '#ffffff', '#008000', '#000080', '#800000'
    ];

    while (colores.length < cantidad) {
      const colorDefault = coloresDefault[colores.length] || '#ffffff';
      colores.push(this.formBuilder.control(colorDefault, Validators.required));
    }

    while (colores.length > cantidad) {
      colores.removeAt(colores.length - 1);
    }
  }
}