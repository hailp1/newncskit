import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

interface FeeConfig {
  surveyCampaignFeePercentage: number;
  minimumFeeAmount: number;
  maximumFeeAmount: number;
  lastUpdated: string;
  updatedBy: string;
}

// GET - Retrieve current fee configuration
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        survey_campaign_fee_percentage,
        minimum_fee_amount,
        maximum_fee_amount,
        updated_at,
        updated_by
      FROM admin_fee_config 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      // Return default configuration if none exists
      const defaultConfig: FeeConfig = {
        surveyCampaignFeePercentage: 5,
        minimumFeeAmount: 1,
        maximumFeeAmount: 1000,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      };
      return NextResponse.json(defaultConfig);
    }

    const config = result.rows[0];
    const feeConfig: FeeConfig = {
      surveyCampaignFeePercentage: parseFloat(config.survey_campaign_fee_percentage),
      minimumFeeAmount: parseInt(config.minimum_fee_amount),
      maximumFeeAmount: parseInt(config.maximum_fee_amount),
      lastUpdated: config.updated_at,
      updatedBy: config.updated_by || 'system'
    };

    return NextResponse.json(feeConfig);
  } catch (error) {
    console.error('Error fetching fee configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update fee configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      surveyCampaignFeePercentage,
      minimumFeeAmount,
      maximumFeeAmount
    } = body;

    // Validation
    if (
      typeof surveyCampaignFeePercentage !== 'number' ||
      surveyCampaignFeePercentage < 0 ||
      surveyCampaignFeePercentage > 50
    ) {
      return NextResponse.json(
        { error: 'Fee percentage must be between 0 and 50' },
        { status: 400 }
      );
    }

    if (
      typeof minimumFeeAmount !== 'number' ||
      minimumFeeAmount < 0
    ) {
      return NextResponse.json(
        { error: 'Minimum fee amount must be non-negative' },
        { status: 400 }
      );
    }

    if (
      typeof maximumFeeAmount !== 'number' ||
      maximumFeeAmount < minimumFeeAmount
    ) {
      return NextResponse.json(
        { error: 'Maximum fee amount must be greater than minimum fee amount' },
        { status: 400 }
      );
    }

    // Create admin_fee_config table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS admin_fee_config (
        id SERIAL PRIMARY KEY,
        survey_campaign_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.00,
        minimum_fee_amount INTEGER NOT NULL DEFAULT 1,
        maximum_fee_amount INTEGER NOT NULL DEFAULT 1000,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_by VARCHAR(255) DEFAULT 'system'
      )
    `);

    // Insert new configuration (we keep history by inserting new records)
    const result = await query(`
      INSERT INTO admin_fee_config (
        survey_campaign_fee_percentage,
        minimum_fee_amount,
        maximum_fee_amount,
        updated_at,
        updated_by
      ) VALUES ($1, $2, $3, NOW(), $4)
      RETURNING *
    `, [
      surveyCampaignFeePercentage,
      minimumFeeAmount,
      maximumFeeAmount,
      'admin' // TODO: Get actual admin user ID from session
    ]);

    const updatedConfig = result.rows[0];
    const feeConfig: FeeConfig = {
      surveyCampaignFeePercentage: parseFloat(updatedConfig.survey_campaign_fee_percentage),
      minimumFeeAmount: parseInt(updatedConfig.minimum_fee_amount),
      maximumFeeAmount: parseInt(updatedConfig.maximum_fee_amount),
      lastUpdated: updatedConfig.updated_at,
      updatedBy: updatedConfig.updated_by
    };

    return NextResponse.json(feeConfig);
  } catch (error) {
    console.error('Error updating fee configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update fee configuration' },
      { status: 500 }
    );
  }
}