const Post = require('../Models/Post');
const Comment = require('../Models/Comment');
const User = require('../Models/User');
const cloudinary = require('../config/cloudinary');
const upload = require('../Utility/multer');

// Endpoint :-

// ‘POST’
// http://localhost:5000/api/posts/

// Request :-

// {
//   "title": "test post 3",
//   "content": "test post 3 content",
//   "tags": ["tag1", "tag2"],
//   "image" : "https://picsum.photos/seed/picsum/200/300"
// }

// Response :-
// (201 Created)
// {
//     "title": "test post 3",
//     "content": "test post 3 content",
//     "tags": [
//         "tag1",
//         "tag2"
//     ],
//     "image": "https://picsum.photos/seed/picsum/200/300",
//     "author": "67fceb2a2a4c51f2edecd79e",
//     "likes": [],
//     "_id": "67fd11fc2a4c51f2edecd7a8",
//     "comments": [],
//     "createdAt": "2025-04-14T13:47:40.683Z",
//     "updatedAt": "2025-04-14T13:47:40.683Z",
//     "__v": 0
// }

async function createPost(req, res) {
  try {
    const { title, content, tags, image } = req.body;
    console.log('req.user:', req.user);
    const author = req.user.id;

    let imageUrl = '';
    let imagePublicId = '';

    //for testing purposes, we can use the image url from the request body. In production, we should use multer to handle file uploads and then upload the file to cloudinary.
    if (image) {
      imageUrl = image;
    }
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'posts',
        tags: [`user_${author}`],
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const newPost = new Post({
      author,
      title,
      content,
      tags: tags || [],
      image: imageUrl,
      imagePublicId,
    });
    await newPost.save();
    // Response :-
    // (201 Created)
    // {
    //     "title": "test post 3",
    //     "content": "test post 3 content",
    //     "tags": [
    //         "tag1",
    //         "tag2"
    //     ],
    //     "image": "https://picsum.photos/seed/picsum/200/300",
    //     "author": "67fceb2a2a4c51f2edecd79e",
    //     "likes": [],
    //     "_id": "67fd11fc2a4c51f2edecd7a8",
    //     "comments": [],
    //     "createdAt": "2025-04-14T13:47:40.683Z",
    //     "updatedAt": "2025-04-14T13:47:40.683Z",
    //     "__v": 0
    // }
    res.status(201).json({
      title: newPost.title,
      content: newPost.content,
      tags: newPost.tags,
      image: newPost.image,
      author: newPost.author,
      likes: newPost.likes,
      _id: newPost._id,
      comments: newPost.comments,
      createdAt: newPost.createdAt,
      updatedAt: newPost.updatedAt,
      __v: newPost.__v,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Response :-
//  (200 OK)
// {
//     "_id": "67fd11fc2a4c51f2edecd7a8",
//     "title": "test post 3",
//     "content": "test post 3 content",
//     "tags": [
//         "tag1",
//         "tag2"
//     ],
//     "image": "https://picsum.photos/seed/picsum/200/300",
//     "author": {
//         "_id": "67fceb2a2a4c51f2edecd79e",
//         "name": "test123",
//         "email": "test123@blog.com"
//     },
//     "likes": [],
//     "comments": [],
//     "createdAt": "2025-04-14T13:47:40.683Z",
//     "updatedAt": "2025-04-14T13:47:40.683Z",
//     "__v": 0,
//     "totalLikes": 0,
//     "likedByCurrentUser": false
// }

async function getAllPosts(req, res) {
  try {
    const posts = await Post.find()
      .populate('author', '_id name email avatar')
      .populate('likes', '_id name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(
      posts.map((post) => ({
        _id: post._id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        image: post.image,
        author: post.author,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        __v: post.__v,
        totalLikes: post.likes.length,
        likedByCurrentUser: req.user
          ? post.likes.some((user) => user._id.toString() === req.user.id)
          : false,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getPostsById(req, res) {
  try {
    const postId = req.params.post_id;

    const post = await Post.findById(postId).populate(
      'author',
      '_id name email avatar'
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({
      _id: post._id,
      title: post.title,
      content: post.content,
      tags: post.tags,
      image: post.image,
      author: post.author,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      __v: post.__v,
      totalLikes: post.likes.length,
      likedByCurrentUser: req.user ? post.likes.includes(req.user.id) : false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
async function updatePost(req, res) {
  try {
    const postId = req.params.post_id;
    const { title, content, tags, image } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the authenticated user is the author of the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update the post fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;

    if (image) {
      post.image = image;
    }

    await post.save();
    // (200 OK)
    // {
    //     "_id": "67fd11fc2a4c51f2edecd7a8",
    //     "title": "updated test post 1",
    //     "content": "test post 3 content",
    //     "tags": [
    //         "tag1",
    //         "tag2"
    //     ],
    //     "image": "https://picsum.photos/seed/picsum/200/300",
    //     "author": "67fceb2a2a4c51f2edecd79e",
    //     "likes": [],
    //     "comments": [],
    //     "createdAt": "2025-04-14T13:47:40.683Z",
    //     "updatedAt": "2025-04-14T13:50:36.569Z",
    //     "__v": 0
    // }

    res.status(200).json({
      _id: post._id,
      title: post.title,
      content: post.content,
      tags: post.tags,
      image: post.image,
      author: post.author,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      __v: post.__v,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deletePost(req, res) {
  try {
    const postId = req.params.post_id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the authenticated user is the author of the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
async function likePost(req, res) {
  try {
    const postId = req.params.post_id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // If already liked, remove the like (unlike)
      post.likes.pull(userId);
    } else {
      // If not liked, add the like
      post.likes.push(userId);
    }

    await post.save();
    //      (200 OK)
    // {
    //     "message": "Post liked",
    //     "totalLikes": 1
    // }

    res.status(200).json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      totalLikes: post.likes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createPost,
  getAllPosts,
  getPostsById,
  updatePost,
  deletePost,
  likePost,
};
