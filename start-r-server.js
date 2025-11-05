#!/usr/bin/env node

/**
 * Start R Analysis Server for NCSKIT
 * This script starts the R analysis server and verifies it's working
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting NCSKIT R Analysis Server...');

// Check if R is installed
function checkRInstallation() {
  return new Promise((resolve) => {
    const rProcess = spawn('R', ['--version'], { stdio: 'pipe' });
    
    rProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ R is installed and accessible');
        resolve(true);
      } else {
        console.log('❌ R is not installed or not in PATH');
        console.log('Please install R from: https://cran.r-project.org/');
        resolve(false);
      }
    });
    
    rProcess.on('error', () => {
      console.log('❌ R is not installed or not in PATH');
      resolve(false);
    });
  });
}

// Install required R packages
async function installRPackages() {
  console.log('📦 Installing required R packages...');
  
  const setupScript = path.join('backend', 'r_analysis', 'setup.R');
  
  if (!fs.existsSync(setupScript)) {
    console.log('⚠️ Setup script not found, creating basic setup...');
    
    const basicSetup = `
# Install required packages for NCSKIT Analysis
packages <- c(
  "plumber",
  "jsonlite", 
  "dplyr",
  "psych",
  "corrplot",
  "FactoMineR",
  "factoextra",
  "lavaan",
  "semPlot",
  "VIM",
  "mice",
  "car",
  "MASS"
)

install_if_missing <- function(pkg) {
  if (!require(pkg, character.only = TRUE)) {
    install.packages(pkg, dependencies = TRUE)
    library(pkg, character.only = TRUE)
  }
}

cat("Installing R packages for NCSKIT...\\n")
for (pkg in packages) {
  cat(paste("Installing", pkg, "...\\n"))
  install_if_missing(pkg)
}

cat("✅ All packages installed successfully!\\n")
`;
    
    fs.writeFileSync(setupScript, basicSetup);
  }
  
  return new Promise((resolve) => {
    const rProcess = spawn('Rscript', [setupScript], { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    rProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ R packages installed successfully');
        resolve(true);
      } else {
        console.log('❌ Failed to install R packages');
        resolve(false);
      }
    });
  });
}

// Start the R analysis server
async function startRServer() {
  console.log('🔧 Starting R Analysis Server...');
  
  const serverScript = path.join('backend', 'r_analysis', 'analysis_server.R');
  
  if (!fs.existsSync(serverScript)) {
    console.log('⚠️ Analysis server script not found, creating basic server...');
    
    const basicServer = `
# NCSKIT R Analysis Server
library(plumber)

#* @apiTitle NCSKIT Analysis API
#* @apiDescription Statistical analysis endpoints for NCSKIT platform

#* Health check endpoint
#* @get /health
function() {
  list(
    status = "healthy",
    timestamp = Sys.time(),
    version = R.version.string
  )
}

#* Basic descriptive statistics
#* @post /descriptive-stats
function(req) {
  data <- req$body
  if (is.null(data) || length(data) == 0) {
    return(list(error = "No data provided"))
  }
  
  # Convert to numeric if possible
  numeric_data <- as.numeric(data)
  
  if (all(is.na(numeric_data))) {
    return(list(error = "Data is not numeric"))
  }
  
  # Remove NA values
  clean_data <- numeric_data[!is.na(numeric_data)]
  
  if (length(clean_data) == 0) {
    return(list(error = "No valid numeric data"))
  }
  
  list(
    n = length(clean_data),
    mean = mean(clean_data),
    median = median(clean_data),
    sd = sd(clean_data),
    min = min(clean_data),
    max = max(clean_data),
    q25 = quantile(clean_data, 0.25),
    q75 = quantile(clean_data, 0.75)
  )
}

# Start the server
cat("🚀 Starting R Analysis Server on port 8000...\\n")
pr() %>%
  pr_run(host = "0.0.0.0", port = 8000)
`;
    
    fs.writeFileSync(serverScript, basicServer);
  }
  
  return new Promise((resolve) => {
    console.log('Starting R server on port 8000...');
    
    const rProcess = spawn('Rscript', [serverScript], { 
      stdio: 'inherit',
      cwd: process.cwd(),
      detached: true
    });
    
    // Give the server time to start
    setTimeout(() => {
      console.log('✅ R Analysis Server should be running on http://localhost:8000');
      console.log('📋 Available endpoints:');
      console.log('   - GET  /health - Health check');
      console.log('   - POST /descriptive-stats - Basic statistics');
      resolve(true);
    }, 3000);
    
    rProcess.on('error', (error) => {
      console.log('❌ Failed to start R server:', error.message);
      resolve(false);
    });
  });
}

// Test R server connection
async function testRServer() {
  console.log('🔍 Testing R server connection...');
  
  try {
    const response = await fetch('http://localhost:8000/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ R server is responding:', data);
      return true;
    } else {
      console.log('❌ R server returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to R server:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await testRServer();
    return;
  }
  
  // Check R installation
  const rInstalled = await checkRInstallation();
  if (!rInstalled) {
    process.exit(1);
  }
  
  // Install packages
  const packagesInstalled = await installRPackages();
  if (!packagesInstalled) {
    console.log('⚠️ Package installation failed, but continuing...');
  }
  
  // Start server
  const serverStarted = await startRServer();
  if (!serverStarted) {
    process.exit(1);
  }
  
  // Test connection
  setTimeout(async () => {
    await testRServer();
  }, 5000);
}

main().catch(console.error);