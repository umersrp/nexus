import { NextResponse } from 'next/server';
import { apiUrl } from '@/config/apiUrl';

export async function POST(request, { params }) {
  const { id } = params || {};
  if (!id) return NextResponse.json({ success: false, message: 'id required' }, { status: 400 });

  const auth = request.headers.get('authorization') || '';
  try {
    const resp = await fetch(`${apiUrl}/api/v1/admin/${id}/activate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Proxy error', error: e?.message }, { status: 500 });
  }
}


