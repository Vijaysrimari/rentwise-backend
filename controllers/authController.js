const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const normalizeEmailAddress = (value) => String(value || '').toLowerCase().trim();

const buildEmailCandidates = (value) => {
  const normalizedEmail = normalizeEmailAddress(value);
  const candidates = new Set([normalizedEmail]);
  const [localPart, domain] = normalizedEmail.split('@');

  if (localPart && domain === 'gmail.com') {
    candidates.add(`${localPart.replace(/\./g, '')}@gmail.com`);
  }

  return Array.from(candidates);
};

const buildToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  address: user.address || '',
  bio: user.bio || '',
});

exports.register = async (req, res) => {
  try {
    console.log('━━━━ REGISTER ━━━━');
    console.log('Body received:', req.body);

    const { name, email, password } = req.body;
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Password length:', password?.length);

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const trimmedPassword = String(password || '').trim();
    if (!trimmedPassword || trimmedPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: trimmedPassword,
      role: 'tenant',
      phone: '',
      address: '',
      bio: '',
    });

    await user.save();

    console.log('User saved. Verifying hash...');
    const testMatch = await bcrypt.compare(trimmedPassword, user.password);
    console.log('Post-save verify:', testMatch);

    if (!testMatch) {
      console.error('Hash verification failed after save!');
      return res.status(500).json({ message: 'Registration error. Please try again.' });
    }

    const token = buildToken(user);

    console.log('✅ Registration success:', cleanEmail);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: '',
        address: '',
        bio: '',
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    return res.status(500).json({ message: 'Server error. Try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('━━━━ LOGIN ━━━━');
    console.log('Email:', req.body.email);
    console.log('Password:', req.body.password);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = String(password).trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('Login failed: no user with email:', cleanEmail);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Stored hash:', user.password);
    console.log('Hash starts with $2b:', user.password?.startsWith('$2b'));

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Login failed: wrong password for:', cleanEmail);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = buildToken(user);

    console.log('✅ Login success:', cleanEmail, 'role:', user.role);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error. Try again.' });
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(toSafeUser(user));
  } catch (error) {
    return next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const normalizedEmail = normalizeEmailAddress(email);
      const existing = await User.findOne({
        email: { $in: buildEmailCandidates(normalizedEmail) },
        _id: { $ne: user._id },
      });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = normalizedEmail;
    }

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    user.bio = bio ?? user.bio;

    await user.save();

    return res.status(200).json(toSafeUser(user));
  } catch (error) {
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (_req, res, next) => {
  try {
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return next(error);
  }
};
