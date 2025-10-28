import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('Proxy API route called');
    const payload = await request.json();
    console.log('Payload received:', payload);
    
    // Make request to the external API
    const response = await fetch('http://34.228.198.34:8000/api/v1/vocab/generate-vocab', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Nexus-App/1.0',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('External API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `External API error: ${response.status}`,
        details: errorText
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('External API response data:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
