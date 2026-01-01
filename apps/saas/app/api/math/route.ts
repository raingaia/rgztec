import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { price, operation, params } = await req.json();
    let result = price;

    // Senin 90 mağazalık yapının özel hesaplamaları
    switch (operation) {
      case 'commission': // Satış komisyonu
        result = price * 0.10;
        break;
      case 'hardware-tax': // Donanım vergisi hesabı
        result = price * (params?.taxRate || 1.18);
        break;
      default:
        result = price;
    }

    return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Hesaplama yapılamadı" }, { status: 400 });
  }
}
