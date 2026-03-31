
const BASE_URL = 'http://localhost:3007/api';

async function verifyFixes() {
    console.log('=== STARTING 500 ERROR RESOLUTION VERIFICATION ===');

    try {
        // 1. Admin Login
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@css.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        if (!loginData.token) {
            console.error('Login Failed!', loginData);
            return;
        }
        const token = loginData.token;
        console.log('Login Success!');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. Test Grievances (GET)
        const grievanceRes = await fetch(`${BASE_URL}/grievance?role=admin`, { headers });
        const grievanceData = await grievanceRes.json();
        console.log('Grievance GET Status:', grievanceRes.status);
        if (grievanceRes.status === 500) {
            console.error('Grievance GET Error:', grievanceData);
        } else {
            console.log('Grievance GET SUCCESS');
        }

        // 3. Test Lost & Found (GET)
        const lostRes = await fetch(`${BASE_URL}/lost-and-found`, { headers });
        const lostData = await lostRes.json();
        console.log('Lost & Found GET Status:', lostRes.status);
        if (lostRes.status === 500) {
            console.error('Lost & Found GET Error:', lostData);
        } else {
            console.log('Lost & Found GET SUCCESS');
        }

        // 4. Test Theory Internal Marks (GET)
        // Note: batchId=2&semester=1 were the parameters in the error logs
        const marksRes = await fetch(`${BASE_URL}/academic/marks/internals/theory?batchId=2&semester=1`, { headers });
        const marksData = await marksRes.json();
        console.log('Theory Internal Marks GET Status:', marksRes.status);
        if (marksRes.status === 500) {
            console.error('Theory Internal Marks GET Error:', marksData);
        } else {
            console.log('Theory Internal Marks GET SUCCESS');
        }

        console.log('=== VERIFICATION COMPLETED ===');

    } catch (error) {
        console.error('Verification Error:', error);
    }
}

verifyFixes();
