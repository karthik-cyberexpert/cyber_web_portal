import { getStudentProfile } from './server/student.controller.js';
import { Request, Response } from 'express';

async function verifyFix() {
    const mockReq = {
        user: { id: 1 } // Assuming ID 1 is a student
    } as any;
    
    const mockRes = {
        status: (code: number) => ({
            json: (data: any) => {
                console.log(`Response Status: ${code}`);
                console.log('Response Data:', JSON.stringify(data, null, 2));
            }
        }),
        json: (data: any) => {
            console.log('Response Data:', JSON.stringify(data, null, 2));
        }
    } as any;

    console.log('Testing getStudentProfile...');
    try {
        await getStudentProfile(mockReq, mockRes);
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

verifyFix();
