import { useEffect, useRef, useState } from 'react';
import {
  Button, Card, CardBody, Heading, Input, Text,
} from '@ds/components';
import './AccountDemo.css';

// ─── Types ────────────────────────────────────────────────

type View = 'login' | 'register' | 'forgot' | 'forgot-success';

// ─── Component ────────────────────────────────────────────

export function AccountDemo({ basePath = '' }: { basePath?: string }) {
  const [view, setView] = useState<View>('login');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Error state (demo: triggered on submit with empty fields)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  // Where focus goes after the next render. Switching view unmounted the
  // pressed button and dropped focus to <body>; a submit with errors left
  // focus on the button, and a second submit with the same error said
  // nothing at all. Now: a new view focuses its h1, a failed submit focuses
  // the first invalid field (its label and error are read with it).
  const rootRef = useRef<HTMLDivElement>(null);
  const focusNext = useRef<'heading' | 'invalid' | null>(null);
  useEffect(() => {
    const request = focusNext.current;
    if (!request) return;
    focusNext.current = null;
    const selector = request === 'heading' ? 'h1' : '[aria-invalid="true"]';
    rootRef.current?.querySelector<HTMLElement>(selector)?.focus();
  });

  function resetForm() {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setErrors({});
    setFormError('');
  }

  function switchView(next: View) {
    resetForm();
    setView(next);
    focusNext.current = 'heading';
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Please enter your email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) focusNext.current = 'invalid';
    if (Object.keys(errs).length === 0) {
      setFormError('Invalid email or password. Please try again.');
    }
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!firstName) errs.firstName = 'First name is required.';
    if (!lastName) errs.lastName = 'Last name is required.';
    if (!email) errs.email = 'Please enter your email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) focusNext.current = 'invalid';
    setFormError('');
  }

  function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Please enter your email address.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) focusNext.current = 'invalid';
    if (!errs.email) {
      setView('forgot-success');
      focusNext.current = 'heading';
    }
  }

  return (
    <div className="ds-account" ref={rootRef}>
      <Card variant="outlined" className="ds-account__card">
        <CardBody>
          {/* ── Login ──────────────────────────────────────── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <div className="ds-account__header">
                <Heading as="h1" size="xl" tabIndex={-1}>Sign In</Heading>
                <Text size="sm" muted>Welcome back. Enter your credentials to continue.</Text>
              </div>

              {formError && (
                <div className="ds-account__form-error" role="alert">
                  <Text size="sm">{formError}</Text>
                </div>
              )}

              <div className="ds-account__fields">
                <Input
                  label="Email address"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
              </div>

              <div className="ds-account__actions">
                <Button variant="primary" size="md" fullWidth type="submit">
                  Sign In
                </Button>
              </div>

              <div className="ds-account__links">
                <button
                  type="button"
                  className="ds-account__link-btn"
                  onClick={() => switchView('forgot')}
                >
                  <Text as="span" size="sm" muted>Forgot password?</Text>
                </button>
                <hr className="ds-account__divider" />
                <button
                  type="button"
                  className="ds-account__link-btn"
                  onClick={() => switchView('register')}
                >
                  <Text as="span" size="sm" muted>Don&rsquo;t have an account? <strong>Create one</strong></Text>
                </button>
              </div>
            </form>
          )}

          {/* ── Register ───────────────────────────────────── */}
          {view === 'register' && (
            <form onSubmit={handleRegister} noValidate>
              <div className="ds-account__header">
                <Heading as="h1" size="xl" tabIndex={-1}>Create Account</Heading>
                <Text size="sm" muted>Join us. It only takes a moment.</Text>
              </div>

              <div className="ds-account__fields">
                <div className="ds-account__name-row">
                  <Input
                    label="First name"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={errors.firstName}
                  />
                  <Input
                    label="Last name"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={errors.lastName}
                  />
                </div>
                <Input
                  label="Email address"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Password"
                  type="password"
                  required
                  autoComplete="new-password"
                  hint="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
              </div>

              <div className="ds-account__actions">
                <Button variant="primary" size="md" fullWidth type="submit">
                  Create Account
                </Button>
              </div>

              <div className="ds-account__links">
                <hr className="ds-account__divider" />
                <button
                  type="button"
                  className="ds-account__link-btn"
                  onClick={() => switchView('login')}
                >
                  <Text as="span" size="sm" muted>Already have an account? <strong>Sign In</strong></Text>
                </button>
              </div>
            </form>
          )}

          {/* ── Forgot Password ────────────────────────────── */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} noValidate>
              <div className="ds-account__header">
                <Heading as="h1" size="xl" tabIndex={-1}>Reset Password</Heading>
                <Text size="sm" muted>
                  Enter your email and we&rsquo;ll send you a link to reset your password.
                </Text>
              </div>

              <div className="ds-account__fields">
                <Input
                  label="Email address"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              </div>

              <div className="ds-account__actions">
                <Button variant="primary" size="md" fullWidth type="submit">
                  Send Reset Link
                </Button>
              </div>

              <div className="ds-account__links">
                <hr className="ds-account__divider" />
                <button
                  type="button"
                  className="ds-account__link-btn"
                  onClick={() => switchView('login')}
                >
                  <Text as="span" size="sm" muted>Back to Sign In</Text>
                </button>
              </div>
            </form>
          )}

          {/* ── Forgot Password Success ────────────────────── */}
          {view === 'forgot-success' && (
            <div className="ds-account__success">
              <Heading as="h1" size="xl" tabIndex={-1}>Check your email</Heading>
              <Text size="sm" muted>
                We&rsquo;ve sent a password reset link to <strong>{email}</strong>.
              </Text>
              <Button variant="secondary" size="md" onClick={() => switchView('login')}>
                Back to Sign In
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
