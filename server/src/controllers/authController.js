import User from '../models/User.js';
import { signAuthToken } from '../utils/jwt.js';
import { getFirebaseAdminAuth } from '../config/firebaseAdmin.js';
import {
  validateGoogleAuthPayload,
  validateSigninPayload,
  validateSignupPayload,
} from '../utils/validators.js';

function generateUsernameFromEmail(email) {
  const localPart = (email.split('@')[0] || 'traveler')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 18);
  const suffix = Math.random().toString(36).slice(2, 7);
  const base = localPart.length >= 2 ? localPart : 'traveler';

  return `${base}${suffix}`.slice(0, 32);
}

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

    const generatedUsername = generateUsernameFromEmail(value.email);
    const user = await User.create({
      ...value,
      username: generatedUsername,
      authProvider: 'local',
    });
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

    if (user.authProvider === 'google') {
      return res.status(400).json({
        message: 'This account uses Google sign-in. Please continue with Google.',
      });
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

export async function googleAuth(req, res, next) {
  try {
    const { errors, value } = validateGoogleAuthPayload(req.body);

    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const firebaseAuth = getFirebaseAdminAuth();
    const decodedToken = await firebaseAuth.verifyIdToken(value.idToken);
    const email = decodedToken?.email?.trim().toLowerCase();
    const firebaseUid = decodedToken?.uid;

    if (!email) {
      return res.status(400).json({ message: 'Google account does not include an email.' });
    }

    if (!firebaseUid) {
      return res.status(400).json({ message: 'Invalid Google token payload.' });
    }

    let user = await User.findOne({
      $or: [{ firebaseUid }, { email }],
    }).select('+password');

    if (!user) {
      const generatedUsername = generateUsernameFromEmail(email);
      user = await User.create({
        email,
        username: generatedUsername,
        authProvider: 'google',
        firebaseUid,
      });
    } else {
      let needsSave = false;

      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        needsSave = true;
      }

      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
      }
    }

    const token = signAuthToken(user._id.toString());

    return res.json({
      message: 'Google authentication successful.',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    if (error?.code === 'auth/id-token-expired' || error?.code === 'auth/argument-error') {
      return res.status(401).json({ message: 'Google token is invalid or expired.' });
    }
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

