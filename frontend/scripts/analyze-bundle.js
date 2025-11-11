/**
 * Bundle Size Analysis Script
 * Run after build to analyze bundle composition
 */

const fs = require('fs')
const path = require('path')

function getDirectorySize(dirPath) {
  let totalSize = 0
  
  function traverse(currentPath) {
    const stats = fs.statSync(currentPath)
    
    if (stats.isFile()) {
      totalSize += stats.size
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath)
      files.forEach(file => {
        traverse(path.join(currentPath, file))
      })
    }
  }
  
  traverse(dirPath)
  return totalSize
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function analyzeBuild() {
  const buildDir = path.join(__dirname, '../.next')
  
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.')
    process.exit(1)
  }
  
  console.log('📊 Bundle Size Analysis\n')
  console.log('=' .repeat(50))
  
  // Analyze static files
  const staticDir = path.join(buildDir, 'static')
  if (fs.existsSync(staticDir)) {
    const staticSize = getDirectorySize(staticDir)
    console.log(`\n📦 Static Files: ${formatBytes(staticSize)}`)
    
    // Analyze chunks
    const chunksDir = path.join(staticDir, 'chunks')
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir)
        .filter(file => file.endsWith('.js'))
        .map(file => ({
          name: file,
          size: fs.statSync(path.join(chunksDir, file)).size
        }))
        .sort((a, b) => b.size - a.size)
      
      console.log('\n📦 Largest Chunks:')
      chunks.slice(0, 10).forEach((chunk, i) => {
        console.log(`  ${i + 1}. ${chunk.name}: ${formatBytes(chunk.size)}`)
      })
    }
  }
  
  // Analyze pages
  const pagesDir = path.join(buildDir, 'server/pages')
  if (fs.existsSync(pagesDir)) {
    const pagesSize = getDirectorySize(pagesDir)
    console.log(`\n📄 Pages: ${formatBytes(pagesSize)}`)
  }
  
  // Total build size
  const totalSize = getDirectorySize(buildDir)
  console.log(`\n📊 Total Build Size: ${formatBytes(totalSize)}`)
  console.log('=' .repeat(50))
  
  // Recommendations
  console.log('\n💡 Recommendations:')
  console.log('  1. Chunks > 200KB should be code-split')
  console.log('  2. Use dynamic imports for large components')
  console.log('  3. Lazy load heavy dependencies (D3, XLSX, Chart.js)')
  console.log('  4. Optimize images with Next.js Image component')
  console.log('  5. Remove unused dependencies')
  
  console.log('\n✅ Analysis complete!')
}

analyzeBuild()
