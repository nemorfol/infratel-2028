import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'InfratelMapApp/1.0 (for a personal project)', // Nominatim requires a custom User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return NextResponse.json({ lat: parseFloat(lat), lon: parseFloat(lon) });
    } else {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to geocode address', details: errorMessage }, { status: 500 });
  }
}
