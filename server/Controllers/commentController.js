const Comment = require('../Models/Comment');
const Post = require('../Models/Post');

async function createComment(req, res) {
  try {
    const postId = req.params.post_id;
    const { text } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      text,
      author: userId,
      post: postId,
    });

    await comment.save();
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });
    // (201 Created)
    // {
    //     "text": "test comment 1",
    //     "post": "67fceb2a2a4c51f2edecd79e",
    //     "author": "67fceb2a2a4c51f2edecd79e",
    //     "_id": "67fd1ac02a4c51f2edecd7ca",
    //     "createdAt": "2025-04-14T14:25:04.157Z",
    //     "updatedAt": "2025-04-14T14:25:04.157Z",
    //     "__v": 0
    // }
    res.status(201).json({
      _id: comment._id,
      text: comment.text,
      post: comment.post,
      author: comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      __v: comment.__v,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getCommentsByPostId(req, res) {
  try {
    const postId = req.params.post_id;
    const comments = await Comment.find({ post: postId });
    //     (200 OK)
    // [
    //     {
    //         "_id": "67fd1ac02a4c51f2edecd7ca",
    //         "text": "test comment 1",
    //         "post": "67fceb2a2a4c51f2edecd79e",
    //         "author": {
    //             "_id": "67fceb2a2a4c51f2edecd79e",
    //             "name": "updated test user",
    //             "email": "test123@blog.com"
    //         },
    //         "createdAt": "2025-04-14T14:25:04.157Z",
    //         "updatedAt": "2025-04-14T14:25:04.157Z",
    //         "__v": 0
    //     }
    // ]

    res.status(200).json(
      comments.map((comment) => ({
        _id: comment._id,
        text: comment.text,
        post: comment.post,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        __v: comment.__v,
      }))
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}
async function deleteComment(req, res) {
  try {
    const commentId = req.params.comment_id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });
    //     (200 OK)
    // {
    //     "message": "Comment deleted successfully"
    // }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createComment,
  getCommentsByPostId,
  deleteComment,
};
