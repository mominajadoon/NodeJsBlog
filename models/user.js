const { connectDatabase, getDatabase } = require("../config/db");
const bcrypt = require("bcrypt");

// let collection;
// Function to sign up a new user
exports.signupUser = async function (email, password) {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    collection = getDatabase().collection("users");

    // Insert the user into the database with the hashed password
    const result = await collection.insertOne({
      email,
      password: hashedPassword,
    });

    return result;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};

// Function to log in a user
exports.loginUser = async function (email, password) {
  try {
    collection = getDatabase().collection("users");

    // Find the user by email
    const user = await collection.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid password");
    }
    return user;
  } catch (error) {
    console.error("Error logging in user:", error);
  }
};
exports.findUserByEmail = async function (email) {
  collection = getDatabase().collection("users");
  const user = await collection.findOne({ email });
  return user;
};
