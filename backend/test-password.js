const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('Generated hash:', hash);
  
  // Test if the hash works
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash validation test:', isValid);
  
  // Test with the hash from our init.sql
  const testHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const testValid = await bcrypt.compare(password, testHash);
  console.log('Test with our hash:', testValid);
}

testPassword(); 