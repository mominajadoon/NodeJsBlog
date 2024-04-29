const { ObjectId } = require("mongodb");
const { connectDatabase, getDatabase } = require("../config/db");

let collection;

connectDatabase()
  .then(() => {
    collection = getDatabase().collection("likes");
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
      _userId: new ObjectId(userId),
      _blogId: new ObjectId(blogId),
    });
    if (existingLike) {
      return "already liked";
    }

    await collection.insertOne({
      _userId: new ObjectId(userId),
      _blogId: new ObjectId(blogId),
    });
    return { message: "blog liked" };
  } catch (error) {
    console.error("Error liking blog:", error);
    return { error: "Internal server error" };
  }
};
// module.exports = { connectDatabase };
