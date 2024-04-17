const { ObjectId, Long } = require("mongodb");
const { connectDatabase, getDatabase } = require("../config/db");
const { like } = require("./like");

// Get all blogs
exports.getAllBlogs = async function () {
  try {
    collection = getDatabase().collection("blogs");
    const user = await collection.find({}).toArray();
    return user;
  } catch (error) {
    console.log("Error getting all blogs: ", error);
  }
};

// for single blog
exports.findSingle = async function (blogId) {
  try {
    collection = getDatabase().collection("blogs");
    const user = await collection.findOne({ _id: new ObjectId(blogId) });
    return user;
  } catch (error) {
    console.log("Error getting single blog: ", error);
  }
};

// create new blog
exports.createBlog = async function (title, body, slug) {
  try {
    collection = getDatabase().collection("blogs");
    const user = await collection.insertOne({ title, body, slug });
    return user;
  } catch (error) {
    console.log("Error creating a blog post: ", error);
  }
};

// update blogs
exports.updateBlog = async function (blogId, updatedFields) {
  try {
    collection = getDatabase().collection("blogs");
    const result = await collection.updateOne(
      { _id: new ObjectId(blogId) },
      { $set: updatedFields }
    );
    return result;
  } catch (error) {
    console.log("Error updating blog: ", error);
  }
};

// delete blogs
exports.deleteBlog = async function (blogId) {
  try {
    collection = getDatabase().collection("blogs");
    const result = await collection.deleteOne({ _id: new ObjectId(blogId) });
    return result;
  } catch (error) {
    console.log("Error Deleting Blog: ", error);
  }
};

// count user likes
exports.countUserLikes = async function (userId) {
  try {
    const likeCollection = getDatabase().collection("likes");
    const blogs = await likeCollection
      .aggregate([
        { $match: { _userId: new ObjectId(userId) } },
        // Lookup to join with the blogs collection
        {
          $lookup: {
            from: "blogs",
            localField: "_blogId",
            foreignField: "_id",
            as: "likedBlogs",
          },
        },
      ])
      .toArray();
    // return blogs;
    return blogs.map((a) => a.likedBlogs[0]);
    // Match likes for the specific user

    // Project to output only the necessary fields

    // Find likes for the specific user
    // const likes = await likeCollection
    //   .find({
    //     _userId: new ObjectId(userId),
    //   })
    //   .toArray();

    // const blogIds = likes.map((like) => like._blogId); // Extract blogIds from likes

    // const blogCollection = getDatabase().collection("blogs");

    // // Find and return liked blogs using the blogIds
    // const likedBlogs = await blogCollection
    //   .find({ _id: { $in: blogIds } })
    //   .toArray();

    // return likedBlogs;
  } catch (error) {
    console.error("Error counting user likes:", error);
    throw error;
  }
};
