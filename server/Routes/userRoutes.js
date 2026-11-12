const express = require('express');
const router = express.Router();

const authMiddleware = require('../Middlewares/authMiddleware');
const {
  getUserById,
  getSelfUser,
  updateUser,
  getSelfUserPosts,
} = require('../Controllers/userController');

router.get('/me', authMiddleware, getSelfUser);
router.put('/me', authMiddleware, updateUser);
router.get('/me/posts', authMiddleware, getSelfUserPosts);
router.get('/:user_id', getUserById);
module.exports = router;
