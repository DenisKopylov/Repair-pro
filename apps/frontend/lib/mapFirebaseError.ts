export function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-login-credentials':
      return 'Неверные учётные данные.';
    case 'auth/email-already-in-use':
      return 'Email уже используется.';
    default:
      return 'Ошибка авторизации.';
  }
}
