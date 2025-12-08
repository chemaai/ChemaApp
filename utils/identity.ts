/**
 * Identity helper - requires authenticated Supabase user.
 * No device ID fallback - all users must be logged in.
 */

/**
 * Returns the user ID for API requests.
 * Throws if user is not logged in.
 * 
 * @param user - The Supabase auth user object
 * @returns The user's Supabase auth ID
 * @throws Error if user is not logged in
 */
export function requireUserId(user: { id?: string } | null): string {
  if (!user?.id) {
    throw new Error('User must be logged in');
  }
  console.log('🔐 User ID:', user.id.slice(0, 8) + '...');
  return user.id;
}

/**
 * Checks if user is logged in.
 * @param user - The Supabase auth user object
 * @returns true if user has a valid ID
 */
export function isLoggedIn(user: { id?: string } | null): boolean {
  return !!user?.id;
}
