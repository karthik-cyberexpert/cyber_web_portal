import http from 'http';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// List of all IPs to test
const ipsToTest = [
  'localhost',
  '127.0.0.1',
  '192.168.192.1',
  '10.69.92.5',
];

// Port to test
const PORT = 3000;
const BACKEND_PORT = 3007;

// Routes to test (frontend)
const frontendRoutes = [
  '/',
  '/login',
  '/admin',
  '/student',
  '/tutor',
  '/faculty',
];

// Backend API routes to test
const backendRoutes = [
  '/api/health',
  '/api/notifications',
];

let results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function testRequest(host, port, path) {
  return new Promise((resolve) => {
    const options = {
      host,
      port,
      path,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          body: data.substring(0, 200),
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'timeout',
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log(`\\n${ colors.bright}${colors.blue}===== NETWORK TEST SUITE =====${colors.reset}\\n`);

  // Test Frontend
  console.log(`${colors.yellow}FRONTEND (Port ${PORT}):${colors.reset}\\n`);
  
  for (const ip of ipsToTest) {
    console.log(`Testing ${ip}:`);
    
    for (const route of frontendRoutes) {
      results.total++;
      const result = await testRequest(ip, PORT, route);
      
      if (result.success && (result.status === 200 || result.status === 304)) {
        console.log(`  ${colors.green}✓${colors.reset} ${route} - ${result.status}`);
        results.passed++;
      } else if (result.success) {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${route} - ${result.status}`);
        results.passed++;
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${route} - ${result.error}`);
        results.failed++;
        results.details.push({ ip, port: PORT, route, error: result.error });
      }
    }
    console.log('');
  }

  // Test Backend
  console.log(`${colors.yellow}BACKEND (Port ${BACKEND_PORT}):${colors.reset}\\n`);
  
  for (const ip of ipsToTest) {
    console.log(`Testing ${ip}:`);
    
    for (const route of backendRoutes) {
      results.total++;
      const result = await testRequest(ip, BACKEND_PORT, route);
      
      if (result.success && result.status === 200) {
        console.log(`  ${colors.green}✓${colors.reset} ${route} - ${result.status}`);
        results.passed++;
      } else if (result.success) {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${route} - ${result.status}`);
        results.passed++;
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${route} - ${result.error}`);
        results.failed++;
        results.details.push({ ip, port: BACKEND_PORT, route, error: result.error });
      }
    }
    console.log('');
  }

  // Summary
  console.log(`${colors.blue}================================${colors.reset}`);
  console.log(`Total: ${results.total} | ${colors.green}Pass: ${results.passed}${colors.reset} | ${colors.red}Fail: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100 ).toFixed(1)}%\\n`);

  if (results.failed > 0) {
    console.log(`${colors.red}FAILED TESTS:${colors.reset}`);
    results.details.forEach(f => {
      console.log(`  ${f.ip}:${f.port}${f.route} - ${f.error}`);
    });
  }
}

runTests();
