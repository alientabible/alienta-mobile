export type AccountFormErrors = {
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAccountForm(email: string, password: string): AccountFormErrors {
  const errors: AccountFormErrors = {};

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Escribe un correo válido.';
  }

  if (password.length < 8) {
    errors.password = 'Usa al menos 8 caracteres.';
  }

  return errors;
}

export function getAccountErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('invalid login credentials')) {
    return 'El correo o la contraseña no coinciden.';
  }
  if (message.includes('email not confirmed')) {
    return 'Primero confirma tu correo desde el mensaje que te enviamos.';
  }
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'Ese correo ya tiene una cuenta. Prueba iniciar sesión.';
  }
  if (message.includes('rate limit')) {
    return 'Espera un momento antes de volver a intentarlo.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'No pudimos conectar. Revisa tu conexión e inténtalo otra vez.';
  }

  return 'No pudimos completar la solicitud. Inténtalo de nuevo.';
}
