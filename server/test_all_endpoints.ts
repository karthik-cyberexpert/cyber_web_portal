
const BASE_URL = 'http://localhost:3007/api';

async function testAll() {
    console.log('=== STARTING COMPREHENSIVE BACKEND TEST (RETRY) ===');

    try {
        // 1. Health Check
        const health = await fetch(`${BASE_URL}/health`);
        const healthData = await health.json();
        console.log('Health Check:', healthData);

        // 2. Admin Login
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

        // 3. Academic Setup (Batch) - Expects snake_case
        const batchRes = await fetch(`${BASE_URL}/academic/batches`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: `BATCH ${Date.now()}`,
                start_year: 2024,
                end_year: 2028,
                department_id: 1
            })
        });
        const batchData = await batchRes.json();
        console.log('Batch Creation:', batchRes.status, batchData);
        const batchId = batchData.id;

        // 4. Section Creation - Expects snake_case (based on schema)
        let sectionId = 1;
        if (batchId) {
             const sectionRes = await fetch(`${BASE_URL}/academic/sections`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    batch_id: batchId,
                    name: 'A',
                    capacity: 60
                })
            });
            const sectionData = await sectionRes.json();
            console.log('Section Creation:', sectionRes.status, sectionData);
            sectionId = sectionData.id || 1;
        }

        // 5. Faculty Creation - Expects mixed
        const facultyEmail = `faculty_${Date.now()}@test.com`;
        const facultyRes = await fetch(`${BASE_URL}/admin/faculty`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: facultyEmail,
                name: 'Test Faculty',
                employeeId: `EMP${Date.now()}`, // camelCase in controller
                designation: 'Assistant Professor',
                department: 1, // 'department' in controller
                phone: '1234567890',
                qualification: 'M.Tech',
                specialization: 'Cyber'
            })
        });
        const facultyData = await facultyRes.json();
        console.log('Faculty Creation:', facultyRes.status, facultyData);

        // 6. Student Creation - Expects snake_case
        const studentEmail = `student_${Date.now()}@test.com`;
        const studentRes = await fetch(`${BASE_URL}/students`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: studentEmail,
                name: 'Test Student',
                roll_number: `ROLL${Date.now()}`,
                batch_id: batchId || 1,
                section_id: sectionId || 1,
                phone: '9876543210'
            })
        });
        const studentData = await studentRes.json();
        console.log('Student Creation:', studentRes.status, studentData);

        // 7. Subject Creation - Expects snake_case
        const subjectRes = await fetch(`${BASE_URL}/academic/subjects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Ethical Hacking',
                code: `EH${Date.now()}`,
                semester: 1,
                credits: 3,
                type: 'theory',
                department_id: 1 // snake_case in controller
            })
        });
        const subjectData = await subjectRes.json();
        console.log('Subject Creation:', subjectRes.status, subjectData);

        // 8. Leave Request Test - Correted URL /leave/request
        const leaveRes = await fetch(`${BASE_URL}/leave/request`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                category: 'Casual Leave',
                start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                reason: 'Testing schema overhaul after seeding',
                duration_type: 'Full-Day'
            })
        });
        console.log('Leave Request Status:', leaveRes.status);

        // 9. Grievance Test - POST /api/grievance/ (or just /api/grievance)
        const grievanceRes = await fetch(`${BASE_URL}/grievance/`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Infrastructure Issue',
                description: 'Testing the new grievance schema with real data',
                target_role: 'Admin'
            })
        });
        console.log('Grievance Submission Status:', grievanceRes.status);

        console.log('=== TEST SUITE COMPLETED ===');

    } catch (error) {
        console.error('Test Suite Error:', error);
    }
}

testAll();
