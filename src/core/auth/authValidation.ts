export type AccountFormErrors = {
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAccountEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim()) ? undefined : 'Escribe un correo válido.';
}

export function validateNewPassword(password: string, confirmation: string) {
  if (password.length < 8) return 'Usa al menos 8 caracteres.';
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  return undefined;
}

export function validateAccountForm(email: string, password: string): AccountFormErrors {
  const errors: AccountFormErrors = {};

  const emailError = validateAccountEmail(email);
  if (emailError) errors.email = emailError;

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
  if (
    message.includes('expired') ||
    message.includes('invalid token') ||
    message.includes('otp_expired')
  ) {
    return 'El enlace ya venció o fue utilizado. Solicita uno nuevo.';
  }
  if (message.includes('same password') || message.includes('different from the old password')) {
    return 'Elige una contraseña diferente a la anterior.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'No pudimos conectar. Revisa tu conexión e inténtalo otra vez.';
  }

  return 'No pudimos completar la solicitud. Inténtalo de nuevo.';
}
