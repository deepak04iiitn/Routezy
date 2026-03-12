import User from '../models/User.js';
import { signAuthToken } from '../utils/jwt.js';
import { validateSigninPayload, validateSignupPayload } from '../utils/validators.js';

function publicUser(userDoc) {
  return {
    id: userDoc._id.toString(),
    username: userDoc.username,
    email: userDoc.email,
    createdAt: userDoc.createdAt,
  };
}

export async function signup(req, res, next) {
  try {
    const { errors, value } = validateSignupPayload(req.body);

    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const existing = await User.findOne({ email: value.email });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const user = await User.create(value);
    const token = signAuthToken(user._id.toString());

    return res.status(201).json({
      message: 'Signup successful.',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function signin(req, res, next) {
  try {
    const { errors, value } = validateSigninPayload(req.body);

    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const user = await User.findOne({ email: value.email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValidPassword = await user.comparePassword(value.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signAuthToken(user._id.toString());

    return res.json({
      message: 'Signin successful.',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function logout(_req, res) {
  return res.json({
    message: 'Logged out successfully on client. Remove stored token to end session.',
  });
}

