// frontend/src/utils/authHelper.ts
export interface UserInfo {
  id: string;
  email: string;
  role: string;
  tenant_id?: string;
}

export const storeUser = (user: UserInfo): void => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

export const getUser = (): UserInfo | null => {
  try {
    const data = localStorage.getItem('user');
    return data ? (JSON.parse(data) as UserInfo) : null;
  } catch (error) {
    console.error('Error reading user:', error);
    return null;
  }
};

export const removeUser = (): void => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

export const isAuthenticated = (): boolean => {
  return !!getUser();
};

export const getUserRole = (): string | null => {
  return getUser()?.role || null;
};

export const authHeader = (): Record<string, string> => {
  // Token is stored in HttpOnly cookie; header is unused
  return {};
};

export const getUserInfo = getUser;

export const debugAuth = (): void => {
  console.log('Stored user:', getUser());
};
