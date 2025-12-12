import { NextRequest, NextResponse } from 'next/server';

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace('/api', '') || 'http://localhost:1337';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) { headers['Authorization'] = authHeader; }
    
    const response = await fetch(`${STRAPI_BASE_URL}/api/billings/${params.id}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
      }
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch billing' },
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
    
    const response = await fetch(`${STRAPI_BASE_URL}/api/billings/${params.id}`, {
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
      { error: error.message || 'Failed to update billing' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) { headers['Authorization'] = authHeader; }
    
    const strapiUrl = `${STRAPI_BASE_URL}/api/billings/${params.id}`;
    console.log(`[DELETE] Forwarding delete request to Strapi: ${strapiUrl}`);
    console.log(`[DELETE] Request headers:`, JSON.stringify(headers, null, 2));
    
    const response = await fetch(strapiUrl, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });

    console.log(`[DELETE] Strapi response status: ${response.status}`);
    console.log(`[DELETE] Strapi response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      } else {
        const text = await response.text().catch(() => 'Unknown error');
        errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error(`[DELETE] Strapi error response:`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    // Strapi DELETE returns 204 No Content on success (empty body)
    if (response.status === 204) {
      console.log(`[DELETE] Successfully deleted billing ${params.id} from Strapi (204 No Content)`);
      return NextResponse.json({ success: true, message: 'Deleted successfully' }, { status: 200 });
    }

    // If status is 200, try to parse JSON response
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log(`[DELETE] Successfully deleted billing ${params.id} from Strapi with response:`, result);
        return NextResponse.json(result, { status: 200 });
      }
    } catch (e) {
      // If JSON parsing fails, still return success since status is OK
      console.log(`[DELETE] Successfully deleted billing ${params.id} from Strapi (non-JSON response)`);
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`[DELETE] Error deleting billing ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete billing' },
      { status: 500 }
    );
  }
}

