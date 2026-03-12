const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function validateSignupPayload(payload) {
  const errors = [];

  const username = payload?.username?.trim();
  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password;

  if (!username || username.length < 2 || username.length > 32) {
    errors.push('Username must be between 2 and 32 characters.');
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || !PASSWORD_REGEX.test(password)) {
    errors.push('Password must be at least 8 characters and include letters and numbers.');
  }

  return { errors, value: { username, email, password } };
}

export function validateSigninPayload(payload) {
  const errors = [];

  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password;

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  return { errors, value: { email, password } };
}

