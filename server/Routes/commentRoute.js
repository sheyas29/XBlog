const express = require('express');
const router = express.Router();
const { deleteComment } = require('../Controllers/commentController');
const authMiddleware = require('../Middlewares/authMiddleware');

router.delete('/:comment_id', authMiddleware, deleteComment);
module.exports = router;
