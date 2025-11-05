import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

interface FeeCalculation {
  totalTokenCost: number;
  adminFee: number;
  totalCost: number;
  estimatedRevenue: number;
}

// POST - Calculate campaign fee based on parameters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      targetParticipants,
      tokenRewardPerParticipant,
      feePercentage
    } = body;

    // Validation
    if (
      typeof targetParticipants !== 'number' ||
      targetParticipants <= 0
    ) {
      return NextResponse.json(
        { error: 'Target participants must be a positive number' },
        { status: 400 }
      );
    }

    if (
      typeof tokenRewardPerParticipant !== 'number' ||
      tokenRewardPerParticipant < 0
    ) {
      return NextResponse.json(
        { error: 'Token reward per participant must be non-negative' },
        { status: 400 }
      );
    }

    // Get current fee configuration if feePercentage not provided
    let currentFeePercentage = feePercentage;
    let minFeeAmount = 1;
    let maxFeeAmount = 1000;

    if (!currentFeePercentage) {
      try {
        const configResult = await query(`
          SELECT 
            survey_campaign_fee_percentage,
            minimum_fee_amount,
            maximum_fee_amount
          FROM admin_fee_config 
          ORDER BY updated_at DESC 
          LIMIT 1
        `);

        if (configResult.rows.length > 0) {
          const config = configResult.rows[0];
          currentFeePercentage = parseFloat(config.survey_campaign_fee_percentage);
          minFeeAmount = parseInt(config.minimum_fee_amount);
          maxFeeAmount = parseInt(config.maximum_fee_amount);
        } else {
          currentFeePercentage = 5; // Default 5%
        }
      } catch (error) {
        console.warn('Could not fetch fee configuration, using defaults:', error);
        currentFeePercentage = 5; // Default 5%
      }
    }

    // Calculate fees
    const totalTokenCost = targetParticipants * tokenRewardPerParticipant;
    let adminFee = Math.ceil(totalTokenCost * (currentFeePercentage / 100));
    
    // Apply min/max fee limits
    adminFee = Math.max(minFeeAmount, Math.min(maxFeeAmount, adminFee));
    
    const totalCost = totalTokenCost + adminFee;

    const calculation: FeeCalculation = {
      totalTokenCost,
      adminFee,
      totalCost,
      estimatedRevenue: adminFee
    };

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error calculating campaign fee:', error);
    return NextResponse.json(
      { error: 'Failed to calculate campaign fee' },
      { status: 500 }
    );
  }
}