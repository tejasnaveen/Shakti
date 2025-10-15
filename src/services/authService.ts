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

  const { data, error } = await supabase
    .from('super_admins')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    throw new Error('Authentication failed');
  }

  if (!data) {
    throw new Error('Invalid username or password');
  }

  const isPasswordValid = await comparePassword(password, data.password_hash);

  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  return {
    id: data.id,
    username: data.username
  };
};
