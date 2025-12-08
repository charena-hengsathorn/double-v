import { NextRequest, NextResponse } from 'next/server';

// Get Strapi URL - remove /api if present (we add it back)
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace('/api', '') || 'http://localhost:1337';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get Authorization header from incoming request
    const authHeader = request.headers.get('authorization');
    
    // Build headers for Strapi request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Forward Authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${STRAPI_BASE_URL}/api/sales/${params.id}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
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
    console.error('Error fetching sale:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sale' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Get Authorization header from incoming request
    const authHeader = request.headers.get('authorization');
    
    // Build headers for Strapi request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Forward Authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${STRAPI_BASE_URL}/api/sales/${params.id}`, {
      method: 'PUT',
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
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update sale' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get Authorization header from incoming request
    const authHeader = request.headers.get('authorization');
    
    // Build headers for Strapi request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Forward Authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${STRAPI_BASE_URL}/api/sales/${params.id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
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
    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete sale' },
      { status: 500 }
    );
  }
}
