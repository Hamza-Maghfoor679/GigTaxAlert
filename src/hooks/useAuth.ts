import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const setStatus = useAuthStore((s) => s.setStatus);

  return {
    status,
    setStatus,
    isAuthenticated: status !== 'auth',
  };
}
