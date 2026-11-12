const User = require('../Models/User');
const Post = require('../Models/Post');

const getUserById = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // (200 OK)
    // {
    //     "_id": "67fceb2a2a4c51f2edecd79e",
    //     "name": "test123",
    //     "email": "test123@blog.com",
    //     "avatar": "https://picsum.photos/seed/picsum/200/300",
    //     "postCount": 1
    // }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      postCount: await Post.countDocuments({ author: user._id }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

async function getSelfUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      postCount: await Post.countDocuments({ author: user._id }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}
async function updateUser(req, res) {
  try {
    const userId = req.user.id;
    const { name, email, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, avatar },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getSelfUserPosts(req, res) {
  try {
    const userId = req.user.id;
    const posts = await Post.find({ author: userId });
    // (200 OK)
    // [
    //     {
    //         "_id": "67fd12e72a4c51f2edecd7b7",
    //         "title": "test post 3",
    //         "content": "test post 3 content",
    //         "tags": [
    //             "tag1",
    //             "tag2"
    //         ],
    //         "image": "https://picsum.photos/seed/picsum/200/300",
    //         "author": "67fceb2a2a4c51f2edecd79e",
    //         "likes": [
    //             {
    //                 "_id": "67fceb2a2a4c51f2edecd79e"
    //             }
    //         ],
    //         "comments": [],
    //         "createdAt": "2025-04-14T13:51:35.589Z",
    //         "updatedAt": "2025-04-14T13:51:45.400Z",
    //         "__v": 1,
    //         "commentCount": 0
    //     }
    // ]

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
        commentCount: post.comments.length,
      }))
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getUserById,
  getSelfUser,
  updateUser,
  getSelfUserPosts,
};
