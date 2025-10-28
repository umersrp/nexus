import { NextResponse } from 'next/server';
import { apiUrl } from '@/config/apiUrl';

export async function POST(request, { params }) {
  const { id } = params || {};
  if (!id) {
    return NextResponse.json({ success: false, message: 'Course id is required' }, { status: 400 });
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';

  try {
    const resp = await fetch(`${apiUrl}/api/v1/courses/${id}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Proxy error', error: e?.message }, { status: 500 });
  }
}


