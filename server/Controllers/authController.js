const User = require('../Models/User');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ name, email, password, avatar });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // (201 Created)
    // {
    //     "user": {
    //         "id": "67fceb2a2a4c51f2edecd79e",
    //         "name": "test123",
    //         "email": "test123@blog.com",
    //         "avatar": "https://picsum.photos/seed/picsum/200/300",
    //         "role": "user"
    //     },
    //     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZmNlYjJhMmE0YzUxZjJlZGVjZDc5ZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ0NjI4NTIyLCJleHAiOjE3NDUyMzMzMjJ9.6JLHYv71b5OPiWx5NJOR97BUD_-RWtSRPM_Usd4FeAA"
    // }
    return res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    //  (200 OK)
    // {
    //     "user": {
    //         "id": "67fceb2a2a4c51f2edecd79e",
    //         "name": "test123",
    //         "email": "test123@blog.com",
    //         "avatar": "https://picsum.photos/seed/picsum/200/300",
    //         "role": "user"
    //     },
    //     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZmNlYjJhMmE0YzUxZjJlZGVjZDc5ZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ0NjI4NTYyLCJleHAiOjE3NDUyMzMzNjJ9.uXRf4jzd1mUSc7ssThLTQU4TIUlb8A7Aq12cMLycJKU"
    // }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
