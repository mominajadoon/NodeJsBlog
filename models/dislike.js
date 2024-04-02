const { ObjectId } = require("mongodb");
const { connectDatabase, getDatabase } = require("../config/db");

let collection;

connectDatabase()
  .then(() => {
    collection = getDatabase().collection("dislike");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

exports.dislike = async function (blogId, userId) {
  try {
    if (!collection) {
      console.error("Database connection not established");
      return { error: "Database connection not established" };
    }
    // Check if the user has already liked the blog post
    const existingdisLike = await collection.findOne({
      _userId: userId,
      _blogId: blogId,
    });
    if (existingdisLike) {
      return { error: "You have already disliked this blog post" };
    }
    const result = await collection.insertOne({
      _userId: userId,
      _blogId: blogId,
    });
    return { message: "blog Disliked" };
  } catch (error) {
    console.error("Error liking blog:", error);
    return { error: "Internal server error" };
  }
};
