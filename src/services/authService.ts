import { supabase } from '../lib/supabase';
import { comparePassword } from '../utils/passwordUtils';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
}

export const loginSuperAdmin = async (credentials: LoginCredentials): Promise<AuthenticatedUser> => {
  const { username, password } = credentials;

  console.log('Attempting login with username:', username);

  const { data, error } = await supabase
    .from('super_admins')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();

  console.log('Query result:', { data, error });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Authentication failed');
  }

  if (!data) {
    console.log('No user found with username:', username);
    throw new Error('Invalid username or password');
  }

  console.log('Found user, comparing password...');
  const isPasswordValid = await comparePassword(password, data.password_hash);
  console.log('Password valid:', isPasswordValid);

  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  return {
    id: data.id,
    username: data.username
  };
};
