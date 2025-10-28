'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Post } from '@/Axios/AxiosFunctions';
import { BaseURL, apiHeader } from '@/config/apiUrl';
import Cookies from 'js-cookie';
import { encryptToken } from '@/config/helper';
import { useRouter } from 'next/navigation';

export default function AdminLoginStandalone() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document?.body?.classList?.remove('dark');
    document?.body?.classList?.add('light');
  }, []);

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await Post(BaseURL('auth/login'), { email, password }, apiHeader());
      const data = res?.data?.data;
      const role = data?.user?.role;
      const token = data?.token;
      if (token) {
        Cookies.set('xpdx', encryptToken(token), { expires: 90 });
      }
      if (role) Cookies.set('role', role, { expires: 90 });
      if (role === 'admin' || role === 'super_admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } catch (e) {
      // AxiosFunctions will toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Image src='/image.png' alt='Nexus Logo' width={160} height={48} priority />
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: 20, borderBottom: '1px solid #eef2f7', background: '#1E3A8A', color: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>Admin Login</h3>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <input type='email' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Enter admin email' style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 10, height: 46, padding: '0 14px' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <input type='password' value={password} onChange={(e)=>setPassword(e.target.value)} placeholder='Enter password' style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 10, height: 46, padding: '0 14px' }} />
            </div>
            <button onClick={submit} disabled={loading} style={{ width: '100%', height: 46, borderRadius: 10, background: '#1E3A8A', color: '#fff', border: 0, fontWeight: 700 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


