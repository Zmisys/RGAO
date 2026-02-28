const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'RGAO!';

export function isAuthorized(request: Request): boolean {
  const password = request.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
}
