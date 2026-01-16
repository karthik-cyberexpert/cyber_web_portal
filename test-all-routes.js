const http = require('http');

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
  '0.0.0.0',
];

// Port to test
const PORT = 3000;
const BACKEND_PORT = 3007;

// Routes to test (frontend)
const frontendRoutes = [
  '/',
  '/login',
  '/admin',
  '/admin/dashboard',
  '/student',
  '/student/dashboard',
  '/tutor',
  '/tutor/dashboard',
  '/faculty',
];

// Backend API routes to test
const backendRoutes = [
  '/api/health',
  '/api/auth/me',
  '/api/student-stats',
  '/api/leave/tutor',
  '/api/od/tutor',
  '/api/notifications',
];

let results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function testRequest(host, port, path, type = 'GET') {
  return new Promise((resolve) => {
    const options = {
      host,
      port,
      path,
      method: type,
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          headers: res.headers,
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
        error: 'Request timeout',
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log(`\n${colors.bright}${colors.blue}================================================================${colors.reset}`);
  console.log(`${colors.bright}  COMPREHENSIVE NETWORK TEST SUITE  ${colors.reset}`);
  console.log(`${colors.blue}================================================================${colors.reset}\n`);

  console.log(`Testing ${ipsToTest.length} IPs × ${frontendRoutes.length + backendRoutes.length} routes = ${ipsToTest.length * (frontendRoutes.length + backendRoutes.length)} tests\n`);

  // Test Frontend (Port 3000)
  console.log(`${colors.bright}${colors.yellow}━━━ FRONTEND TESTS (Port ${PORT}) ━━━${colors.reset}\n`);
  
  for (const ip of ipsToTest) {
    console.log(`${colors.bright}Testing IP: ${ip}${colors.reset}`);
    
    for (const route of frontendRoutes) {
      results.total++;
      const result = await testRequest(ip, PORT, route);
      
      const testName = `  ${route}`;
      
      if (result.success) {
        if (result.status === 200 || result.status === 302 || result.status === 304) {
          console.log(`${colors.green}✓${colors.reset} ${testName} - Status: ${result.status}`);
          results.passed++;
          results.details.push({ ip, route, status: 'PASS', code: result.status });
        } else if (result.status === 401 || result.status === 403) {
          console.log(`${colors.yellow}⚠${colors.reset} ${testName} - Auth required (${result.status})`);
          results.passed++;
          results.details.push({ ip, route, status: 'AUTH', code: result.status });
        } else {
          console.log(`${colors.red}✗${colors.reset} ${testName} - Status: ${result.status}`);
          results.failed++;
          results.details.push({ ip, route, status: 'FAIL', code: result.status, body: result.body });
        }
      } else {
        console.log(`${colors.red}✗${colors.reset} ${testName} - Error: ${result.error}`);
        results.failed++;
        results.details.push({ ip, route, status: 'ERROR', error: result.error });
      }
    }
    console.log('');
  }

  // Test Backend (Port 3007)
  console.log(`${colors.bright}${colors.yellow}━━━ BACKEND API TESTS (Port ${BACKEND_PORT}) ━━━${colors.reset}\n`);
  
  for (const ip of ipsToTest) {
    console.log(`${colors.bright}Testing IP: ${ip}${colors.reset}`);
    
    for (const route of backendRoutes) {
      results.total++;
      const result = await testRequest(ip, BACKEND_PORT, route);
      
      const testName = `  ${route}`;
      
      if (result.success) {
        if (result.status === 200) {
          console.log(`${colors.green}✓${colors.reset} ${testName} - Status: ${result.status}`);
          results.passed++;
          results.details.push({ ip, route, status: 'PASS', code: result.status });
        } else if (result.status === 401 || result.status === 403) {
          console.log(`${colors.yellow}⚠${colors.reset} ${testName} - Auth required (${result.status})`);
          results.passed++;
          results.details.push({ ip, route, status: 'AUTH', code: result.status });
        } else {
          console.log(`${colors.red}✗${colors.reset} ${testName} - Status: ${result.status}`);
          results.failed++;
          results.details.push({ ip, route, status: 'FAIL', code: result.status, body: result.body });
        }
      } else {
        console.log(`${colors.red}✗${colors.reset} ${testName} - Error: ${result.error}`);
        results.failed++;
        results.details.push({ ip, route, status: 'ERROR', error: result.error });
      }
    }
    console.log('');
  }

  // Summary
  console.log(`${colors.bright}${colors.blue}================================================================${colors.reset}`);
  console.log(`${colors.bright}  TEST SUMMARY  ${colors.reset}`);
  console.log(`${colors.blue}================================================================${colors.reset}\n`);
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%\n`);

  // Failed tests details
  if (results.failed > 0) {
    console.log(`${colors.bright}${colors.red}FAILED TESTS:${colors.reset}`);
    const failed = results.details.filter(d => d.status === 'FAIL' || d.status === 'ERROR');
    failed.forEach((f, i) => {
      console.log(`\n${i + 1}. ${f.ip}${f.route}`);
      if (f.error) {
        console.log(`   Error: ${f.error}`);
      } else {
        console.log(`   Status: ${f.code}`);
        if (f.body) console.log(`   Body: ${f.body.substring(0, 100)}...`);
      }
    });
  }

  console.log('\n');
}

runTests();
