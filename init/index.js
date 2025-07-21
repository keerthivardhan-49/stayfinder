const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require('../Models/listing');
const User = require("../Models/user.js");

main()
  .then(() => {
    console.log("✅ Connected to DB");
    initDB(); // ✅ Call initDB after connection
  })
  .catch((err) => {
    console.log("❌ Connection Error:", err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

async function initDB() {
  const ownerId = "685bb000dc262a5fd7efa023";

  // ✅ Find the user INSIDE the async function
  const user = await User.findById(ownerId);
  if (!user) {
    console.log("❌ User not found. Creating dummy user...");
    const newUser = new User({
      _id: ownerId,
      email: "owner@example.com",
      username: "ownerUser"
    });
    await newUser.save();
    console.log("✅ Dummy user created");
  } else {
    console.log("✅ Found user:", user.username);
  }

  // ✅ Initialize listings
  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId(ownerId)
  }));

  await Listing.insertMany(initData.data);
  console.log("✅ Listings data initialized");
}
