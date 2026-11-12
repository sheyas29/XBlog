const express = require('express');
const cors = require('cors');
const app = express();
const router = express.Router();
const authRouter = require('./Routes/authRoutes');
const postRouter = require('./Routes/postRoutes');
const userRouter = require('./Routes/userRoutes');
const commentRouter = require('./Routes/commentRoute');
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Hello World',
    status: 'success',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);
app.use('/api/comments', commentRouter);
module.exports = app;
