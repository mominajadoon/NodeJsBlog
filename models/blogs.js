const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");

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

// for existing blog
exports.existingBlog = async function (slug) {
  try {
    const collection = getDatabase().collection("blogs");
    const result = await collection.findOne({ slug });
    return result;
  } catch (error) {
    console.error("Error checking existing blog:", error);
    throw error;
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

    return blogs.map((like) => like.likedBlogs[0]);
  } catch (error) {
    console.error("Error counting user likes:", error);
    throw error;
  }
};
exports.blogExsits = async function (blogId) {
  collection = getDatabase().collection("blogs");
  const blogExists = await collection.findOne({
    _id: new ObjectId(blogId),
  });
  if (!blogExists) {
    return "non existing";
  } else {
    return "existing";
  }
};
