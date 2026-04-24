require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const db = mongoose.connection.db;

  // Find user by email
  const user = await db.collection('users').findOne({ email: 'evschathurya2006@gmail.com' });
  if (!user) { console.log('User not found.'); process.exit(1); }
  console.log(`User: ${user.name} (${user._id})`);

  // Get all enrollments for this user
  const enrollments = await db.collection('enrollments')
    .find({ user: user._id })
    .sort({ enrolledAt: 1 })
    .toArray();

  console.log(`Total enrollments found: ${enrollments.length}`);

  // Group by courseId
  const byCourse = {};
  for (const e of enrollments) {
    const key = e.course.toString();
    if (!byCourse[key]) byCourse[key] = [];
    byCourse[key].push(e);
  }

  let totalRemoved = 0;
  for (const [courseId, entries] of Object.entries(byCourse)) {
    if (entries.length <= 1) continue;

    // Keep the one with highest progress; ties: keep earliest enrolledAt (index 0, already sorted)
    entries.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    const keep = entries[0];
    const remove = entries.slice(1);

    console.log(`\nCourse ${courseId}: ${entries.length} duplicates found`);
    console.log(`  Keeping  _id: ${keep._id} (progress: ${keep.progress}%)`);

    for (const dup of remove) {
      console.log(`  Removing _id: ${dup._id} (progress: ${dup.progress}%)`);
      await db.collection('enrollments').deleteOne({ _id: dup._id });

      // Fix enrollmentCount on the course
      await db.collection('courses').updateOne(
        { _id: dup.course },
        { $inc: { enrollmentCount: -1 } }
      );
    }
    totalRemoved += remove.length;
  }

  if (totalRemoved === 0) {
    console.log('\nNo duplicates found — nothing removed.');
  } else {
    console.log(`\nDone. Removed ${totalRemoved} duplicate enrollment(s).`);
  }

  await mongoose.disconnect();
}

run().catch(err => { console.error(err.message); process.exit(1); });
