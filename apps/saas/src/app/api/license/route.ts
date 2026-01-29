// apps/saas/src/app/api/license/route.ts
import { NextResponse } from 'next/server';
import { initializeProductJourney, sealOnChain } from '@rgz/licensing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hwid, sellerId, userId } = body;

    if (!hwid || !sellerId) {
      return NextResponse.json(
        { error: "Missing hardware information" }, 
        { status: 400 }
      );
    }

    // STEP 1: Execute license engine from root
    const journey = await initializeProductJourney(hwid, sellerId);

    // STEP 2: Seal on blockchain
    const blockchainSeal = await sealOnChain(hwid, journey.buyerApiKey);

    // STEP 3: Return payload
    return NextResponse.json({
      success: true,
      qrData: journey.qrData,
      apiKey: journey.buyerApiKey,
      blockchainTx: blockchainSeal.blockId,
      message: "Identity created and sealed on-chain successfully."
    });

  } catch (error) {
    console.error("Licensing error:", error);
    return NextResponse.json(
      { error: "Internal System Error" }, 
      { status: 500 }
    );
  }
}
