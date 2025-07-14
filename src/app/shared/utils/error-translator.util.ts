export class ErrorTranslator {
  private static translations: { [key: string]: string } = {
    'The nombre field must be defined': 'El nombre es requerido',
    'The apellido field must be defined': 'El apellido es requerido',
    'The genero field must be defined': 'El género es requerido',
    'The edad field must be defined': 'La edad es requerida',
    'The fullName field must be defined': 'El nombre  es requerido',
    'The email field must be a valid email address': 'El email debe ser un correo electrónico válido',
    'The apellido field format is invalid': 'El formato del apellido no es válido',
    'The nombre field format is invalid': 'El formato del nombre no es válido',
    'The edad field must be a number': 'La edad debe ser un número',
    'The email has already been taken': 'Este email ya ha sido registrado',
    'The password field must have at least 8 characters': 'La contraseña debe tener al menos 8 caracteres',
    'The nombre field must have at least 2 characters': 'El nombre debe tener al menos 2 caracteres',
    'The apellido field must have at least 2 characters': 'El apellido debe tener al menos 2 caracteres',
    'The email field must be defined': 'El email es requerido',
    'The edad field must be at least 0': 'La edad no puede ser menor a 0',
    'The password field must be defined': 'La contraseña es requerida',
    'The nombre field must be at least 3 characters': 'El nombre debe tener al menos 3 caracteres',
    'The email field must be a valid email': 'El email debe tener un formato válido',
    'The edad field must not be greater than 100': 'La edad no puede ser mayor a 100',
  };

  static translateError(message: string): string {
    return this.translations[message] || message;
  }

  static addTranslation(englishMessage: string, spanishMessage: string): void {
    this.translations[englishMessage] = spanishMessage;
  }
}