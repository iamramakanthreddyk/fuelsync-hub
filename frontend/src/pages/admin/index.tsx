import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Dummy check for superadmin role (replace with real auth logic)
const isSuperAdmin = () => {
  if (typeof window === 'undefined') return false;
  const user = localStorage.getItem('user');
  if (!user) return false;
  try {
    const parsed = JSON.parse(user);
    return parsed.role === 'superadmin';
  } catch {
    return false;
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div style={{ padding: 40 }}>
      <h1>SuperAdmin Dashboard</h1>
      <p>Manage tenants, plans, billing, and global settings here.</p>
      {/* Add more admin features here */}
    </div>
  );
}
