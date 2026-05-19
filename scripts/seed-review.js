const cloudbase = require("@cloudbase/node-sdk").init({
  env: "cloudbase-d2gs4fpbhca51e19f",
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY
});

const db = cloudbase.database();

const OPENID = "o6zAJszAcvHYB3PfDZxsxw5kh1ec";
const today = "2026-05-18";

const testWords = [
  "lady", "gentleman", "performer", "finger", "teenager",
  "unless", "performance", "blood", "perform", "viewer"
];

async function seed() {
  const schedule = {};
  testWords.forEach((w, i) => {
    schedule[w] = { stage: i < 5 ? 0 : 1, dueDate: today };
  });

  const res = await db.collection("user_progress")
    .where({ _openid: OPENID })
    .get();

  if (res.data.length > 0) {
    const record = res.data[0];
    const existing = record.schedule || {};
    // merge, keeping existing entries
    Object.assign(existing, schedule);
    await db.collection("user_progress").doc(record._id).update({
      data: { schedule: existing, lastStudyDate: db.serverDate() }
    });
    console.log("✅ Updated existing record, added", testWords.length, "words");
  } else {
    await db.collection("user_progress").add({
      data: {
        _openid: OPENID,
        mastered: [],
        favorites: [],
        reviewed: [],
        schedule,
        lastStudyDate: db.serverDate()
      }
    });
    console.log("✅ Created new record with", testWords.length, "words");
  }
}

seed().catch(err => console.error("❌", err));
