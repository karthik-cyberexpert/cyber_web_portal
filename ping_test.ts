async function ping() {
    try {
        const res = await fetch('http://localhost:3007/api/students/ping-profile');
        if (res.status === 404) {
             console.log('RESULT: 404 Not Found');
             return;
        }
        const data = await res.json();
        console.log('RESULT:', JSON.stringify(data));
    } catch (err: any) {
        console.log('RESULT: ERROR', err.message);
    }
}
ping();
