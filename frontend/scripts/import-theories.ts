/**
 * Script to import theories from JSON file into database
 * Run: npx ts-node scripts/import-theories.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface TheoryJson {
  id: number
  theory: string
  constructs_full?: string
  constructs_code?: string
  note_vi?: string
  group?: string
  domain?: string
  dependent_variable?: string
  reference?: string
  application_vi?: string
  definition_long?: string
  constructs_detailed?: Array<{ name: string; desc: string }>
  sample_scales?: string[]
  related_theories?: string[]
  limitations?: string
}

async function importTheories() {
  try {
    console.log('📖 Starting theories import...')
    
    // Read JSON file
    const jsonPath = path.join(process.cwd(), '..', 'model_theories', 'model', 'theories.json')
    console.log(`Reading file: ${jsonPath}`)
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`File not found: ${jsonPath}`)
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const theories: TheoryJson[] = JSON.parse(jsonData)
    
    console.log(`Found ${theories.length} theories to import`)
    
    // Clear existing theories (optional - comment out if you want to keep existing data)
    console.log('Clearing existing theories...')
    await prisma.theory.deleteMany({})
    
    // Import theories
    let imported = 0
    let skipped = 0
    
    for (const theory of theories) {
      try {
        await prisma.theory.create({
          data: {
            theory: theory.theory,
            constructsFull: theory.constructs_full || null,
            constructsCode: theory.constructs_code || null,
            noteVi: theory.note_vi || null,
            group: theory.group || null,
            domain: theory.domain || null,
            dependentVariable: theory.dependent_variable || null,
            reference: theory.reference || null,
            applicationVi: theory.application_vi || null,
            definitionLong: theory.definition_long || null,
            constructsDetailed: theory.constructs_detailed ? JSON.parse(JSON.stringify(theory.constructs_detailed)) : null,
            sampleScales: theory.sample_scales ? JSON.parse(JSON.stringify(theory.sample_scales)) : null,
            relatedTheories: theory.related_theories ? JSON.parse(JSON.stringify(theory.related_theories)) : null,
            limitations: theory.limitations || null,
          },
        })
        imported++
        if (imported % 50 === 0) {
          console.log(`  Imported ${imported}/${theories.length}...`)
        }
      } catch (error) {
        console.error(`Error importing theory "${theory.theory}":`, error)
        skipped++
      }
    }
    
    console.log(`\n✅ Import complete!`)
    console.log(`   Imported: ${imported}`)
    console.log(`   Skipped: ${skipped}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run import
importTheories()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

