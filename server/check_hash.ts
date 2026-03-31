import bcrypt from 'bcrypt';

const password = 'password123';
const saltRounds = 10;

async function check() {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Original Hash:', '$2b$10$XuSlmr1dCNHhfrnDI/DMQ4noxSuFhe6CCsIavAxdG/');
    console.log('New Hash:', hash);
    
    const match = await bcrypt.compare(password, '$2b$10$XuSlmr1dCNHhfrnDI/DMQ4noxSuFhe6CCsIavAxdG/');
    console.log('Match Result:', match);
}

check();
