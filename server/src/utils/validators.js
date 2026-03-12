const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function validateSignupPayload(payload) {
  const errors = [];

  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password;

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || !PASSWORD_REGEX.test(password)) {
    errors.push('Password must be at least 8 characters and include letters and numbers.');
  }

  return { errors, value: { email, password } };
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

export function validateGoogleAuthPayload(payload) {
  const errors = [];
  const idToken = payload?.idToken?.trim();

  if (!idToken) {
    errors.push('Google id token is required.');
  }

  return { errors, value: { idToken } };
}

