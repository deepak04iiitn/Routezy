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

export function validateProfileUpdatePayload(payload) {
  const errors = [];

  const hasFullName = Object.prototype.hasOwnProperty.call(payload || {}, 'fullName');
  const fullName = hasFullName ? String(payload?.fullName || '').trim() : undefined;
  const securityQuestion = (payload?.securityQuestion || '').trim();
  const securityAnswer = (payload?.securityAnswer || '').trim();

  if (hasFullName && !fullName) {
    errors.push('Full name cannot be empty.');
  } else if (hasFullName && (fullName.length < 2 || fullName.length > 80)) {
    errors.push('Full name must be between 2 and 80 characters.');
  }

  if (securityQuestion && securityQuestion.length < 6) {
    errors.push('Security question must be at least 6 characters.');
  }

  if (securityAnswer && securityAnswer.length < 2) {
    errors.push('Security answer must be at least 2 characters.');
  }

  return {
    errors,
    value: {
      fullName,
      securityQuestion,
      securityAnswer,
    },
  };
}

export function validateForgotPasswordQuestionPayload(payload) {
  const errors = [];
  const email = payload?.email?.trim()?.toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Please provide a valid email address.');
  }

  return { errors, value: { email } };
}

export function validateForgotPasswordResetPayload(payload) {
  const errors = [];
  const email = payload?.email?.trim()?.toLowerCase();
  const securityAnswer = payload?.securityAnswer?.trim();
  const newPassword = payload?.newPassword;

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!securityAnswer) {
    errors.push('Security answer is required.');
  }

  if (!newPassword || !PASSWORD_REGEX.test(newPassword)) {
    errors.push('New password must be at least 8 characters and include letters and numbers.');
  }

  return { errors, value: { email, securityAnswer, newPassword } };
}

