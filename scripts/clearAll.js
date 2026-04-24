require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const readline = require('readline');

function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function clearAll() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  if (collections.length === 0) {
    console.log('No collections found — database already empty.');
    await mongoose.disconnect();
    return;
  }

  console.log(`\nThis will permanently delete ALL data in: ${collections.map(c => c.name).join(', ')}`);
  const answer = await confirm('Type "yes" to confirm: ');

  if (answer !== 'yes') {
    console.log('Aborted — no data was deleted.');
    await mongoose.disconnect();
    return;
  }

  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
    console.log(`Cleared: ${col.name}`);
  }
  console.log(`\nAll ${collections.length} collection(s) cleared.`);

  await mongoose.disconnect();
  console.log('Done.');
}

clearAll().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
