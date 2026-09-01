export const OPTIONAL_SERVER_BACKEND_MESSAGE =
  "The optional server backend is not configured. The primary Firebase backend remains available.";

export function isOptionalServerBackendConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET?.trim() && process.env.DATABASE_URL?.trim()
  );
}
