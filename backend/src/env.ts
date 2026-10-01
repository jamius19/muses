/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  adminUsername: required('ADMIN_USERNAME'),
  adminPassword: required('ADMIN_PASSWORD'),
  adminSessionSecret: required('ADMIN_SESSION_SECRET'),
  openrouterApiKey: required('OPENROUTER_API_KEY'),
  openrouterModel: required('OPENROUTER_MODEL'),
  databasePath: process.env.DATABASE_PATH || 'data/muses.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
