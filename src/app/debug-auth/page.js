'use client';
import { useState } from 'react';
import { Post } from '@/Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';

const DebugAuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const headers = apiHeader();

  const testRegister = async () => {
    const params = {
      firstName: 'Test',
      lastName: 'User',
      email: email || 'test@example.com',
      password: password || 'password123',
      confirmPassword: password || 'password123',
    };
    
    setLoading(true);
    try {
      const url = BaseURL('auth/register');
      const res = await Post(url, params, headers);
      setResponse({ type: 'register', data: res });
      console.log('Register response:', res);
    } catch (error) {
      setResponse({ type: 'register', error: error.response?.data || error.message });
      console.error('Register error:', error);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    const params = {
      email: email || 'test@example.com',
      password: password || 'password123',
    };
    
    setLoading(true);
    try {
      const url = BaseURL('auth/login');
      const res = await Post(url, params, headers);
      setResponse({ type: 'login', data: res });
      console.log('Login response:', res);
    } catch (error) {
      setResponse({ type: 'login', error: error.response?.data || error.message });
      console.error('Login error:', error);
    }
    setLoading(false);
  };

  const testForgotPassword = async () => {
    setLoading(true);
    try {
      const url = BaseURL('auth/forgot-password');
      const res = await Post(url, { email: email || 'test@example.com' }, headers);
      setResponse({ type: 'forgot', data: res });
      console.log('Forgot password response:', res);
    } catch (error) {
      setResponse({ type: 'forgot', error: error.response?.data || error.message });
      console.error('Forgot password error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-white text-xl mb-4">Test Credentials</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full rounded bg-gray-700 text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full rounded bg-gray-700 text-white px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-white text-xl mb-4">Test Actions</h2>
            <div className="space-y-3">
              <button
                onClick={testRegister}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                Test Register
              </button>
              <button
                onClick={testLogin}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                Test Login
              </button>
              <button
                onClick={testForgotPassword}
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                Test Forgot Password
              </button>
            </div>
          </div>
        </div>

        {response && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-lg mb-4">Response ({response.type})</h3>
            <pre className="bg-gray-900 p-4 rounded text-green-400 text-sm overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-900 p-6 rounded-lg">
          <h3 className="text-yellow-200 text-lg mb-2">Email Troubleshooting</h3>
          <ul className="text-yellow-100 space-y-2">
            <li>• Check your spam/junk folder</li>
            <li>• Verify the email address is correct</li>
            <li>• Check if the backend email service is configured</li>
            <li>• Try with a different email provider (Gmail, Outlook, etc.)</li>
            <li>• Check backend logs for email sending errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugAuthPage;
