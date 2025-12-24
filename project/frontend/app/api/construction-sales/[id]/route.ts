import { NextRequest, NextResponse } from 'next/server';

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace('/api', '') || 'http://localhost:1337';
const STRAPI_ENDPOINT = '/api/construction-sales';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) { headers['Authorization'] = authHeader; }
    
    const response = await fetch(`${STRAPI_BASE_URL}${STRAPI_ENDPOINT}/${params.id}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch construction-sales' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) { headers['Authorization'] = authHeader; }
    
    const response = await fetch(`${STRAPI_BASE_URL}${STRAPI_ENDPOINT}/${params.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update construction-sales' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) { headers['Authorization'] = authHeader; }
    
    const response = await fetch(`${STRAPI_BASE_URL}${STRAPI_ENDPOINT}/${params.id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      } else {
        const text = await response.text().catch(() => 'Unknown error');
        errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    if (response.status === 204) {
      return NextResponse.json({ success: true, message: 'Deleted successfully' }, { status: 200 });
    }

    const result = await response.json().catch(() => ({ success: true }));
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete construction-sales' },
      { status: 500 }
    );
  }
}
