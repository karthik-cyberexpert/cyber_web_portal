import bcrypt from 'bcrypt';

const hash = '$2b$10$XuSlmr1dCNHhfrnDI/DMQ4noxSuFhe6CCsIavAxdG/'; // Hash from SQL file
const password = 'password123';

console.log(`Testing password: '${password}' against hash: '${hash}'`);

bcrypt.compare(password, hash).then(result => {
    console.log(`Match Result: ${result}`);
    if (!result) {
        console.log("Generating new hash for 'password123'...");
        bcrypt.hash(password, 10).then(newHash => {
            console.log(`New Hash: ${newHash}`);
        });
    }
}).catch(err => {
    console.error("Error comparing:", err);
});
