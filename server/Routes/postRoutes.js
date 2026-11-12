const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostsById,
  updatePost,
  deletePost,
  likePost,
} = require('../Controllers/postController');
const {
  createComment,
  getCommentsByPostId,
} = require('../Controllers/commentController');
const authMiddleware = require('../Middlewares/authMiddleware');

router.get('/', authMiddleware, getAllPosts);
router.post('/', authMiddleware, createPost);
router.get('/:post_id', authMiddleware, getPostsById);
router.put('/:post_id', authMiddleware, updatePost);
router.delete('/:post_id', authMiddleware, deletePost);
router.post('/:post_id/like', authMiddleware, likePost);
router.post('/:post_id/comments', authMiddleware, createComment);
router.get('/:post_id/comments', authMiddleware, getCommentsByPostId);

module.exports = router;
