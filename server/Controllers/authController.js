const User = require('../Models/User');
const jwt = require('jsonwebtoken');

const createUserToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password, avatar });
    await newUser.save();

    const token = createUserToken(newUser);

    return res.status(201).json({
      user: buildUserResponse(newUser),
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Please login with Google' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = createUserToken(user);

    return res.status(200).json({
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const googleLoginUser = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const randomPassword = `${Date.now()}-google-auth-${Math.random().toString(36).slice(2)}`;
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: randomPassword,
        avatar: avatar || 'https://picsum.photos/seed/picsum/200/300',
        role: 'user',
      });
    }

    const token = createUserToken(user);

    return res.status(200).json({
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLoginUser,
};
