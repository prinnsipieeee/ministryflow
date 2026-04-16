const bcrypt = require('bcryptjs');

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const hash2 = await bcrypt.hash('admin1-123', 10);
  console.log(hash2);
  console.log(hash);
}
main();