import { FunctionsHttpError } from '@supabase/supabase-js';

export async function getRegistrationError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError && error.context instanceof Response) {
    // public-register uses HTTP 409 for an email that is already registered.
    if (error.context.status === 409) return 'email_exists';

    try {
      const body: unknown = await error.context.clone().json();
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        return body.error;
      }
    } catch {
      // The form will display its friendly fallback if the response is not JSON.
    }
  }

  return error instanceof Error ? error.message : 'Unable to create account';
}
