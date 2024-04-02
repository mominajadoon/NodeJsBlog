const { ObjectId } = require("mongodb");
const { connectDatabase, getDatabase } = require("../config/db");

let collection;

connectDatabase()
  .then(() => {
    collection = getDatabase().collection("like");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

exports.like = async function (blogId, userId) {
  try {
    if (!collection) {
      console.error("Database connection not established");
      return { error: "Database connection not established" };
    }
    // Check if the user has already liked the blog post
    const existingLike = await collection.findOne({
      _userId: userId,
      _blogId: blogId,
    });
    if (existingLike) {
      return { error: "You have already liked this blog post" };
    }
    const result = await collection.insertOne({
      _userId: userId,
      _blogId: blogId,
    });
    return { message: "blog liked" };
  } catch (error) {
    console.error("Error liking blog:", error);
    return { error: "Internal server error" };
  }
};
// module.exports = { connectDatabase };