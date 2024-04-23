const { ObjectId } = require("mongodb");
const { connectDatabase, getDatabase } = require("../config/db");

let collection;

connectDatabase()
  .then(() => {
    collection = getDatabase().collection("dislikes");
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

    // Check if the user has already disliked the blog post
    const existingdisLike = await collection.findOne({
      _userId: new ObjectId(userId),
      _blogId: new ObjectId(blogId),
    });
    if (existingdisLike) {
      return "already Disliked";
    }

    await collection.insertOne({
      _userId: new ObjectId(userId),
      _blogId: new ObjectId(blogId),
    });
    return { message: "blog Disliked" };
  } catch (error) {
    console.error("Error disliking blog:", error);
    return { error: "Internal server error" };
  }
};
