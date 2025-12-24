import { NextRequest, NextResponse } from 'next/server';

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace('/api', '') || 'http://localhost:1337';
const STRAPI_ENDPOINT = '/api/construction-billings';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) { headers['Authorization'] = authHeader; }
    
    const response = await fetch(`${STRAPI_BASE_URL}${STRAPI_ENDPOINT}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ data: [] }, { status: 200 });
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } else {
        const text = await response.text();
        return NextResponse.json(
          { error: text || `HTTP ${response.status}: ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching construction-billings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch construction-billings', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) { headers['Authorization'] = authHeader; }
    
    const response = await fetch(`${STRAPI_BASE_URL}${STRAPI_ENDPOINT}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData;
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        const text = await response.text();
        errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating construction-billings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create construction-billings' },
      { status: 500 }
    );
  }
}
