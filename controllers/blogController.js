const Blog = require("../models/blogs");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
const { default: slugify } = require("slugify");
const { connectDatabase, getDatabase } = require("../config/db");
const { like } = require("../models/like");
const { dislike } = require("../models/dislike");
const URL = require("url");
const { log } = require("util");
let collection;

// Connect to the database
connectDatabase()
  .then(() => {
    collection = getDatabase().collection("blogs");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
// const databaseUrl = process.env.MONGO_URL;
// const client = new MongoClient(databaseUrl);

// const database = client.db("Sblogs");
// const collection = database.collection("blogs");

exports.getAllBlogs = async function (req, res) {
  try {
    const allBlogs = await collection.find().toArray();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(allBlogs));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};

exports.getSingleBlog = async function (req, res) {
  try {
    const { pathname } = URL.parse(req.url, true);
    const parts = pathname.split("/");
    const id = parts[parts.length - 1];
    console.log(id);
    // Validate if id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid user ID" }));
    }
    const blog = await collection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      res.end(JSON.stringify("Blog post not found"));
      return (res.status = 404);
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(blog));
  } catch (error) {
    console.log(error);
    res.end(JSON.stringify("Blog post not found"));
    return (res.status = 404);
  }
};
exports.createBlog = async function (req, res) {
  let bd = "";
  req.on("data", (chunk) => {
    bd += chunk.toString();
  });
  req.on("end", async () => {
    try {
      const { title, body } = JSON.parse(bd);
      // Check if title or body is empty
      if (!title || !body) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and body are required" }));
        return;
      }

      const slug = slugify(title, "-");
      console.log(slug);
      const result = await collection.insertOne({
        _title: title,
        _body: body,
        _slug: slug,
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Blog created" }));

      // Do not close the MongoDB connection here
    } catch (err) {
      console.log(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
};

exports.updateBlog = function (req, res) {
  const blogId = req.url.split("/")[3];
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const blogDataFromUser = JSON.parse(body);
      const { title, body: blogBody } = blogDataFromUser;
      if (!title || !blogBody) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and body are required" }));
        return;
      }
      const filter = { _id: new ObjectId(blogId) }; // Assuming ObjectId is imported
      const update = { $set: blogDataFromUser };

      const result = await collection.updateOne(filter, update);

      if (result.matchedCount === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Blog not found" }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Blog updated" }));
      }
    } catch (err) {
      console.log(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
};
exports.deleteBlog = async function (req, res) {
  try {
    const blogId = req.url.split("/")[3];
    const query = { _id: new ObjectId(blogId) }; // Construct a query object

    const deleteBlog = await collection.deleteOne(query);

    if (deleteBlog.deletedCount === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Blog not found" }));
    } else {
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Blog deleted" }));
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
exports.like = async function (req, res) {
  try {
    const parts = req.url.split("/");
    const blogId = parts[parts.length - 1];
    const userId = parts[parts.length - 2];
    console.log(blogId);
    const result = await like(blogId, userId);

    if (result.error) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: result.error }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: result.message }));
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};

// Dislike function
exports.dislike = async function (req, res) {
  try {
    const parts = req.url.split("/");
    const blogId = parts[parts.length - 1];
    const userId = parts[parts.length - 2];
    const result = await dislike(blogId, userId);

    if (result.error) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: result.error }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: result.message }));
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};

// // Like function
// exports.like = async function (req, res) {
//   try {
//     const parts = req.url.split("/");
//     const blogId = parts[parts.length - 1];
//     const query = { _id: new ObjectId(blogId) };
//     console.log(blogId);

//     const update = { $inc: { likesCount: 1 } }; // Increment likesCount by 1

//     const result = await collection.updateOne(query, update);

//     if (result.matchedCount === 0) {
//       res.writeHead(404, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ error: "Blog not found" }));
//     } else {
//       res.writeHead(200, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ message: "Blog liked" }));
//     }
//   } catch (error) {
//     console.error(error);
//     res.writeHead(500, { "Content-Type": "application/json" });
//     res.end(JSON.stringify({ error: "Internal server error" }));
//   }
// };
// // Dislike function
// exports.dislike = async function (req, res) {
//   try {
//     const blogId = req.url.split("/")[3];
//     const query = { _id: new ObjectId(blogId) };

//     const update = { $inc: { dislikesCount: 1 } }; // Increment dislikesCount by 1

//     const result = await collection.updateOne(query, update);

//     if (result.matchedCount === 0) {
//       res.writeHead(404, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ error: "Blog not found" }));
//     } else {
//       res.writeHead(200, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ message: "Blog disliked" }));
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

// // like func
// exports.like = async (req, res) => {
//   try {
//   } catch (error) {}
// };

// // dislike func
// exports.dislike = async (req, res) => {
//   try {
//   } catch (error) {}
// };
