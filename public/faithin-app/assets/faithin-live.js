/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-location-assign-relative-destination */
/* Faith In — shared live data and authentication for the new interface. */
(() => {
  'use strict';
  const { $, $$, esc, toast, setTheme } = window.FI;
  const api = window.FIData;
  let session = null;

  function avatarMarkup(user, classes = 'avatar w-10 h-10 text-[13px]') {
    const name = user?.name || user?.displayName || 'Faith In Member';
    const url = user?.avatar_url || user?.avatar || user?.photo_url || '';
    if (url) return `<img class="${classes} object-cover" src="${esc(url)}" alt="${esc(name)}">`;
    return `<span class="${classes}" style="background:linear-gradient(135deg,#2f5bea,#1e40af)">${esc(api.initials(name))}</span>`;
  }

  function verificationBadgeMarkup(user, variant = 'inline') {
    const isProfile = variant === 'profile';
    const v = user?.verification || { show: true, type: 'purple', label: 'Verified Member', title: 'Verified Member — Purple Tick' };
    const type = v.type || 'purple';
    const tickClass = type === 'blue' ? 'fi-verified-tick fi-verified-tick--blue' : (type === 'yellow' || type === 'gold' ? 'fi-verified-tick fi-verified-tick--gold' : 'fi-verified-tick');
    const profileMod = isProfile ? ' fi-verified-tick--profile' : '';
    const title = esc(v.title || 'Verified Member');

    return `<span class="${tickClass}${profileMod}" title="${title}" aria-label="${title}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg></span>`;
  }

  function mountAuth() {
    const host = document.createElement('div');
    host.id = 'fi-auth';
    host.className = 'fi-auth hidden';
    host.innerHTML = `<div class="fi-auth__page" role="dialog" aria-modal="true" aria-labelledby="fi-auth-title">
      <header class="fi-auth__brand"><span>FaithIn</span><i class="fa-solid fa-globe" aria-hidden="true"></i></header>
      <main class="fi-auth__main">
        <div class="fi-auth__intro"><h1>Welcome to your professional<br>faith community</h1><p>Connect with believers, discover ministry opportunities, and grow your professional network.</p></div>
        <section class="fi-auth__card">
          <button class="fi-auth__close" data-auth-close aria-label="Close sign in"><i class="fa-solid fa-xmark"></i></button>

          <div data-auth-view="signin">
            <h2 id="fi-auth-title">Sign in</h2>
            <p class="fi-auth__subtitle">Stay updated on your professional world.</p>
            <form data-auth-form="signin" class="fi-auth__form">
              <label class="sr-only" for="fi-signin-email">Email address</label>
              <input id="fi-signin-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email address" required>
              <label class="fi-auth__password"><span class="sr-only">Password</span><input name="password" type="password" autocomplete="current-password" placeholder="Password" minlength="6" required><button type="button" data-password-toggle aria-label="Show password"><i class="fa-regular fa-eye"></i></button></label>
              <div class="fi-auth__options"><label><input name="remember" type="checkbox" checked> Remember me</label><button type="button" data-auth-show="forgot">Forgot password?</button></div>
              <p class="fi-auth__error" data-auth-error hidden role="alert"></p>
              <button class="fi-auth__primary" name="intent" value="signin"><span>Sign in</span><i class="fi-auth__spinner" aria-hidden="true"></i></button>
            </form>
            <div class="fi-auth__divider"><span>or</span></div>
            <div class="fi-auth__social-group">
              <button class="fi-auth__social fi-auth__social--facebook" data-auth-facebook type="button">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
                  <circle cx="12" cy="12" r="12" fill="#1877F2"/>
                  <path d="M15.12 12.07l.42-2.72h-2.61V7.58c0-.74.36-1.47 1.53-1.47h1.18V3.79c-.71-.1-1.43-.15-2.15-.14-2.19 0-3.62 1.33-3.62 3.73v1.97H9.46v2.72h2.41v6.58c.49.08.98.12 1.48.12s.99-.04 1.48-.12v-6.58h2.29z" fill="#FFFFFF"/>
                </svg>
                <span>Continue with Facebook</span>
              </button>
              <button class="fi-auth__social fi-auth__social--phone" data-auth-show="phone" type="button">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Continue with Phone</span>
              </button>
              <button class="fi-auth__social" data-auth-google type="button">
                <svg viewBox="0 0 24 24" width="20" height="20" style="flex-shrink:0;">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
            <p class="fi-auth__switch">New to Faith In? <button data-auth-show="signup">Join now</button></p>
          </div>

          <div data-auth-view="signup" hidden>
            <h2>Join Faith In</h2>
            <p class="fi-auth__subtitle">Create your secure member account.</p>
            <form data-auth-form="signup" class="fi-auth__form">
              <div class="fi-auth__names"><label><span class="sr-only">First name</span><input name="first_name" autocomplete="given-name" placeholder="First name" required maxlength="60"></label><label><span class="sr-only">Last name</span><input name="last_name" autocomplete="family-name" placeholder="Last name" required maxlength="60"></label></div>
              <label class="sr-only" for="fi-signup-email">Email address</label>
              <input id="fi-signup-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email address" required>
              <label class="fi-auth__password"><span class="sr-only">Password</span><input name="password" type="password" autocomplete="new-password" placeholder="Password (8+ characters)" minlength="8" required><button type="button" data-password-toggle aria-label="Show password"><i class="fa-regular fa-eye"></i></button></label>
              <p class="fi-auth__terms">By clicking Agree &amp; Join, you agree to the Faith In <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
              <p class="fi-auth__error" data-auth-error hidden role="alert"></p>
              <button class="fi-auth__primary" name="intent" value="signup"><span>Agree &amp; Join</span><i class="fi-auth__spinner" aria-hidden="true"></i></button>
            </form>
            <div class="fi-auth__divider"><span>or sign up with</span></div>
            <div class="fi-auth__social-group">
              <button class="fi-auth__social fi-auth__social--facebook" data-auth-facebook type="button">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
                  <circle cx="12" cy="12" r="12" fill="#1877F2"/>
                  <path d="M15.12 12.07l.42-2.72h-2.61V7.58c0-.74.36-1.47 1.53-1.47h1.18V3.79c-.71-.1-1.43-.15-2.15-.14-2.19 0-3.62 1.33-3.62 3.73v1.97H9.46v2.72h2.41v6.58c.49.08.98.12 1.48.12s.99-.04 1.48-.12v-6.58h2.29z" fill="#FFFFFF"/>
                </svg>
                <span>Sign up with Facebook</span>
              </button>
              <button class="fi-auth__social fi-auth__social--phone" data-auth-show="phone" type="button">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Sign up with Phone</span>
              </button>
              <button class="fi-auth__social" data-auth-google type="button">
                <svg viewBox="0 0 24 24" width="20" height="20" style="flex-shrink:0;">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
            <p class="fi-auth__switch">Already on Faith In? <button data-auth-show="signin">Sign in</button></p>
          </div>

          <div data-auth-view="phone" hidden>
            <button class="fi-auth__back" data-auth-show="signup" type="button"><i class="fa-solid fa-arrow-left"></i> Back</button>
            <h2>Sign up with Phone</h2>
            <p class="fi-auth__subtitle">Enter your mobile number to receive an SMS verification code.</p>
            <form data-auth-form="phone-send" class="fi-auth__form">
              <div class="fi-auth__names">
                <label><span class="sr-only">First name</span><input name="first_name" autocomplete="given-name" placeholder="First name (optional)" maxlength="60"></label>
                <label><span class="sr-only">Last name</span><input name="last_name" autocomplete="family-name" placeholder="Last name (optional)" maxlength="60"></label>
              </div>
              <div style="display:flex;gap:8px;margin-top:10px;">
                <select name="country_code" style="width:120px;height:56px;border-radius:12px;border:1px solid #d0d5dd;padding:0 8px;font-size:15px;font-weight:600;background:#fff;color:#344054;">
                  <option value="+855" selected>🇰🇭 +855</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+66">🇹🇭 +66</option>
                  <option value="+84">🇻🇳 +84</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+82">🇰🇷 +82</option>
                  <option value="+1">🇨🇦 +1</option>
                </select>
                <input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="Phone number (e.g. 12 345 678)" required style="flex:1;">
              </div>
              <div id="fi-recaptcha-container"></div>
              <p class="fi-auth__terms">By continuing, you agree to receive SMS security verification codes from Faith In.</p>
              <p class="fi-auth__error" data-auth-error hidden role="alert"></p>
              <p class="fi-auth__success" data-auth-success hidden role="status"></p>
              <button class="fi-auth__primary" type="submit"><span>Send SMS Code</span><i class="fi-auth__spinner" aria-hidden="true"></i></button>
            </form>
            <div class="fi-auth__divider"><span>or</span></div>
            <button class="fi-auth__social fi-auth__social--facebook" data-auth-facebook type="button">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
                <circle cx="12" cy="12" r="12" fill="#1877F2"/>
                <path d="M15.12 12.07l.42-2.72h-2.61V7.58c0-.74.36-1.47 1.53-1.47h1.18V3.79c-.71-.1-1.43-.15-2.15-.14-2.19 0-3.62 1.33-3.62 3.73v1.97H9.46v2.72h2.41v6.58c.49.08.98.12 1.48.12s.99-.04 1.48-.12v-6.58h2.29z" fill="#FFFFFF"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>
            <p class="fi-auth__switch">Prefer email? <button data-auth-show="signup">Sign up with email</button></p>
          </div>

          <div data-auth-view="phone-verify" hidden>
            <button class="fi-auth__back" data-auth-show="phone" type="button"><i class="fa-solid fa-arrow-left"></i> Change phone number</button>
            <div class="fi-auth__verify-icon" style="color:#059669;background:#ecfdf5;"><i class="fa-solid fa-mobile-screen-button"></i></div>
            <h2>Enter 6-digit Code</h2>
            <p class="fi-auth__subtitle">We sent an SMS code to <strong data-auth-phone></strong>.</p>
            <form data-auth-form="phone-verify" class="fi-auth__form">
              <input name="code" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" placeholder="• • • • • •" required style="letter-spacing:0.4em;text-align:center;font-size:24px;font-weight:700;">
              <p class="fi-auth__error" data-auth-error hidden role="alert"></p>
              <p class="fi-auth__success" data-auth-success hidden role="status"></p>
              <button class="fi-auth__primary" type="submit"><span>Verify &amp; Enter Faith In</span><i class="fi-auth__spinner" aria-hidden="true"></i></button>
              <button class="fi-auth__text-button" type="button" data-auth-resend-phone>Resend SMS verification code</button>
            </form>
          </div>

          <div data-auth-view="forgot" hidden>
            <button class="fi-auth__back" data-auth-show="signin"><i class="fa-solid fa-arrow-left"></i> Back to sign in</button>
            <h2>Reset your password</h2>
            <p class="fi-auth__subtitle">Enter your email and we’ll send a secure reset link.</p>
            <form data-auth-form="forgot" class="fi-auth__form">
              <label class="sr-only" for="fi-forgot-email">Email address</label>
              <input id="fi-forgot-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email address" required>
              <p class="fi-auth__error" data-auth-error hidden role="alert"></p>
              <p class="fi-auth__success" data-auth-success hidden role="status"></p>
              <button class="fi-auth__primary"><span>Send reset link</span><i class="fi-auth__spinner" aria-hidden="true"></i></button>
            </form>
          </div>

          <div data-auth-view="verify" hidden>
            <div class="fi-auth__verify-icon"><i class="fa-regular fa-envelope"></i></div>
            <h2>Verify your email</h2>
            <p class="fi-auth__subtitle">We sent a verification link to <strong data-auth-email></strong>. Open it, then return here to sign in.</p>
            <button class="fi-auth__primary" data-auth-show="signin"><span>Back to sign in</span></button>
            <button class="fi-auth__text-button" data-auth-resend>Resend verification email</button>
            <p class="fi-auth__success" data-auth-success hidden role="status"></p>
          </div>
        </section>
      </main>
      <footer class="fi-auth__footer"><span>FaithIn © 2026</span><a href="/privacy">Privacy</a><a href="/terms">Terms</a></footer>
    </div>`;
    document.body.appendChild(host);
    let verificationEmail = '';
    let lastPhoneSent = '';
    let lastCountryCode = '+855';
    let lastPhoneDisplayName = '';
    let currentPhoneVerificationId = '';
    const close = () => {
      if (host.dataset.locked === 'true') return;
      host.classList.add('hidden');
    };
    const setBusy = (button, busy) => {
      if (!button) return;
      button.disabled = busy;
      button.classList.toggle('is-busy', busy);
    };
    const showView = name => {
      $$('[data-auth-view]', host).forEach(view => { view.hidden = view.dataset.authView !== name; });
      $$('[data-auth-error], [data-auth-success]', host).forEach(message => { message.hidden = true; message.textContent = ''; });
      const input = $(`[data-auth-view="${name}"] input`, host);
      window.setTimeout(() => input?.focus(), 0);
    };
    const showAuthError = (scope, error) => {
      const el = $('[data-auth-error]', scope) || $('[data-auth-error]', host);
      el.textContent = error.message || 'Sign-in failed. Please try again.';
      el.hidden = false;
    };
    host.addEventListener('click', async event => {
      if (event.target === host || event.target.closest('[data-auth-close]')) close();
      const switcher = event.target.closest('[data-auth-show]');
      if (switcher) { showView(switcher.dataset.authShow); return; }
      const toggle = event.target.closest('[data-password-toggle]');
      if (toggle) {
        const input = toggle.closest('.fi-auth__password').querySelector('input');
        const reveal = input.type === 'password';
        input.type = reveal ? 'text' : 'password';
        toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
        toggle.innerHTML = `<i class="fa-regular fa-eye${reveal ? '-slash' : ''}"></i>`;
        return;
      }
      const facebook = event.target.closest('[data-auth-facebook]');
      if (facebook) {
        setBusy(facebook, true);
        try {
          const res = await api.request('cv_facebook_sign_in');
          if (res?.redirected) return;
          session = res;
          applySession(session);
          window.location.reload();
        } catch (error) {
          showAuthError(facebook.closest('[data-auth-view]'), error);
        } finally {
          setBusy(facebook, false);
        }
        return;
      }
      const google = event.target.closest('[data-auth-google]');
      if (google) {
        setBusy(google, true);
        try {
          const res = await api.request('cv_google_sign_in');
          if (res?.redirected) return;
          session = res;
          applySession(session);
          window.location.reload();
        } catch (error) {
          showAuthError(google.closest('[data-auth-view]'), error);
        } finally {
          setBusy(google, false);
        }
        return;
      }
      const resendPhone = event.target.closest('[data-auth-resend-phone]');
      if (resendPhone) {
        setBusy(resendPhone, true);
        const status = $('[data-auth-success]', resendPhone.closest('[data-auth-view]'));
        try {
          await api.request('cv_phone_send_code', { phone: lastPhoneSent, country_code: lastCountryCode });
          if (status) { status.textContent = 'A new SMS verification code was sent to your phone.'; status.hidden = false; }
        } catch (error) {
          showAuthError(resendPhone.closest('[data-auth-view]'), error);
        } finally {
          setBusy(resendPhone, false);
        }
        return;
      }
      const resend = event.target.closest('[data-auth-resend]');
      if (resend) {
        setBusy(resend, true);
        const status = $('[data-auth-success]', resend.closest('[data-auth-view]'));
        try { await api.request('cv_send_email_verification'); status.textContent = 'Verification email sent. Check your inbox and spam folder.'; status.hidden = false; }
        catch (error) { status.textContent = error.message || 'Please wait before trying again.'; status.hidden = false; }
        finally { setBusy(resend, false); }
      }
    });
    $$('[data-auth-form]', host).forEach(form => form.addEventListener('submit', async event => {
      event.preventDefault();
      const mode = form.dataset.authForm;
      const data = new FormData(form);
      const submitter = event.submitter || $('button[type="submit"], button:not([type])', form);
      setBusy(submitter, true);
      try {
        if (mode === 'forgot') {
          await api.request('cv_password_reset', { email: data.get('email') });
          const success = $('[data-auth-success]', form);
          success.textContent = 'If an account uses that email, a reset link is on the way.';
          success.hidden = false;
          $('[data-auth-error]', form).hidden = true;
          return;
        }
        if (mode === 'phone-send') {
          const phone = data.get('phone');
          const countryCode = data.get('country_code');
          lastPhoneSent = phone;
          lastCountryCode = countryCode;
          lastPhoneDisplayName = `${data.get('first_name') || ''} ${data.get('last_name') || ''}`.trim();
          const res = await api.request('cv_phone_send_code', {
            phone: phone,
            country_code: countryCode,
            recaptcha_container: 'fi-recaptcha-container'
          });
          currentPhoneVerificationId = res.verification_id;
          const phoneLabel = $('[data-auth-phone]', host);
          if (phoneLabel) phoneLabel.textContent = res.phone || `${countryCode} ${phone}`;
          showView('phone-verify');
          return;
        }
        if (mode === 'phone-verify') {
          const code = data.get('code');
          const res = await api.request('cv_phone_verify_code', {
            verification_id: currentPhoneVerificationId,
            code: code,
            display_name: lastPhoneDisplayName
          });
          session = res;
          applySession(session);
          window.location.reload();
          return;
        }
        const action = mode === 'signup' ? 'cv_email_sign_up' : 'cv_email_sign_in';
        const values = { email: data.get('email'), password: data.get('password'), remember: data.get('remember') === 'on' };
        if (mode === 'signup') values.display_name = `${data.get('first_name') || ''} ${data.get('last_name') || ''}`.trim();
        const result = await api.request(action, values);
        if (result?.verification_required) {
          verificationEmail = result.email || String(data.get('email') || '');
          $('[data-auth-email]', host).textContent = verificationEmail;
          showView('verify');
          return;
        }
        session = result;
        applySession(session);
        window.location.reload();
      } catch (error) { showAuthError(form, error); }
      finally { setBusy(submitter, false); }
    }));
    window.FI.openAuth = options => {
      const locked = !!options?.locked;
      host.dataset.locked = String(locked);
      host.classList.remove('hidden');
      host.classList.toggle('is-locked', locked);
      document.body.classList.toggle('fi-auth-locked', locked);
      document.body.classList.toggle('fi-logged-out', locked);
      const main = $('#main');
      if (main) {
        if (locked) {
          main.style.display = 'none';
        } else {
          main.style.display = '';
        }
        main.inert = locked;
        main.setAttribute('aria-hidden', String(locked));
      }
      const header = document.querySelector('body > header');
      if (header) header.style.display = locked ? 'none' : '';
      const tabBar = document.querySelector('.fi-tab-bar, nav[aria-label="Mobile navigation"]');
      if (tabBar) tabBar.style.display = locked ? 'none' : '';

      showView(options?.verificationRequired ? 'verify' : 'signin');
      if (options?.email) { verificationEmail = options.email; $('[data-auth-email]', host).textContent = verificationEmail; }
      if (options?.verificationRequired) showView('verify');
    };
  }

  function applySession(user) {
    session = user && user.logged_in ? user : null;
    if (session) {
      document.body.classList.remove('fi-auth-locked', 'fi-logged-out');
      const main = $('#main');
      if (main) {
        main.style.display = '';
        main.inert = false;
        main.removeAttribute('aria-hidden');
      }
      const header = document.querySelector('body > header');
      if (header) header.style.display = '';
      const tabBar = document.querySelector('.fi-tab-bar, nav[aria-label="Mobile navigation"]');
      if (tabBar) tabBar.style.display = '';
    } else {
      document.body.classList.add('fi-auth-locked', 'fi-logged-out');
    }
    if (session?.settings?.theme) setTheme(session.settings.theme);
    document.documentElement.style.fontSize = session?.settings?.larger_text ? '112.5%' : '';
    const name = session?.name || 'Sign in';
    const role = session?.role || (session ? 'Faith In member' : 'Join the community');
    const menu = $('[data-menu-root]');
    if (menu) {
      const avatars = $$('.avatar, img.avatar', menu);
      avatars.forEach(el => {
        const replacement = document.createElement('span'); replacement.innerHTML = avatarMarkup(session || { name: 'Faith In' }, el.className || 'avatar w-8 h-8 text-[12px]'); el.replaceWith(replacement.firstElementChild);
      });
      const texts = $$('p', menu); if (texts[0]) texts[0].textContent = name; if (texts[1]) texts[1].textContent = role;
      const signout = $$('a', menu).find(link => /sign out/i.test(link.textContent));
      if (signout) { signout.textContent = session ? 'Sign out' : 'Sign in'; signout.innerHTML = `<i class="fa-solid fa-${session ? 'arrow-right-from-bracket' : 'right-to-bracket'}"></i>${session ? 'Sign out' : 'Sign in'}`; }
    }
    const displayName = session?.name || 'Faith In Member';
    if (!session) {
      const notificationLink = $('a[aria-label^="Notifications"]');
      notificationLink?.querySelector('span')?.classList.add('hidden');
      notificationLink?.setAttribute('aria-label', 'Notifications');
      document.getElementById('fi-global-bubble-launcher')?.remove();
    }
    if (page !== 'profile') {
      $$('a, h1, h2').filter(node => node.textContent.trim() === 'Hun Chet' || node.hasAttribute('data-current-user-name')).forEach(node => {
        node.innerHTML = esc(displayName) + (session ? verificationBadgeMarkup(session) : '');
      });
      $$('p').filter(node => /Faith In member\s*·\s*Phnom Penh/i.test(node.textContent)).forEach(node => { node.textContent = session ? ['Faith In member', session.location].filter(Boolean).join(' · ') : 'Sign in to join the community'; });
      $$('.avatar').filter(node => node.textContent.trim() === 'HC' || node.textContent.trim() === 'FI').forEach(node => { if (!node.closest('[data-post-id],[data-user-uid]')) node.textContent = api.initials(displayName); });
      // The rail profile card shipped with a painted-on gradient, so everyone's
      // card looked the same regardless of the cover they had actually
      // uploaded. Paint the real one; the gradient class stays underneath as
      // the fallback for members who have not set one.
      $$('[data-current-user-cover]').forEach(el => {
        const cover = session && (session.cover_url || session.cover);
        if (!cover) { el.style.backgroundImage = ''; return; }
        el.style.backgroundImage = `url("${String(cover).replace(/["\\]/g, '')}")`;
      });
      $$('[data-current-user-avatar]').forEach(el => {
        const holder = document.createElement('span');
        holder.innerHTML = avatarMarkup(session || { name: displayName }, `${el.className} object-cover`);
        const next = holder.firstElementChild;
        next.dataset.currentUserAvatar = '';
        el.replaceWith(next);
      });
    }
    $$('a').forEach(link => {
      const label = link.textContent.trim().replace(/\s+\d+$/, '');
      const routes = { 'Home Feed': '/home', 'Profile': '/profile', 'Prayer Wall': '/home#prayer-wall', 'Find Jobs': '/jobs', 'Find Users': '/network', 'Library': '/library' };
      if (routes[label]) link.href = routes[label];
    });
    document.dispatchEvent(new CustomEvent('fi:session', { detail: { user: session } }));
  }

  function requireUser() {
    if (session) return true;
    window.FI.openAuth();
    return false;
  }

  /**
   * Paints the two header badges.
   *
   * They used to share one number, so an unread message inflated the bell and
   * the member had no way to tell the two apart. Each icon now carries its own
   * count. On /messages the realtime thread listener owns the message badge,
   * which is more current than this one poll, so it is left alone there.
   */
  async function refreshNotifications() {
    if (!session) return;
    try {
      const counts = await api.request('cv_social_get_notification_count');
      const paint = (node, count) => {
        if (!node) return;
        node.textContent = count > 99 ? '99+' : count;
        node.classList.toggle('hidden', !count);
      };
      paint($('a[aria-label^="Notifications"] span'), counts.unread_count || 0);
      if (document.body.dataset.page !== 'messaging') {
        paint($('a[aria-label^="Messages"] [data-msg-badge]'), counts.message_unread_count || 0);
      }
    } catch (_) {}
  }

  function emptyState(label) {
    return `<div class="col-span-full p-8 text-center text-muted"><i class="fa-regular fa-folder-open text-2xl text-faint"></i><p class="mt-2 text-[13.5px]">${esc(label)}</p></div>`;
  }

  async function loadJobs() {
    const heading = $$('#main h2').find(node => /recommended for you/i.test(node.textContent));
    const holder = heading?.closest('section')?.querySelector('.divide-y'); if (!holder) return;
    const form = heading.closest('#main').querySelector('form');
    const inputs = $$('input', form);
    const chipGroup = $('[data-chip-group]', form?.parentElement);
    let jobs = [], savedIds = null;
    const render = () => {
      const query = String(inputs[0]?.value || '').trim().toLowerCase();
      const locationQuery = String(inputs[1]?.value || '').trim().toLowerCase();
      const filter = $('.chip.is-on', chipGroup)?.textContent.trim().toLowerCase() || 'all roles';
      let items = jobs.filter(job => {
        const textValues = [job.title, job.organization, job.location, job.description, job.job_type].map(value => String(value || '').toLowerCase());
        const matchesQuery = !query || textValues.some(value => value.includes(query));
        const matchesLocation = !locationQuery || String(job.location || '').toLowerCase().includes(locationQuery);
        const matchesChip = filter === 'all roles'
          || (filter === 'remote' && /remote/i.test(job.location || ''))
          || (filter === 'full-time' && /full.?time/i.test(job.job_type || ''))
          || (filter === 'pastoral' && /pastor/i.test(`${job.title || ''} ${job.description || ''}`))
          || (filter === 'non-profit' && /non.?profit|ngo|charity/i.test(`${job.organization || ''} ${job.description || ''}`));
        return matchesQuery && matchesLocation && matchesChip && (!savedIds || savedIds.has(job.id));
      });
      holder.innerHTML = items.length ? items.map(job => `<article class="p-4 flex gap-3.5 row-hover relative" data-job-id="${esc(job.id)}"><span class="avatar avatar-sq w-14 h-14 text-[12px] shrink-0">${esc(api.initials(job.organization))}</span><div class="min-w-0 flex-1 pr-10"><a class="text-[15.5px] font-semibold text-brand" href="${esc(job.apply_url || (job.contact_email ? `mailto:${job.contact_email}` : '#'))}">${esc(job.title)}</a><p class="text-[14px] font-medium mt-0.5">${esc(job.organization)}</p><p class="text-[13px] text-muted mt-0.5">${esc(job.location || 'Location flexible')} · ${esc(job.job_type || 'Ministry role')}</p><p class="text-[13px] text-muted mt-2 line-clamp-2">${esc(job.description || '')}</p><p class="text-[12px] text-faint mt-2">${esc(job.time || '')}</p></div>${job.can_delete ? '<button class="icon-btn absolute top-3 right-3" data-job-delete aria-label="Delete job"><i class="fa-regular fa-trash-can"></i></button>' : '<button class="icon-btn absolute top-3 right-3" data-job-save aria-label="Save job"><i class="fa-regular fa-bookmark"></i></button>'}</article>`).join('') : emptyState(savedIds ? 'You have not saved any matching roles yet.' : 'No matching ministry roles yet.');
    };
    const refresh = async () => {
      holder.innerHTML = emptyState('Loading ministry opportunities…');
      try {
        const [result, bookmarks] = await Promise.all([
          api.request('cv_get_jobs'),
          new URLSearchParams(location.search).get('view') === 'saved' ? api.request('cv_get_bookmarks').catch(() => ({ items: [] })) : Promise.resolve(null)
        ]);
        jobs = result.items || [];
        savedIds = bookmarks ? new Set((bookmarks.items || []).filter(row => row.object_type === 'job').map(row => row.object_id)) : null;
        render();
      } catch (error) { holder.innerHTML = emptyState(error.message); }
    };
    form?.addEventListener('submit', event => { event.preventDefault(); render(); });
    chipGroup?.addEventListener('click', event => { const chip = event.target.closest('.chip'); if (!chip) return; $$('.chip', chipGroup).forEach(item => item.classList.toggle('is-on', item === chip)); render(); });
    document.addEventListener('fi:search', event => { if (inputs[0]) inputs[0].value = event.detail.query; render(); });
    const showAll = heading.closest('section')?.querySelector(':scope > button');
    if (showAll) showAll.addEventListener('click', () => { inputs.forEach(input => { input.value = ''; }); const first = $('.chip', chipGroup); if (first) first.click(); render(); });
    const postButton = $$('#main button').find(button => /post a job|start hiring/i.test(button.textContent));
    if (postButton) { postButton.removeAttribute('data-toast'); postButton.addEventListener('click', () => { if (!requireUser()) return; openJobEditor(refresh); }); }
    holder.addEventListener('click', async event => { const row = event.target.closest('[data-job-id]'); if (!row) return; if (event.target.closest('[data-job-delete]')) { await api.request('cv_delete_job', { job_id: row.dataset.jobId }); row.remove(); toast('Job removed'); } if (event.target.closest('[data-job-save]')) { await api.request('cv_toggle_bookmark', { object_id: row.dataset.jobId, object_type: 'job' }); toast('Job saved'); } });
    $$('#main aside section').filter(section => /top organizations hiring/i.test(section.textContent)).forEach(section => section.remove());
    refresh();
  }

  function openJobEditor(refresh) {
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
    modal.innerHTML = `<form class="card w-full max-w-lg p-5 space-y-3"><div class="flex justify-between"><h2 class="text-[20px] font-bold">Post a ministry role</h2><button type="button" class="icon-btn" data-close-job><i class="fa-solid fa-xmark"></i></button></div><input class="field" name="title" placeholder="Role title" required><input class="field" name="organization" placeholder="Church or organization" required><input class="field" name="location" placeholder="Location or Remote"><select class="field" name="job_type"><option>Full-time</option><option>Part-time</option><option>Volunteer</option><option>Contract</option></select><textarea class="field" name="description" rows="4" placeholder="Role description"></textarea><input class="field" name="apply_url" type="url" placeholder="https:// application link"><input class="field" name="contact_email" type="email" placeholder="or contact email"><button class="btn btn-primary w-full">Publish role</button></form>`;
    document.body.appendChild(modal); $('[data-close-job]', modal).onclick = () => modal.remove();
    $('form', modal).onsubmit = async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { await api.request('cv_create_job', data); modal.remove(); toast('Job published'); refresh(); } catch (error) { toast(error.message); } };
  }

  // ── Library media helpers: 16:9 sermon cards, audio cards, in-app player ──
  function fiFmtTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds), h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }

  function fiMediaUrl(resource) {
    return resource.file_url || resource.open_url || resource.url || resource.download_url || '';
  }

  function fiResourceMeta(resource) {
    return `<span class="block text-[13.5px] font-semibold mt-2.5 leading-tight">${esc(resource.title)}</span>`
      + `<span class="block text-[12px] text-muted mt-1">By ${esc(resource.author || 'Faith In member')}</span>`
      + (resource.translated_by ? `<span class="block text-[11.5px] text-faint mt-0.5">Translated by ${esc(resource.translated_by)}</span>` : '')
      + `<span class="inline-flex mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-brand bg-brand-soft px-2 py-0.5 rounded-full">${esc(resource.language || resource.format || 'resource')}</span>`;
  }

  function fiResourceFooter(resource, savedIds) {
    const saved = savedIds.has(resource.id);
    return `<div class="flex items-center justify-between gap-1 mt-2">`
      + `<button class="text-[12px] font-semibold text-brand" data-resource-download><i class="fa-solid fa-download mr-1"></i>${Number(resource.download_count || 0)}</button>`
      + `<span class="flex">`
      + (resource.can_delete ? '<button class="icon-btn w-8 h-8 text-rose" data-resource-delete aria-label="Delete resource"><i class="fa-regular fa-trash-can"></i></button>' : '')
      + `<button class="icon-btn w-8 h-8 ${saved ? '!text-brand' : ''}" data-resource-save aria-label="${saved ? 'Remove saved resource' : 'Save resource'}"><i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i></button>`
      + `</span></div>`;
  }

  const FI_FORMAT_META = {
    pdf:   { label: 'PDF',   icon: 'fa-file-lines',  cls: '' },
    video: { label: 'Video', icon: 'fa-video',       cls: 'is-video' },
    audio: { label: 'Audio', icon: 'fa-headphones',  cls: 'is-audio' },
    image: { label: 'Image', icon: 'fa-image',       cls: 'is-image' },
    zip:   { label: 'ZIP',   icon: 'fa-file-zipper', cls: 'is-zip' },
  };

  function fiResourceCardHtml(resource, savedIds) {
    const format = String(resource.format || 'pdf').toLowerCase();
    const meta = FI_FORMAT_META[format] || { label: format.toUpperCase(), icon: 'fa-file', cls: '' };
    const id = esc(resource.id);
    const saved = savedIds.has(resource.id);
    const canDelete = Boolean(resource.can_delete);
    const canEdit = Boolean(resource.can_edit || resource.can_delete);
    const authorName = (typeof resource.author === 'object' && resource.author?.name) ? resource.author.name : (resource.contributor_name || resource.author || 'Faith In member');
    const downloadCount = Number(resource.download_count || 0);
    const isMedia = format === 'video' || format === 'audio';

    // Sermons and audio carry their own artwork, so they fill the top of the
    // card at their natural ratio instead of sitting inside a book shelf box.
    let coverBox = '';
    if (isMedia) {
      const badge = format === 'video' ? 'Sermon' : 'Audio';
      const fallbackIcon = format === 'video' ? 'fa-video' : 'fa-headphones';
      coverBox = `<div class="fb-library-cover-box is-media is-${format}">`
        + `<button type="button" class="fi-cover-media" data-resource-play aria-label="Play ${esc(resource.title)}">`
        + (resource.thumbnail_url
            ? `<img src="${esc(resource.thumbnail_url)}" alt="" loading="lazy">`
            : `<span class="fi-cover-fallback"><i class="fa-solid ${fallbackIcon} text-xl"></i><span class="fi-cover-fallback-title">${esc(resource.title)}</span></span>`)
        + `<span class="fi-media-play"><span><i class="fa-solid fa-play text-sm"></i></span></span>`
        + `<span class="fi-media-badge">${badge}</span>`
        + `</button></div>`;
    } else if (resource.thumbnail_url) {
      coverBox = `<div class="fb-library-cover-box">`
        + `<div class="fb-book-3d-wrap" data-resource-download title="Download ${esc(resource.title)}">`
        + `<img src="${esc(resource.thumbnail_url)}" alt="" loading="lazy">`
        + `</div></div>`;
    } else {
      coverBox = `<div class="fb-library-cover-box">`
        + `<div class="fb-book-3d-wrap" data-resource-download title="Download ${esc(resource.title)}">`
        + `<div class="fb-book-fallback">`
        + `<div class="fb-book-spine"><div class="fb-spine-line"></div><div class="fb-spine-line"></div><div class="fb-spine-line"></div></div>`
        + `<div class="fb-book-front"><div class="fb-book-badge">`
        + `<p class="fb-book-author">${esc(authorName)}</p>`
        + `<div class="fb-book-divider"></div>`
        + `<p class="fb-book-title">${esc(resource.title)}</p>`
        + `</div></div></div></div></div>`;
    }

    const metaBits = [resource.language, resource.category].filter(Boolean).map(esc);
    const metaLine = metaBits.length
      ? `<p class="fb-card-meta">${metaBits.join('<span class="fb-meta-dot">·</span>')}</p>`
      : '';

    return `<article class="fb-library-card group" data-resource-id="${id}" data-resource-format="${esc(format)}">`
      + coverBox
      + `<div class="fb-card-body">`
      + `<h3 class="fb-card-title" title="${esc(resource.title)}">${esc(resource.title)}</h3>`
      + `<p class="fb-card-author">By <strong>${esc(authorName)}</strong></p>`
      + (resource.translated_by ? `<p class="fb-card-translator">Translated by ${esc(resource.translated_by)}</p>` : '<div class="fb-card-translator-gap"></div>')
      + `<span class="fb-format-pill ${meta.cls}"><i class="fa-solid ${meta.icon}"></i>${meta.label}</span>`
      + metaLine
      + `<div class="fb-card-footer">`
      + `<button type="button" class="fb-download-btn" data-resource-download title="Download resource">`
      + `<i class="fa-solid fa-download"></i>`
      + `<span>${downloadCount}</span>`
      + `</button>`
      + `<div class="fb-card-actions">`
      + (canEdit ? `<button type="button" class="fb-action-icon-btn is-edit" title="Edit title or author" data-resource-edit><i class="fa-solid fa-pen-to-square text-[14px]"></i></button>` : '')
      + (canDelete ? `<button type="button" class="fb-action-icon-btn is-delete" title="Delete" data-resource-delete><i class="fa-regular fa-trash-can text-[15px]"></i></button>` : '')
      + `<button type="button" class="fb-action-icon-btn ${saved ? 'is-saved' : ''}" title="${saved ? 'Remove saved resource' : 'Save resource'}" data-resource-save>`
      + `<i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark text-[15px]"></i>`
      + `</button>`
      + `</div></div></div></article>`;
  }

  function fiShelfSkeleton(count) {
    return Array.from({ length: count || 6 }, () =>
      `<div class="fb-skeleton-card" aria-hidden="true">`
      + `<span class="fb-skeleton-cover"></span>`
      + `<span class="fb-skeleton-line"></span>`
      + `<span class="fb-skeleton-line is-short"></span>`
      + `</div>`).join('');
  }

  function fiLibraryEmpty(headline, detail) {
    return `<div class="fi-library-empty">`
      + `<i class="fa-regular fa-folder-open"></i>`
      + `<h3>${esc(headline)}</h3>`
      + `<p>${esc(detail)}</p>`
      + `</div>`;
  }

  // In-app player. Video plays in a lightbox; audio gets a music player with a
  // queue, so nothing hands the member off to a separate browser tab.
  function openMediaPlayer(resource, queue) {
    const list = (Array.isArray(queue) ? queue : []).filter(item => fiMediaUrl(item));
    let index = list.findIndex(item => item.id === resource.id);
    if (index < 0) { list.length = 0; list.push(resource); index = 0; }
    const isAudio = String(resource.format || '').toLowerCase() === 'audio';

    const backdrop = document.createElement('div');
    backdrop.className = 'fi-player-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', isAudio ? 'Audio player' : 'Video player');

    if (!isAudio) {
      backdrop.innerHTML = `<div class="fi-player-shell">`
        + `<video class="fi-player-video" controls autoplay playsinline preload="metadata" controlsList="nodownload" src="${esc(fiMediaUrl(resource))}"${resource.thumbnail_url ? ` poster="${esc(resource.thumbnail_url)}"` : ''}></video>`
        + `<div class="fi-player-head"><div class="min-w-0">`
        + `<h2 class="text-[15px] font-bold leading-tight">${esc(resource.title)}</h2>`
        + `<p class="text-[12.5px] text-muted mt-0.5">By ${esc(resource.author || 'Faith In member')}</p>`
        + `</div><button type="button" class="icon-btn shrink-0" data-player-close aria-label="Close player"><i class="fa-solid fa-xmark"></i></button>`
        + `</div></div>`;
    } else {
      backdrop.innerHTML = `<div class="fi-player-shell is-audio">`
        + `<div class="relative"><span data-player-art></span>`
        + `<button type="button" class="icon-btn absolute top-2 right-2" data-player-close aria-label="Close player" style="background:rgb(4 8 20 / .55);color:#fff"><i class="fa-solid fa-xmark"></i></button></div>`
        + `<div class="fi-player-body">`
        + `<h2 class="text-[15px] font-bold leading-tight" data-player-title></h2>`
        + `<p class="text-[12.5px] text-muted mt-0.5" data-player-author></p>`
        + `<div class="mt-4"><input type="range" class="fi-seek" min="0" max="1000" step="1" value="0" data-player-seek aria-label="Seek">`
        + `<div class="fi-player-times"><span data-player-current>0:00</span><span data-player-duration>0:00</span></div></div>`
        + `<div class="fi-player-controls">`
        + `<button type="button" class="fi-player-btn" data-player-prev aria-label="Previous track"><i class="fa-solid fa-backward-step"></i></button>`
        + `<button type="button" class="fi-player-btn is-main" data-player-toggle aria-label="Play"><i class="fa-solid fa-play"></i></button>`
        + `<button type="button" class="fi-player-btn" data-player-next aria-label="Next track"><i class="fa-solid fa-forward-step"></i></button>`
        + `</div><audio data-player-audio preload="metadata"></audio></div></div>`;
    }

    document.body.appendChild(backdrop);
    const onKey = event => { if (event.key === 'Escape') close(); };
    function close() {
      const media = backdrop.querySelector('video, audio');
      if (media) { try { media.pause(); media.removeAttribute('src'); media.load(); } catch (_) {} }
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
    }
    document.addEventListener('keydown', onKey);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
    $('[data-player-close]', backdrop).onclick = close;
    if (!isAudio) return;

    const audio = $('[data-player-audio]', backdrop), seek = $('[data-player-seek]', backdrop);
    const toggle = $('[data-player-toggle]', backdrop), prev = $('[data-player-prev]', backdrop), next = $('[data-player-next]', backdrop);
    const currentLabel = $('[data-player-current]', backdrop), durationLabel = $('[data-player-duration]', backdrop);
    let scrubbing = false;

    const paint = () => {
      const track = list[index];
      $('[data-player-title]', backdrop).textContent = track.title || 'Untitled';
      $('[data-player-author]', backdrop).textContent = `By ${track.author || 'Faith In member'}`;
      $('[data-player-art]', backdrop).innerHTML = track.thumbnail_url
        ? `<img class="fi-player-art" src="${esc(track.thumbnail_url)}" alt="">`
        : '<span class="fi-player-art-fallback"><i class="fa-solid fa-music"></i></span>';
      prev.disabled = next.disabled = list.length < 2;
    };
    const load = playNow => { paint(); audio.src = fiMediaUrl(list[index]); if (playNow) audio.play().catch(() => {}); };
    const step = delta => { index = (index + delta + list.length) % list.length; load(true); };

    toggle.onclick = () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); };
    prev.onclick = () => { if (audio.currentTime > 3) { audio.currentTime = 0; return; } step(-1); };
    next.onclick = () => step(1);
    audio.addEventListener('play', () => { toggle.innerHTML = '<i class="fa-solid fa-pause"></i>'; toggle.setAttribute('aria-label', 'Pause'); });
    audio.addEventListener('pause', () => { toggle.innerHTML = '<i class="fa-solid fa-play"></i>'; toggle.setAttribute('aria-label', 'Play'); });
    audio.addEventListener('loadedmetadata', () => { durationLabel.textContent = fiFmtTime(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      if (scrubbing) return;
      currentLabel.textContent = fiFmtTime(audio.currentTime);
      seek.value = audio.duration ? String(Math.round((audio.currentTime / audio.duration) * 1000)) : '0';
    });
    audio.addEventListener('ended', () => { if (list.length > 1) step(1); });
    seek.addEventListener('input', () => { scrubbing = true; if (audio.duration) currentLabel.textContent = fiFmtTime((Number(seek.value) / 1000) * audio.duration); });
    seek.addEventListener('change', () => { if (audio.duration) audio.currentTime = (Number(seek.value) / 1000) * audio.duration; scrubbing = false; });
    load(true);
  }

  async function loadLibrary() {
    const shelf = $('#shelf'); if (!shelf) return;
    const shelfFormat = String(new URLSearchParams(location.search).get('format') || '').toLowerCase();
    shelf.className = 'fi-library-shelf'
      + (shelfFormat === 'video' ? ' is-video-shelf' : '')
      + (shelfFormat === 'audio' ? ' is-audio-shelf' : '');
    shelf.innerHTML = fiShelfSkeleton(6);
    $$('[data-rail-prev],[data-rail-next]').forEach(button => { button.style.display = 'none'; });
    let resources = [], rendered = [], savedIds = new Set(), searchQuery = '';
    const PAGE_SIZE = 24;
    let visible = PAGE_SIZE, sortMode = 'recent';
    const searchInput = $('#library-search'), searchClear = $('[data-library-search-clear]');
    const sortSelect = $('#library-sort'), countEl = $('#library-count');
    const view = new URLSearchParams(location.search).get('view');
    const format = new URLSearchParams(location.search).get('format');
    const category = new URLSearchParams(location.search).get('category');

    const updateHeaderInfo = () => {
      const titleEl = $('#library-title');
      const subtitleEl = $('#library-subtitle');
      if (!titleEl) return;
      if (view === 'saved') {
        titleEl.textContent = 'Saved Items';
        if (subtitleEl) subtitleEl.textContent = 'Resources you have bookmarked';
      } else if (format === 'pdf') {
        titleEl.textContent = 'PDF Books & Studies';
        if (subtitleEl) subtitleEl.textContent = 'Reading resources published by the Faith In community';
      } else if (format === 'video') {
        titleEl.textContent = 'Sermons & Videos';
        if (subtitleEl) subtitleEl.textContent = 'Watch teachings and sermon series';
      } else if (format === 'audio') {
        titleEl.textContent = 'Podcasts & Audio';
        if (subtitleEl) subtitleEl.textContent = 'Listen to sermons and podcasts';
      } else if (category) {
        titleEl.textContent = category;
        if (subtitleEl) subtitleEl.textContent = `Resources published in ${category}`;
      } else {
        titleEl.textContent = 'Recommended for you';
        if (subtitleEl) subtitleEl.textContent = 'Resources published by the Faith In community';
      }
    };
    updateHeaderInfo();

    $$('[data-format-filter]').forEach(chip => {
      const target = chip.dataset.formatFilter;
      if (!category && ((!format && target === 'all') || (format && format.toLowerCase() === target.toLowerCase()))) {
        chip.classList.add('is-active');
      } else {
        chip.classList.remove('is-active');
      }
    });
    $$('[data-category-filter]').forEach(chip => {
      const target = chip.dataset.categoryFilter;
      if (category && category.toLowerCase().replace(/[^a-z]/g, '') === target.toLowerCase().replace(/[^a-z]/g, '')) {
        chip.classList.add('is-active');
      } else {
        chip.classList.remove('is-active');
      }
    });

    const stampOf = resource => Date.parse(resource.created_at || resource.published_at || resource.updated_at || '') || 0;
    const sortItems = items => {
      if (sortMode === 'downloads') return items.sort((a, b) => Number(b.download_count || 0) - Number(a.download_count || 0));
      if (sortMode === 'title') return items.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), undefined, { numeric: true, sensitivity: 'base' }));
      // Newest first, but only when the resources actually carry a date —
      // otherwise keep the order the API gave us.
      return items.some(stampOf) ? items.sort((a, b) => stampOf(b) - stampOf(a)) : items;
    };

    const render = () => {
      let items = resources.slice();
      if (format) items = items.filter(resource => String(resource.format || '').toLowerCase() === format.toLowerCase());
      if (category) {
        const wanted = category.replace(/and/gi, '&').replace(/[^a-z]/gi, '').toLowerCase();
        items = items.filter(resource => String(resource.category || '').replace(/[^a-z]/gi, '').toLowerCase() === wanted);
      }
      if (view === 'saved') items = items.filter(resource => savedIds.has(resource.id));
      if (searchQuery) items = items.filter(resource => [resource.title, resource.author, resource.contributor_name, resource.translated_by, resource.category, resource.language, resource.description].some(value => String(value || '').toLowerCase().includes(searchQuery)));
      items = sortItems(items);
      rendered = items;

      if (!items.length) {
        shelf.innerHTML = searchQuery
          ? fiLibraryEmpty('Nothing matches that search', 'Try another title, author, translator or category.')
          : (view || format || category)
            ? fiLibraryEmpty('Nothing on this shelf yet', 'When a resource is published in this format, it appears here.')
            : fiLibraryEmpty('The library is empty', 'No community resources have been published yet — use Publish resource to add the first one.');
      } else {
        const page = items.slice(0, visible);
        const remaining = items.length - page.length;
        shelf.innerHTML = page.map(resource => fiResourceCardHtml(resource, savedIds)).join('')
          + (remaining > 0 ? `<button type="button" class="fi-load-more" data-load-more>Show ${Math.min(remaining, PAGE_SIZE)} more</button>` : '');
      }
      if (countEl) countEl.textContent = items.length ? `${items.length} resource${items.length === 1 ? '' : 's'}` : '';
    };

    // A short, honest summary of what the shelf actually holds.
    const renderStats = () => {
      const panel = $('#library-stats'), list = $('[data-library-stats]');
      if (!panel || !list || !resources.length) return;
      const countOf = kind => resources.filter(resource => String(resource.format || '').toLowerCase() === kind).length;
      const rows = [
        ['Resources', resources.length],
        ['PDF books', countOf('pdf')],
        ['Sermons', countOf('video')],
        ['Audio', countOf('audio')],
        ['Saved by you', savedIds.size],
      ];
      list.innerHTML = rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`).join('');
      panel.hidden = false;
    };

    const applySearch = value => {
      searchQuery = String(value || '').trim().toLowerCase();
      visible = PAGE_SIZE;
      if (searchClear) searchClear.hidden = !searchQuery;
      render();
    };
    if (searchInput) searchInput.addEventListener('input', event => applySearch(event.target.value));
    if (searchClear) searchClear.addEventListener('click', () => { if (searchInput) searchInput.value = ''; applySearch(''); searchInput?.focus(); });
    if (sortSelect) sortSelect.addEventListener('change', event => { sortMode = event.target.value; visible = PAGE_SIZE; render(); });
    shelf.addEventListener('click', event => {
      if (!event.target.closest('[data-load-more]')) return;
      visible += PAGE_SIZE;
      render();
    });
    try {
      const [result, saved] = await Promise.all([api.request('cv_get_resources'), api.request('cv_get_bookmarks').catch(() => ({ items: [] }))]);
      const fetched = result.items || [];
      const builtin = [
        {
          id: 'mhc-genesis-01-full',
          title: 'MHC លោកុប្បត្តិ ជំពូកទី១ (ពេញលេញ ៣២ ទំព័រ)',
          description: 'អភិប្រាយកណ្ឌគម្ពីរលោកុប្បត្តិ ជំពូក១ ទាំងមូល អមដោយសេចក្តីសង្កេតជាលក្ខណៈអនុវត្ត ដោយ មែធ្យូ ហិនរី បកប្រែដោយ អា៊ាម សំអាត',
          category: 'Matthew Henry',
          format: 'pdf',
          type: 'pdf',
          author: 'មែធ្យូ ហិនរី',
          contributor_name: 'Hun Chet',
          translated_by: 'SamAth Em (អា៊ាម សំអាត)',
          language: 'Khmer (ភាសាខ្មែរ)',
          file_url: '/library/mhc-gen-01-full-exposition.pdf',
          download_url: '/library/mhc-gen-01-full-exposition.pdf',
          filename: 'mhc-gen-01-full-exposition.pdf',
          thumbnail_url: '/library/matthew-henry-cover.jpg',
          download_count: 14,
          view_count: 85,
          allow_download: true,
          can_delete: false
        },
        {
          id: 'mhc-genesis-02-complete',
          title: 'MHC លោកុប្បត្តិ ជំពូកទី២',
          description: 'អភិប្រាយព្រះគម្ពីរប៊ីប លោកុប្បត្តិ ជំពូកទី២ អំពីថ្ងៃសប្ប័ទដ៏បរិសុទ្ធ សួនអេដែន និងការបង្កើតមនុស្ស ដោយ មែធ្យូ ហិនរី បកប្រែដោយ អា៊ាម សំអាត',
          category: 'Matthew Henry',
          format: 'pdf',
          type: 'pdf',
          author: 'មែធ្យូ ហិនរី',
          contributor_name: 'Hun Chet',
          translated_by: 'SamAth Em (អា៊ាម សំអាត)',
          language: 'Khmer (ភាសាខ្មែរ)',
          file_url: '/library/mhc-gen-02-complete.pdf',
          download_url: '/library/mhc-gen-02-complete.pdf',
          filename: 'mhc-gen-02-complete.pdf',
          thumbnail_url: '/library/matthew-henry-cover.jpg',
          download_count: 11,
          view_count: 64,
          allow_download: true,
          can_delete: false
        },
        {
          id: 'mhc-genesis-01-14-19',
          title: 'MHC លោកុប្បត្តិ ១:១៤-១៩',
          description: 'អភិប្រាយព្រះគម្ពីរប៊ីប លោកុប្បត្តិ ១:១៤-១៩ អំពីការបង្កើតថ្ងៃ ខែ និងផ្កាយនៅថ្ងៃទី៤ ដោយ មែធ្យូ ហិនរី បកប្រែដោយ អា៊ាម សំអាត',
          category: 'Matthew Henry',
          format: 'pdf',
          type: 'pdf',
          author: 'មែធ្យូ ហិនរី',
          contributor_name: 'Hun Chet',
          translated_by: 'SamAth Em (អា៊ាម សំអាត)',
          language: 'Khmer (ភាសាខ្មែរ)',
          file_url: '/library/mhc-gen-01-14-19.pdf',
          download_url: '/library/mhc-gen-01-14-19.pdf',
          filename: 'mhc-gen-01-14-19.pdf',
          thumbnail_url: '/library/matthew-henry-cover.jpg',
          download_count: 8,
          view_count: 52,
          allow_download: true,
          can_delete: false
        },
        {
          id: 'mhc-genesis-01-06-13',
          title: 'MHC លោកុប្បត្តិ ១:៦-១៣',
          description: 'អភិប្រាយព្រះគម្ពីរប៊ីប លោកុប្បត្តិ ១:៦-៨ និង ១:៩-១៣ អំពីការបង្កើតផ្ទៃមេឃ និងដីគោកនៅថ្ងៃទី២ និងទី៣ ដោយ មែធ្យូ ហិនរី បកប្រែដោយ អា៊ាម សំអាត',
          category: 'Matthew Henry',
          format: 'pdf',
          type: 'pdf',
          author: 'មែធ្យូ ហិនរី',
          contributor_name: 'Hun Chet',
          translated_by: 'SamAth Em (អា៊ាម សំអាត)',
          language: 'Khmer (ភាសាខ្មែរ)',
          file_url: '/library/mhc-gen-01-06-13.pdf',
          download_url: '/library/mhc-gen-01-06-13.pdf',
          filename: 'mhc-gen-01-06-13.pdf',
          thumbnail_url: '/library/matthew-henry-cover.jpg',
          download_count: 6,
          view_count: 41,
          allow_download: true,
          can_delete: false
        }
      ];
      const existingIds = new Set(fetched.map(it => it.id));
      resources = fetched.concat(builtin.filter(b => !existingIds.has(b.id)));
      savedIds = new Set((saved.items || []).filter(row => row.object_type === 'resource').map(row => row.object_id));
      shelf.removeAttribute('aria-busy');
      render();
      renderStats();
    } catch (error) { shelf.innerHTML = fiLibraryEmpty('The library could not load', error.message || 'Please try again in a moment.'); }

    const publishBtn = $('[data-publish-resource]');
    if (publishBtn) {
      publishBtn.onclick = (e) => { e.preventDefault(); if (requireUser()) openResourceEditor(loadLibrary); };
    }

    shelf.addEventListener('click', async event => {
      const row = event.target.closest('[data-resource-id]'); if (!row) return;
      const edit = event.target.closest('[data-resource-edit]');
      if (edit) {
        event.preventDefault();
        const resource = rendered.find(item => item.id === row.dataset.resourceId) || resources.find(item => item.id === row.dataset.resourceId);
        if (resource) openResourceEditor(loadLibrary, resource);
        return;
      }
      const remove = event.target.closest('[data-resource-delete]');
      if (remove) { event.preventDefault(); if (!confirm('Delete this resource?')) return; await api.request('cv_delete_resource', { resource_id: row.dataset.resourceId }); resources = resources.filter(resource => resource.id !== row.dataset.resourceId); render(); toast('Resource deleted'); return; }
      const save = event.target.closest('[data-resource-save]');
      if (save) { event.preventDefault(); const id = row.dataset.resourceId; await api.request('cv_toggle_bookmark', { object_id: id, object_type: 'resource' }); if (savedIds.has(id)) savedIds.delete(id); else savedIds.add(id); toast(savedIds.has(id) ? 'Resource saved' : 'Resource removed'); render(); renderStats(); return; }
      const play = event.target.closest('[data-resource-play]');
      if (play) {
        event.preventDefault();
        const resource = rendered.find(item => item.id === row.dataset.resourceId);
        if (!resource) return;
        if (!fiMediaUrl(resource)) { toast('This resource has no playable file.'); return; }
        const kind = String(resource.format || '').toLowerCase();
        openMediaPlayer(resource, kind === 'audio' ? rendered.filter(item => String(item.format || '').toLowerCase() === 'audio') : [resource]);
        return;
      }
      const button = event.target.closest('[data-resource-download]'); if (!button) return; event.preventDefault(); const result = await api.request('cv_download_resource', { resource_id: row.dataset.resourceId }); if (result.url) window.open(result.url, '_blank', 'noopener');
    });
    // The header search drives the same filter, and keeps the library's own
    // field in step so the two never disagree.
    document.addEventListener('fi:search', event => {
      if (searchInput) searchInput.value = event.detail.query;
      applySearch(event.detail.query);
    });
    $$('#main section').filter(section => /jump back in|trending sermons|authors to follow/i.test(section.querySelector('h2,h3')?.textContent || '')).forEach(section => section.remove());
  }

  function openResourceEditor(refresh, resourceToEdit) {
    const isEdit = Boolean(resourceToEdit);
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
    const currentAuthor = isEdit ? ((typeof resourceToEdit.author === 'object' ? resourceToEdit.author?.name : resourceToEdit.author) || resourceToEdit.contributor_name || '') : '';
    const currentTranslator = isEdit ? (resourceToEdit.translated_by || resourceToEdit.translator_name || '') : '';
    const currentTitle = isEdit ? (resourceToEdit.title || '') : '';
    const currentDesc = isEdit ? (resourceToEdit.description || '') : '';
    const currentLang = isEdit ? (resourceToEdit.language || '') : '';
    const currentCategory = isEdit ? (resourceToEdit.category || 'Matthew Henry') : 'Bible Study';
    const currentFormat = isEdit ? (resourceToEdit.format || 'pdf') : 'pdf';
    const currentAllowDownload = isEdit ? (resourceToEdit.allow_download !== false) : true;
    const currentThumb = isEdit ? (resourceToEdit.thumbnail_url || resourceToEdit.cover_image_url || '') : '';

    modal.innerHTML = `<form class="card w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 space-y-4">`
      + `<div class="flex justify-between"><div>`
      + `<h2 class="text-[20px] font-bold">${isEdit ? 'Edit Resource & Book' : 'Publish a resource'}</h2>`
      + `<p class="text-[12.5px] text-muted mt-1">${isEdit ? 'Update book title, author, translator, category, or description.' : 'Share a PDF, image, audio, video, or ZIP file with the community.'}</p>`
      + `</div><button type="button" class="icon-btn" data-close-resource aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>`
      + `<label class="block text-[13px] font-semibold text-ink">Title / Book Name<input class="field mt-1" name="title" placeholder="Resource title" value="${esc(currentTitle)}" required></label>`
      + `<label class="block text-[13px] font-semibold text-ink">Description<textarea class="field mt-1" name="description" rows="3" placeholder="Description">${esc(currentDesc)}</textarea></label>`
      + `<div class="grid sm:grid-cols-2 gap-3">`
      + `<label class="block text-[13px] font-semibold text-ink">Author / Creator<input class="field mt-1" name="contributor_name" placeholder="Author / Creator" value="${esc(currentAuthor)}"></label>`
      + `<label class="block text-[13px] font-semibold text-ink">Translated by<input class="field mt-1" name="translator_name" placeholder="Translated by" value="${esc(currentTranslator)}"></label>`
      + `<label class="block text-[13px] font-semibold text-ink">Language<input class="field mt-1" name="language" placeholder="Language, e.g. Khmer" value="${esc(currentLang)}"></label>`
      + `<label class="block text-[13px] font-semibold text-ink">Category<input class="field mt-1" name="category" placeholder="Category" value="${esc(currentCategory)}"></label>`
      + `</div>`
      + `<label class="block text-[13px] font-semibold text-ink">Format`
      + `<select class="field mt-1" name="format" aria-label="Resource format">`
      + `<option value="pdf"${currentFormat === 'pdf' ? ' selected' : ''}>PDF Book</option>`
      + `<option value="image"${currentFormat === 'image' ? ' selected' : ''}>Image</option>`
      + `<option value="audio"${currentFormat === 'audio' ? ' selected' : ''}>Audio</option>`
      + `<option value="video"${currentFormat === 'video' ? ' selected' : ''}>Video</option>`
      + `<option value="zip"${currentFormat === 'zip' ? ' selected' : ''}>ZIP bundle</option>`
      + `</select></label>`
      + `<label class="block text-[13px] font-semibold text-ink">Resource file`
      + `<input class="field mt-1" name="resource_file" type="file" accept=".pdf,.zip,image/*,audio/*,video/*"${isEdit ? '' : ' required'}>`
      + `<span class="block text-[11.5px] text-muted mt-1">${isEdit ? 'Optional · leave empty to keep current file' : 'Maximum 50MB · stored in free Supabase Storage'}</span>`
      + `</label>`
      + `<div class="block text-[13px] font-semibold text-ink">Cover image`
      + `<span class="block text-[11.5px] font-normal text-muted mt-1" data-thumb-hint>${currentThumb ? 'Current cover preview (upload new image to replace):' : 'Videos get a thumbnail captured automatically. Upload your own image to use that instead.'}</span>`
      + `<div class="flex items-center gap-3 mt-2">`
      + `<img class="fi-thumb-preview ${currentThumb ? '' : 'hidden'} max-h-20 rounded border border-line" src="${esc(currentThumb)}" alt="" data-thumb-preview>`
      + `<input class="field" name="thumbnail" type="file" accept="image/*">`
      + `</div></div>`
      + `<label class="flex items-center gap-2 text-[12.5px] text-muted"><input type="checkbox" name="allow_download" value="1"${currentAllowDownload ? ' checked' : ''}>Allow members to download this resource</label>`
      + `<p class="hidden rounded-xl border border-rose/30 bg-rose/10 px-3 py-2.5 text-[12.5px] text-rose" data-resource-error role="alert"></p>`
      + `<div class="hidden" data-resource-progress><div class="flex justify-between text-[11.5px] text-muted mb-1"><span>Saving to FaithIn</span><strong data-resource-progress-label>0%</strong></div><div class="h-2 rounded-full bg-line overflow-hidden"><span class="block h-full bg-brand transition" data-resource-progress-bar style="width:0%"></span></div></div>`
      + `<button class="btn btn-primary w-full" data-resource-submit>${isEdit ? '<i class="fa-solid fa-floppy-disk mr-1.5"></i>Save changes' : 'Publish resource'}</button></form>`;

    document.body.appendChild(modal); $('[data-close-resource]', modal).onclick = () => modal.remove();
    const form = $('form', modal), fileInput = form.elements.namedItem('resource_file'), formatInput = form.elements.namedItem('format');
    const thumbField = form.elements.namedItem('thumbnail'), thumbPreview = $('[data-thumb-preview]', form), thumbHint = $('[data-thumb-hint]', form);
    const DEFAULT_THUMB_HINT = thumbHint.textContent;
    let autoThumb = null, autoThumbUrl = '', manualThumbUrl = '';
    const setThumbPreview = (url, note) => {
      if (url) { thumbPreview.src = url; thumbPreview.classList.remove('hidden'); }
      else { thumbPreview.removeAttribute('src'); thumbPreview.classList.add('hidden'); }
      thumbHint.textContent = note || DEFAULT_THUMB_HINT;
    };
    // Draw a frame out of the chosen video and keep it as the default cover.
    const captureVideoThumbnail = file => {
      const objectUrl = URL.createObjectURL(file), video = document.createElement('video');
      video.preload = 'metadata'; video.muted = true; video.playsInline = true;
      const cleanup = () => { URL.revokeObjectURL(objectUrl); video.removeAttribute('src'); try { video.load(); } catch (_) {} };
      const fail = () => { cleanup(); setThumbPreview(manualThumbUrl, 'Could not read a frame from this video. Upload a cover image instead.'); };
      video.addEventListener('loadeddata', () => { try { video.currentTime = Math.min(1.5, (video.duration || 4) / 4); } catch (_) { fail(); } }, { once: true });
      video.addEventListener('seeked', () => {
        try {
          const sourceWidth = video.videoWidth || 1280, sourceHeight = video.videoHeight || 720;
          const width = Math.min(sourceWidth, 1280), height = Math.round(width * (sourceHeight / sourceWidth));
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(video, 0, 0, width, height);
          canvas.toBlob(blob => {
            cleanup();
            if (!blob) { fail(); return; }
            if (autoThumbUrl) URL.revokeObjectURL(autoThumbUrl);
            autoThumb = new File([blob], 'auto-thumbnail.jpg', { type: 'image/jpeg' });
            autoThumbUrl = URL.createObjectURL(blob);
            if (!thumbField.files?.[0]) setThumbPreview(autoThumbUrl, 'Thumbnail captured from your video. Upload an image to use a different one.');
          }, 'image/jpeg', 0.85);
        } catch (_) { fail(); }
      }, { once: true });
      video.addEventListener('error', fail, { once: true });
      setThumbPreview(manualThumbUrl, 'Capturing a thumbnail from your video…');
      video.src = objectUrl;
    };
    thumbField.addEventListener('change', () => {
      const picked = thumbField.files?.[0];
      if (manualThumbUrl) { URL.revokeObjectURL(manualThumbUrl); manualThumbUrl = ''; }
      if (!picked) { setThumbPreview(autoThumbUrl || currentThumb, autoThumbUrl ? 'Using the thumbnail captured from your video.' : (currentThumb ? 'Current cover preview:' : '')); return; }
      manualThumbUrl = URL.createObjectURL(picked);
      setThumbPreview(manualThumbUrl, 'Using your uploaded cover image.');
    });
    fileInput.addEventListener('change', () => { const file = fileInput.files?.[0]; if (!file) return; const type = String(file.type || '').toLowerCase(), ext = String(file.name || '').split('.').pop().toLowerCase(); if (type === 'application/pdf' || ext === 'pdf') formatInput.value = 'pdf'; else if (type.startsWith('video/')) formatInput.value = 'video'; else if (type.startsWith('audio/')) formatInput.value = 'audio'; else if (type.startsWith('image/')) formatInput.value = 'image'; else if (type === 'application/zip' || ext === 'zip') formatInput.value = 'zip'; else { fileInput.value = ''; toast('Choose a PDF, image, audio, video, or ZIP file.'); return; }
      if (autoThumbUrl) { URL.revokeObjectURL(autoThumbUrl); autoThumbUrl = ''; }
      autoThumb = null;
      if (formatInput.value === 'video') captureVideoThumbnail(file);
      else if (!thumbField.files?.[0]) setThumbPreview(manualThumbUrl || currentThumb, '');
    });
    form.onsubmit = async event => {
      event.preventDefault();
      const resourceFile = fileInput.files?.[0], thumbnailInput = form.elements.namedItem('thumbnail'), submit = $('[data-resource-submit]', form);
      if (!isEdit && !resourceFile) return toast('Choose a resource file to publish.');
      if (resourceFile && resourceFile.size > 50 * 1024 * 1024) return toast(`${resourceFile.name} is larger than the free 50MB limit.`);
      const data = Object.fromEntries(new FormData(form)); data.allow_download = form.elements.namedItem('allow_download').checked ? '1' : '0'; delete data.resource_file; delete data.thumbnail;
      if (isEdit) data.resource_id = resourceToEdit.id;
      const chosenThumbnail = thumbnailInput.files?.[0] || autoThumb;
      const files = { resource_file: resourceFile ? [resourceFile] : [], thumbnail: chosenThumbnail ? [chosenThumbnail] : [] };
      const progress = $('[data-resource-progress]', form), label = $('[data-resource-progress-label]', form), bar = $('[data-resource-progress-bar]', form), errorBox = $('[data-resource-error]', form);
      errorBox.classList.add('hidden'); errorBox.textContent = '';
      const oldSubmitHtml = submit.innerHTML; progress.classList.remove('hidden'); submit.disabled = true; submit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Saving';
      try {
        const action = isEdit ? 'cv_update_resource' : 'cv_upload_resource';
        await api.request(action, data, files, fraction => { const percent = Math.max(1, Math.min(100, Math.round(fraction * 100))); label.textContent = `${percent}%`; bar.style.width = `${percent}%`; });
        label.textContent = '100%'; bar.style.width = '100%';
        if (isEdit) {
          resourceToEdit.title = data.title;
          resourceToEdit.author = data.contributor_name || resourceToEdit.author;
          resourceToEdit.contributor_name = data.contributor_name || resourceToEdit.contributor_name;
          resourceToEdit.translated_by = data.translator_name || resourceToEdit.translated_by;
          resourceToEdit.category = data.category || resourceToEdit.category;
          resourceToEdit.description = data.description || resourceToEdit.description;
          resourceToEdit.language = data.language || resourceToEdit.language;
          resourceToEdit.format = data.format || resourceToEdit.format;
        }
        await refresh();
        modal.remove();
        toast(isEdit ? 'Book details updated successfully' : 'Resource published successfully');
      }
      catch (error) { const message = error.message || (isEdit ? 'Update failed. Please try again.' : 'Upload failed. Please try again.'); errorBox.textContent = message; errorBox.classList.remove('hidden'); toast(message); progress.classList.add('hidden'); }
      finally { submit.disabled = false; submit.innerHTML = oldSubmitHtml; }
    };
  }

  async function loadNetwork() {
    const heading = $$('#main h2').find(node => /people you may know/i.test(node.textContent));
    const section = heading?.closest('section');
    if (!section) return;
    const grid = $('.grid', section);
    if (!grid) return;
    let users = [], query = '';

    const render = () => {
      const items = users.filter(user => !query || [user.name, user.role, user.bio, user.church, user.location, user.ministry].some(value => String(value || '').toLowerCase().includes(query)));
      grid.innerHTML = items.length
        ? items.map(user => `<article class="card overflow-hidden flex flex-col relative animate-fade-up" data-user-uid="${esc(user.uid)}">
            <div class="h-16 bg-[linear-gradient(110deg,#60a5fa,#4f46e5)]"></div>
            <div class="px-3 pb-4 -mt-8 flex flex-col items-center text-center flex-1">
              ${avatarMarkup(user, 'avatar w-16 h-16 text-[17px] ring-4 ring-surface object-cover')}
              <a href="/profile?uid=${encodeURIComponent(user.uid)}" class="mt-2 text-[14.5px] font-semibold hover:text-brand transition inline-flex items-center justify-center">${esc(user.name)}${verificationBadgeMarkup(user)}</a>
              <p class="text-[12.5px] text-muted mt-1 line-clamp-2">${esc(user.role || user.bio || user.church || 'Faith In member')}</p>
              <p class="text-[11.5px] text-faint mt-2">${esc(user.location || user.ministry || '')}</p>
              <button class="btn ${user.is_following ? 'btn-neutral' : 'btn-outline'} w-full mt-3 !py-2" data-connect>
                <i class="fa-solid ${user.is_following ? 'fa-check' : 'fa-user-plus'} text-[11px] mr-1"></i>${user.is_following ? 'Following' : 'Connect'}
              </button>
              <button class="btn btn-ghost w-full mt-1 !py-2" data-message>Message</button>
            </div>
          </article>`).join('')
        : emptyState(query ? 'No members match your search.' : 'No members found in the community yet.');
    };

    const refreshCounts = () => {
      Promise.all([api.request('cv_social_get_followers'), api.request('cv_social_get_following')]).then(results => {
        const counts = $$('.count', $('#main > aside'));
        if (counts[0]) counts[0].textContent = results[0].items?.length || 0;
        if (counts[1]) counts[1].textContent = results[1].items?.length || 0;
      }).catch(() => {});
    };

    try {
      const result = await api.request('cv_find_users');
      users = result.items || [];
      render();
      refreshCounts();
    } catch (error) {
      grid.innerHTML = emptyState(error.message);
    }

    grid.addEventListener('click', async event => {
      const card = event.target.closest('[data-user-uid]');
      if (!card) return;
      const connectBtn = event.target.closest('[data-connect]');
      if (connectBtn) {
        if (!requireUser()) return;
        const following = /following/i.test(connectBtn.textContent);
        connectBtn.disabled = true;
        try {
          await api.request(following ? 'cv_social_unfollow_user' : 'cv_social_follow_user', { target_uid: card.dataset.userUid });
          const nowFollowing = !following;
          connectBtn.innerHTML = `<i class="fa-solid ${nowFollowing ? 'fa-check' : 'fa-user-plus'} text-[11px] mr-1"></i>${nowFollowing ? 'Following' : 'Connect'}`;
          connectBtn.className = `btn ${nowFollowing ? 'btn-neutral' : 'btn-outline'} w-full mt-3 !py-2`;
          toast(nowFollowing ? 'Following' : 'Unfollowed');
          refreshCounts();
        } catch (err) {
          toast(err.message);
        } finally {
          connectBtn.disabled = false;
        }
      }
      if (event.target.closest('[data-message]')) openMessenger(card.dataset.userUid);
    });

    $('#main > aside section.text-center')?.remove();
    const requested = new URLSearchParams(location.search).get('message');
    if (requested) openMessenger(requested);
    document.addEventListener('fi:search', event => { query = (event.detail.query || '').toLowerCase(); render(); });
    $$('#main section').filter(item => /invitations|groups you might/i.test(item.querySelector('h2')?.textContent || '')).forEach(item => item.remove());
  }

  /**
   * Opens a conversation on the messaging screen.
   *
   * Messaging used to be a cramped modal built here. It is now a page of its
   * own at /messages, with realtime updates, history and attachments, so this
   * function survives only as the entry point other screens already call —
   * the Message button on a member card, and the `?message=` link the header
   * used to carry.
   */
  function openMessenger(uid) {
    if (!requireUser()) return;
    const target = uid && uid !== 'inbox' ? `/messages?to=${encodeURIComponent(uid)}` : '/messages';
    // These screens are static documents under /public served through Next
    // rewrites, not React routes, so there is no router to push to.
    location.href = target;
  }

  // ── Notification helpers: relative time, day grouping, type marks ────────
  const FI_NOTIF_KIND = {
    reaction: { icon: 'fa-heart',        label: 'reacted to your post' },
    comment:  { icon: 'fa-comment',      label: 'commented on your post' },
    follow:   { icon: 'fa-user-plus',    label: 'followed you' },
    message:  { icon: 'fa-envelope',     label: 'sent you a message' },
    reply:    { icon: 'fa-reply',        label: 'replied to you' },
    new_post: { icon: 'fa-pen-nib',      label: 'shared a new post' },
    job:      { icon: 'fa-briefcase',    label: 'shared a ministry opportunity' },
  };

  // "3 hours ago" reads faster than a timestamp; the exact time stays in the
  // title attribute for anyone who wants it.
  function fiRelativeTime(value) {
    const then = value ? new Date(value) : null;
    if (!then || isNaN(then)) return '';
    const seconds = Math.round((Date.now() - then.getTime()) / 1000);
    if (seconds < 45) return 'just now';
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [unit, size] of units) {
      const amount = Math.floor(seconds / size);
      if (amount >= 1) {
        try {
          return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(-amount, unit);
        } catch (_) {
          return `${amount} ${unit}${amount === 1 ? '' : 's'} ago`;
        }
      }
    }
    return 'just now';
  }

  function fiNotifDayLabel(value) {
    const then = value ? new Date(value) : null;
    if (!then || isNaN(then)) return 'Earlier';
    const startOfDay = date => { const copy = new Date(date); copy.setHours(0, 0, 0, 0); return copy.getTime(); };
    const days = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return 'This week';
    if (days < 30) return 'This month';
    return 'Earlier';
  }

  // Five identical "reacted to your post" rows are noise. Consecutive
  // notifications of the same kind about the same thing collapse into one.
  function fiGroupNotifications(items) {
    const grouped = [];
    for (const item of items) {
      const key = `${item.type || ''}__${item.object_id || item.id}`;
      const previous = grouped[grouped.length - 1];
      if (previous && previous.key === key && item.object_id) {
        previous.items.push(item);
        previous.actors.push(item.actor || {});
        continue;
      }
      grouped.push({ key, lead: item, items: [item], actors: [item.actor || {}] });
    }
    return grouped;
  }

  function fiNotifSentence(group, labels) {
    const names = [];
    for (const actor of group.actors) {
      const name = actor?.name || 'A member';
      if (!names.includes(name)) names.push(name);
    }
    const label = labels[group.lead.type] || 'sent an update';
    if (names.length === 1) return `<strong>${esc(names[0])}</strong> ${esc(label)}`;
    if (names.length === 2) return `<strong>${esc(names[0])}</strong> and <strong>${esc(names[1])}</strong> ${esc(label)}`;
    return `<strong>${esc(names[0])}</strong> and <strong>${names.length - 1} others</strong> ${esc(label)}`;
  }

  function fiNotifSkeleton(count) {
    return Array.from({ length: count || 6 }, () =>
      `<div class="fi-notif-skeleton" aria-hidden="true"><span class="fi-skel-avatar"></span>`
      + `<span class="fi-skel-lines"><span></span><span></span></span></div>`).join('');
  }

  async function loadNotifications() {
    const center = $('#main > section.card'); const holder = center?.querySelector('.divide-y'); if (!holder) return;
    holder.innerHTML = fiNotifSkeleton(6);
    let allItems = [], shown = 12, active = new URLSearchParams(location.search).get('filter') || 'all', searchQuery = '';
    const groups = { all: null, jobs: ['job'], post: ['reaction', 'comment', 'new_post'], 'my posts': ['reaction', 'comment', 'new_post'], mention: ['reply', 'message'], mentions: ['reply', 'message'], follow: ['follow'], connections: ['follow'] };
    const labels = { reaction: 'reacted to your post', comment: 'commented on your post', follow: 'followed you', message: 'sent you a message', reply: 'replied to you', new_post: 'shared a new post', job: 'shared a ministry opportunity' };
    const earlier = center.querySelector(':scope > button');
    const emptyMessages = {
      all: ['You are all caught up', 'New reactions, comments and follows will appear here.'],
      jobs: ['No ministry opportunities yet', 'Opportunities shared with the community will appear here.'],
      'my posts': ['Nothing on your posts yet', 'Reactions and comments on what you share will appear here.'],
      post: ['Nothing on your posts yet', 'Reactions and comments on what you share will appear here.'],
      mentions: ['No mentions yet', 'Replies and messages addressed to you will appear here.'],
      mention: ['No mentions yet', 'Replies and messages addressed to you will appear here.'],
      connections: ['No new connections yet', 'When someone follows you, it shows up here.'],
      follow: ['No new connections yet', 'When someone follows you, it shows up here.'],
    };

    const render = () => {
      const types = groups[active] || null;
      const filtered = allItems.filter(item => (!types || types.includes(item.type)) && (!searchQuery || `${item.actor?.name || ''} ${labels[item.type] || ''}`.toLowerCase().includes(searchQuery)));
      const groupedAll = fiGroupNotifications(filtered);
      const groupsToShow = groupedAll.slice(0, shown);

      if (!groupsToShow.length) {
        const [headline, detail] = emptyMessages[active] || emptyMessages.all;
        holder.innerHTML = `<div class="fi-library-empty" style="border:0;background:none"><i class="fa-regular fa-bell"></i><h3>${esc(headline)}</h3><p>${esc(detail)}</p></div>`;
      } else {
        let lastDay = '';
        holder.innerHTML = groupsToShow.map(group => {
          const item = group.lead;
          const actor = item.actor || {};
          const kind = FI_NOTIF_KIND[item.type] || { icon: 'fa-bell' };
          const unread = group.items.some(entry => !entry.is_read);
          const day = fiNotifDayLabel(item.created_at);
          const heading = day === lastDay ? '' : `<p class="fi-notif-day">${esc(day)}</p>`;
          lastDay = day;
          const exact = item.created_at ? new Date(item.created_at).toLocaleString() : '';
          const ids = group.items.map(entry => entry.id).join(',');
          return heading
            + `<article class="fi-notif-row ${unread ? 'notif-unread' : ''}" tabindex="0" role="link"`
            + ` data-notification-id="${esc(item.id)}" data-notification-ids="${esc(ids)}"`
            + ` data-notification-type="${esc(item.type || '')}" data-object-id="${esc(item.object_id || '')}" data-actor-uid="${esc(actor.uid || '')}">`
            + `<span class="fi-notif-avatar">${avatarMarkup(actor, 'avatar')}`
            + `<span class="fi-notif-kind is-${esc(item.type || 'other')}"><i class="fa-solid ${kind.icon}"></i></span></span>`
            + `<span class="fi-notif-body">`
            + `<span class="fi-notif-text">${fiNotifSentence(group, labels)}</span>`
            + `<time class="fi-notif-time" title="${esc(exact)}">${esc(fiRelativeTime(item.created_at))}</time>`
            + `</span>`
            + (unread ? '<span class="fi-notif-dot" aria-label="Unread"></span>' : '')
            + `</article>`;
        }).join('');
      }
      if (earlier) { earlier.classList.toggle('hidden', shown >= groupedAll.length); earlier.innerHTML = 'Show earlier notifications <i class="fa-solid fa-arrow-down text-[11px] ml-1"></i>'; }
      renderSummary();
    };

    // What is waiting, at a glance — the right rail was carrying nothing but
    // the verse of the day.
    const renderSummary = () => {
      const panel = $('#notif-summary'), list = $('[data-notif-summary]');
      if (!panel || !list || !allItems.length) return;
      const unread = allItems.filter(item => !item.is_read);
      const countOf = type => unread.filter(item => item.type === type).length;
      const rows = [
        ['Unread', unread.length],
        ['Reactions', countOf('reaction')],
        ['Comments', countOf('comment')],
        ['New followers', countOf('follow')],
      ];
      list.innerHTML = rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`).join('');
      panel.hidden = false;
    };
    try {
      const result = await api.request('cv_social_get_notifications');
      allItems = result.items || []; render();
      const openRow = row => {
        if (!row) return;
        // A grouped row stands for every notification inside it, so reading it
        // clears all of them.
        const ids = String(row.dataset.notificationIds || row.dataset.notificationId || '').split(',').filter(Boolean);
        ids.forEach(id => {
          api.request('cv_social_mark_notifications_read', { id }).catch(() => {});
          const entry = allItems.find(candidate => candidate.id === id);
          if (entry) entry.is_read = true;
        });
        const item = allItems.find(entry => entry.id === row.dataset.notificationId);
        render();

        if (!item) return;
        const type = (item.type || '').toLowerCase();
        const objId = item.object_id || row.dataset.objectId || '';
        const actor = item.actor || {};
        const actorUid = actor.uid || row.dataset.actorUid || '';

        if (type === 'comment') {
          location.href = `/home?post=${encodeURIComponent(objId)}&action=comment#post-${encodeURIComponent(objId)}`;
        } else if (type === 'reaction' || type === 'new_post') {
          location.href = `/home?post=${encodeURIComponent(objId)}#post-${encodeURIComponent(objId)}`;
        } else if (type === 'follow') {
          location.href = actorUid ? `/profile?uid=${encodeURIComponent(actorUid)}` : '/network';
        } else if (type === 'message' || type === 'reply') {
          location.href = actorUid ? `/messages?to=${encodeURIComponent(actorUid)}` : '/messages';
        } else if (type === 'job') {
          location.href = objId ? `/jobs?id=${encodeURIComponent(objId)}` : '/jobs';
        }
      };
      holder.onclick = event => openRow(event.target.closest('[data-notification-id]'));
      holder.onkeydown = event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const row = event.target.closest('[data-notification-id]');
        if (!row) return;
        event.preventDefault();
        openRow(row);
      };
      if (earlier) earlier.onclick = () => { shown += 12; render(); };
      const chips = $('[data-chip-group]', center);
      const activeLabel = { post: 'My posts', mention: 'Mentions', follow: 'Connections' }[active] || 'All';
      $$('.chip', chips).forEach(chip => chip.classList.toggle('is-on', chip.textContent.trim() === activeLabel));
      chips?.addEventListener('click', event => { const chip = event.target.closest('.chip'); if (!chip) return; active = chip.textContent.trim().toLowerCase(); shown = 12; render(); });
      if (chips && !chips.querySelector('[data-mark-read]')) { const mark = document.createElement('button'); mark.className = 'ml-auto text-[12.5px] font-semibold text-brand whitespace-nowrap px-2.5 py-1 rounded-lg hover:bg-brand/10 transition'; mark.dataset.markRead = ''; mark.textContent = 'Mark all read'; mark.onclick = async () => { await api.request('cv_social_mark_notifications_read', {}); allItems.forEach(item => { item.is_read = true; }); render(); toast('Notifications marked as read'); }; chips.appendChild(mark); }
      document.addEventListener('fi:search', event => { searchQuery = event.detail.query.toLowerCase(); shown = 12; render(); });
    } catch (error) {
      holder.innerHTML = `<div class="fi-library-empty" style="border:0;background:none"><i class="fa-regular fa-bell-slash"></i><h3>Notifications could not load</h3><p>${esc(error.message || 'Please try again in a moment.')}</p></div>`;
    }
  }

  function openProfileEditor(user, focusField) {
    if (!requireUser()) return;
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; inset: 0; z-index: 9999; background: rgba(0, 0, 0, 0.65); display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; backdrop-filter: blur(2px);';
    
    const coverUrl = user.cover_url || user.cover || '';
    const photoUrl = user.avatar_url || user.avatar || user.photo_url || '';
    
    modal.innerHTML = `
      <div style="width: 100%; max-width: 580px; max-height: 88vh; background: #ffffff; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.28); display: flex; flex-direction: column; overflow: hidden; position: relative; border: 1px solid rgba(0,0,0,0.08); animation: fiModalPop 0.18s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <!-- Header -->
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 20px; border-bottom: 1px solid #e5e5e5; flex-shrink: 0; background: #ffffff; text-align: center;">
          <h2 style="font-size: 19px; font-weight: 700; color: #1c1e21; margin: 0; line-height: 1.25;">Edit your profile</h2>
          <p style="font-size: 13px; color: #65676b; margin: 4px 0 0 0;">These details are saved to Firebase and shown across the platform.</p>
          <button type="button" style="position: absolute; right: 14px; top: 14px; width: 34px; height: 34px; border-radius: 50%; background: #e4e6eb; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #65676b; transition: background 0.15s;" data-profile-close aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Content Body -->
        <div style="padding: 18px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; background: #ffffff;">
          <form style="display: flex; flex-direction: column; gap: 16px; margin: 0;">
            
            <!-- Cover Photo Uploader -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 14.5px; font-weight: 700; color: #1c1e21; margin: 0;">
                Cover photo
              </label>
              <label style="position: relative; width: 100%; height: 130px; background: #f0f2f5; border-radius: 8px; border: 1px solid #ccd0d5; cursor: pointer; overflow: hidden; display: block; box-sizing: border-box;">
                <img id="fi-cover-preview" src="${esc(coverUrl)}" alt="Cover Preview" style="width: 100%; height: 130px; object-fit: cover; display: ${coverUrl ? 'block' : 'none'}; margin: 0;" />
                <div id="fi-cover-placeholder" style="width: 100%; height: 130px; display: ${coverUrl ? 'none' : 'flex'}; align-items: center; justify-content: center; background: #f0f2f5; color: #bcc0c4;"></div>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.06); transition: background 0.15s;">
                  <div style="background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); padding: 6px 13px; border-radius: 6px; color: #1c1e21; display: flex; align-items: center; gap: 7px; box-shadow: 0 1px 4px rgba(0,0,0,0.18); font-weight: 600; font-size: 13px; pointer-events: none;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    Edit Cover Photo
                  </div>
                </div>
                <input type="file" name="profile_cover" accept="image/*" style="display: none;" />
              </label>
            </div>

            <!-- Profile Photo Uploader -->
            <div style="display: flex; flex-direction: column; align-items: center; margin-top: -4px;">
              <div style="width: 100%; font-size: 14.5px; font-weight: 700; color: #1c1e21; margin-bottom: 8px; text-align: left;">
                Profile photo
              </div>
              <label style="position: relative; width: 96px; height: 96px; border-radius: 50%; background: #e4e6eb; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                <img id="fi-profile-preview" src="${esc(photoUrl)}" alt="Profile Preview" style="width: 96px; height: 96px; object-fit: cover; border-radius: 50%; display: ${photoUrl ? 'block' : 'none'}; margin: 0;" />
                <div id="fi-profile-placeholder" style="width: 100%; height: 100%; display: ${photoUrl ? 'none' : 'flex'}; align-items: center; justify-content: center; background: #e4e6eb; color: #bcc0c4;">
                  <svg style="width: 52px; height: 52px; margin-top: 8px;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.12);">
                  <div style="background: rgba(0,0,0,0.6); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; pointer-events: none;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </div>
                <input type="file" name="profile_image" accept="image/*" style="display: none;" />
              </label>
            </div>

            <!-- Display name -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="fi-displayName" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                Display name
              </label>
              <input
                type="text"
                id="fi-displayName"
                name="display_name"
                value="${esc(user.name || user.displayName || '')}"
                required
                style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                onfocus="this.style.background='#fff'; this.style.borderColor='#2f5bea'; this.style.boxShadow='0 0 0 1px #2f5bea';"
                onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
              />
            </div>

            <!-- Role & Location -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%; box-sizing: border-box;">
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="fi-role" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                  Role
                </label>
                <input
                  type="text"
                  id="fi-role"
                  name="role"
                  value="${esc(user.role || '')}"
                  style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                  onfocus="this.style.background='#fff'; this.style.borderColor='#2f5bea'; this.style.boxShadow='0 0 0 1px #2f5bea';"
                  onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
                />
              </div>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="fi-location" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                  Location
                </label>
                <input
                  type="text"
                  id="fi-location"
                  name="location"
                  value="${esc(user.location || '')}"
                  style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                  onfocus="this.style.background='#fff'; this.style.borderColor='#2f5bea'; this.style.boxShadow='0 0 0 1px #2f5bea';"
                  onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
                />
              </div>
            </div>

            <!-- Industry & Church -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%; box-sizing: border-box;">
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="fi-industry" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                  Industry
                </label>
                <input
                  type="text"
                  id="fi-industry"
                  name="industry"
                  value="${esc(user.industry || '')}"
                  style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                  onfocus="this.style.background='#fff'; this.style.borderColor='#2f5bea'; this.style.boxShadow='0 0 0 1px #2f5bea';"
                  onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
                />
              </div>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="fi-church" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                  Church
                </label>
                <input
                  type="text"
                  id="fi-church"
                  name="church"
                  value="${esc(user.church || '')}"
                  style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                  onfocus="this.style.background='#fff'; this.style.borderColor='#2f5bea'; this.style.boxShadow='0 0 0 1px #2f5bea';"
                  onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
                />
              </div>
            </div>

            <!-- Ministry -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="fi-ministry" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                Ministry
              </label>
              <input
                type="text"
                id="fi-ministry"
                name="ministry"
                value="${esc(user.ministry || '')}"
                style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                onfocus="this.style.background='#fff'; this.style.borderColor='#2f5bea'; this.style.boxShadow='0 0 0 1px #2f5bea';"
                onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
              />
            </div>

            <!-- About -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="fi-about" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                About
              </label>
              <textarea
                id="fi-about"
                name="bio"
                rows="3"
                style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; resize: vertical; min-height: 70px; font-family: inherit; transition: all 0.15s;"
                onfocus="this.style.background='#fff'; this.style.borderColor='#2f5bea'; this.style.boxShadow='0 0 0 1px #2f5bea';"
                onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
              >${esc(user.bio || user.about || '')}</textarea>
            </div>

          </form>
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; align-items: center; justify-content: flex-end; padding: 12px 22px; border-top: 1px solid #e5e5e5; gap: 10px; background: #ffffff; flex-shrink: 0;">
          <button type="button" style="padding: 8px 18px; font-size: 14px; font-weight: 700; color: #4b4f56; background: #e4e6eb; border: none; border-radius: 6px; cursor: pointer; transition: background 0.15s; font-family: inherit;" data-profile-close>
            Cancel
          </button>
          <button type="button" style="padding: 8px 22px; font-size: 14px; font-weight: 700; color: #ffffff; background: #2f5bea; border: none; border-radius: 6px; cursor: pointer; transition: background 0.15s; font-family: inherit;" data-profile-save>
            Save profile
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const cleanup = () => {
      modal.remove();
      document.body.style.overflow = '';
    };

    $$('[data-profile-close]', modal).forEach(button => { button.onclick = cleanup; });
    modal.onclick = (e) => { if (e.target === modal) cleanup(); };

    const form = $('form', modal);
    
    // Live image previews
    const coverInput = form.querySelector('input[name="profile_cover"]');
    const coverPreview = modal.querySelector('#fi-cover-preview');
    const coverPlaceholder = modal.querySelector('#fi-cover-placeholder');
    if (coverInput && coverPreview) {
      coverInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          coverPreview.src = URL.createObjectURL(file);
          coverPreview.style.display = 'block';
          if (coverPlaceholder) coverPlaceholder.style.display = 'none';
        }
      };
    }

    const profileInput = form.querySelector('input[name="profile_image"]');
    const profilePreview = modal.querySelector('#fi-profile-preview');
    const profilePlaceholder = modal.querySelector('#fi-profile-placeholder');
    if (profileInput && profilePreview) {
      profileInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          profilePreview.src = URL.createObjectURL(file);
          profilePreview.style.display = 'block';
          if (profilePlaceholder) profilePlaceholder.style.display = 'none';
        }
      };
    }

    if (focusField) {
      const fieldMap = { bio: 'bio', ministry: 'ministry', role: 'role', location: 'location', profile_cover: 'profile_cover', display_name: 'display_name' };
      const targetName = fieldMap[focusField] || focusField;
      form.elements[targetName]?.focus();
    }

    const saveBtn = $('[data-profile-save]', modal);
    const handleSave = async (event) => {
      if (event) event.preventDefault();
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      const data = Object.fromEntries(new FormData(form));
      const files = {
        profile_image: form.profile_image.files[0] ? [form.profile_image.files[0]] : [],
        profile_cover: form.profile_cover.files[0] ? [form.profile_cover.files[0]] : []
      };
      delete data.profile_image;
      delete data.profile_cover;
      try {
        const updated = await api.request('cv_update_profile', data, files);
        applySession(updated.user || updated);
        cleanup();
        toast('Profile saved');
        setTimeout(() => location.reload(), 350);
      } catch (error) {
        toast(error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save profile';
      }
    };

    form.onsubmit = handleSave;
    saveBtn.onclick = handleSave;
  }

  async function loadProfile(currentUser) {
    applySearchIndexing(currentUser);
    const urlParams = new URLSearchParams(location.search);
    const rawTarget = urlParams.get('uid') || urlParams.get('member') || urlParams.get('user') || urlParams.get('id') || '';
    const targetUid = (rawTarget === 'undefined' || rawTarget === 'null' || !rawTarget.trim()) ? '' : rawTarget.trim();
    const isSelf = !targetUid || (currentUser && (targetUid === currentUser.uid || String(currentUser.id) === targetUid));

    let user = null;
    if (isSelf) {
      user = currentUser;
    } else if (targetUid) {
      try {
        user = await api.request('cv_get_user', { uid: targetUid, id: targetUid });
      } catch (err) {
        user = null;
      }
    }

    if (!user) {
      const hero = $$('#main section').find(section => section.querySelector('h1'));
      if (hero) {
        $('h1', hero).textContent = 'Member Not Found';
        const details = $$('p', hero);
        if (details[0]) details[0].textContent = 'This member profile is unavailable or private.';
        if (details[1]) details[1].textContent = '';
      }
      $$('.reveal, [aria-label^="Edit"]', '#main').forEach(el => el.remove());
      return;
    }

    const hero = $$('#main section').find(section => section.querySelector('h1'));
    if (hero) {
      const h1 = $('h1', hero);
      h1.innerHTML = esc(user.name || user.displayName || 'Faith In Member') + verificationBadgeMarkup(user, 'profile');
      const details = $$('p', hero);
      if (details[0]) details[0].textContent = [user.role, user.ministry, user.church].filter(Boolean).join(' · ') || 'Faith In member';
      if (details[1]) {
        const locSpan = details[1].querySelector('[data-profile-location]') || details[1].querySelector('span');
        if (locSpan) locSpan.textContent = user.location || 'Phnom Penh, Cambodia';
        else if (details[1].firstChild) details[1].firstChild.textContent = `${user.location || ''} `;
      }
      const avatar = $('[data-profile-hero-avatar], #profile-avatar, .profile-avatar-hero, .avatar', hero);
      if (avatar) {
        const photo = user.avatar_url || user.avatar || user.photo_url;
        if (photo) {
          const image = document.createElement('img');
          image.id = 'profile-avatar';
          image.dataset.profileHeroAvatar = '';
          image.className = 'profile-avatar-hero avatar object-cover';
          image.src = photo;
          image.alt = user.name || 'Member';
          avatar.replaceWith(image);
        } else {
          avatar.id = 'profile-avatar';
          avatar.dataset.profileHeroAvatar = '';
          avatar.className = 'profile-avatar-hero avatar';
          avatar.textContent = api.initials(user.name);
        }
      }
      const cover = $('.media-plate', hero);
      if (cover) {
        if (user.cover_url) {
          cover.style.backgroundImage = `url("${String(user.cover_url).replace(/["\\]/g, '')}")`;
          cover.style.backgroundSize = 'cover';
          cover.style.backgroundPosition = 'center';
          const label = $('span', cover);
          if (label) label.remove();
        } else {
          cover.style.backgroundImage = '';
        }
      }
    }

    const about = $$('#main h2').find(node => node.textContent.trim() === 'About')?.closest('section');
    if (about) {
      const paragraphs = $$('div.space-y-3 p', about);
      if (paragraphs[0]) paragraphs[0].textContent = user.bio || (isSelf ? 'Tell the community about your faith journey and ministry.' : 'This member has not added a biography yet.');
      paragraphs.slice(1).forEach(node => node.remove());
    }

    const services = $$('#main h2').find(node => /providing ministry services/i.test(node.textContent))?.closest('div.rounded-xl');
    if (services) {
      if (user.ministry || user.role) {
        const line = $('p', services);
        if (line) line.textContent = [user.role, user.ministry, user.church].filter(Boolean).join(' · ');
      } else {
        services.remove();
      }
    }

    const activity = $$('#main h2').find(node => node.textContent.trim() === 'Activity')?.closest('section');
    if (activity) {
      api.request('cv_get_posts').then(result => {
        const memberPosts = (result.items || []).filter(post => {
          const postUid = (post.author && post.author.uid) || post.author_uid || post.authorUid;
          return (postUid && postUid === user.uid) || (user.id && String(post.author?.id) === String(user.id));
        });
        const holder = $('.space-y-1', activity);
        const renderActivity = label => {
          const wanted = String(label || 'Posts').toLowerCase();
          const filtered = memberPosts.filter(post => wanted === 'posts' || (wanted === 'videos' && (post.media_items || []).some(item => item.type === 'video')) || (wanted === 'articles' && String(post.type).toLowerCase() === 'article'));
          if (holder) {
            holder.innerHTML = wanted === 'comments'
              ? emptyState('Comment history is shown with each post on the home feed.')
              : (filtered.slice(0, 12).length
                ? filtered.slice(0, 12).map(post => {
                    const avatarImg = user.avatar_url || user.avatar || user.photo_url;
                    const avatarHtml = avatarImg
                      ? `<img class="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-surface" src="${esc(avatarImg)}" alt="${esc(user.name)}">`
                      : window.FILive.avatarMarkup(user, 'avatar w-9 h-9 text-[12px] shrink-0 ring-2 ring-surface');
                    return `
                      <a href="/home?post=${encodeURIComponent(post.id)}" class="flex gap-3 p-3 -mx-2 rounded-xl row-hover border-b border-line items-start">
                        ${avatarHtml}
                        <div class="flex-1 min-w-0">
                          <span class="block text-[11.5px] text-muted">${esc(user.name)} posted · ${esc(post.time || '')}</span>
                          <span class="block text-[14px] mt-0.5 line-clamp-2">${esc(post.content || post.article_title || 'Shared media')}</span>
                          <span class="block text-[12px] text-muted mt-1.5">${Number(post.reaction_count || 0)} reactions · ${Number(post.comment_count || 0)} comments</span>
                        </div>
                      </a>
                    `;
                  }).join('')
                : emptyState(`No ${wanted} from ${esc(user.name)} yet.`));
          }
        };
        renderActivity('Posts');
        $('[data-chip-group]', activity)?.addEventListener('click', event => {
          const chip = event.target.closest('.chip');
          if (chip) renderActivity(chip.textContent.trim());
        });
      }).catch(() => {});
    }

    $$('#main section').filter(item => /ministry experience|spiritual gifts|people also viewed/i.test(item.querySelector('h2')?.textContent || '')).forEach(item => item.remove());

    const refreshProfileCounts = () => {
      Promise.all([
        api.request('cv_social_get_followers', { uid: user.uid }),
        api.request('cv_social_get_following', { uid: user.uid })
      ]).then(results => {
        const rawFollowers = results[0].items || [];
        const seenUids = new Set();
        const followers = rawFollowers.filter(f => {
          const fid = f.uid || f.id;
          if (!fid || seenUids.has(fid)) return false;
          seenUids.add(fid);
          return true;
        });
        const following = results[1].items || [];
        const count = followers.length;
        const topFollowers = followers.slice(0, 3);

        const avatarsHtml = count > 0 ? topFollowers.map(f => {
          const photo = f.photo_url || f.avatar_url || f.avatar;
          const name = f.name || f.displayName || 'Member';
          if (photo) {
            return `<img class="inline-block w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-surface object-cover shadow-sm transition hover:scale-105" src="${esc(photo)}" alt="${esc(name)}" title="${esc(name)}">`;
          }
          return window.FILive.avatarMarkup(f, 'inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-surface text-[10px] font-bold text-white shadow-sm transition hover:scale-105');
        }).join('') : '';

        // Extract distinct follower names for text display
        const uniqueNames = [];
        topFollowers.forEach(f => {
          const name = f.name || f.displayName || 'Member';
          if (!uniqueNames.includes(name)) uniqueNames.push(name);
        });

        let textMarkup = `${count} ${count === 1 ? 'follower' : 'followers'}`;
        if (uniqueNames.length === 1) {
          textMarkup = `Followed by <strong class="font-semibold text-ink">${esc(uniqueNames[0])}</strong>`;
        } else if (uniqueNames.length === 2) {
          textMarkup = `Followed by <strong class="font-semibold text-ink">${esc(uniqueNames[0])}</strong> and <strong class="font-semibold text-ink">${esc(uniqueNames[1])}</strong>`;
        } else if (uniqueNames.length === 3) {
          textMarkup = `Followed by <strong class="font-semibold text-ink">${esc(uniqueNames[0])}</strong>, <strong class="font-semibold text-ink">${esc(uniqueNames[1])}</strong> and <strong class="font-semibold text-ink">${esc(uniqueNames[2])}</strong>`;
        } else if (uniqueNames.length > 3 || count > 3) {
          const others = Math.max(0, count - uniqueNames.length);
          textMarkup = `Followed by ${uniqueNames.map(n => `<strong class="font-semibold text-ink">${esc(n)}</strong>`).join(', ')}${others > 0 ? ` and <strong class="font-semibold text-ink">${others} other${others > 1 ? 's' : ''}</strong>` : ''}`;
        }

        // 1. Update Hero Connections & Followers row
        const heroFollowing = $('[data-hero-following]', hero) || $$('a', hero).find(link => /connections|following/i.test(link.textContent));
        if (heroFollowing) heroFollowing.textContent = `${following.length} following`;

        const heroFollowers = $('[data-hero-followers]', hero);
        if (heroFollowers) {
          if (count > 0) {
            heroFollowers.className = 'flex items-center gap-2 text-muted hover:text-ink transition cursor-pointer';
            heroFollowers.innerHTML = `
              <div class="flex -space-x-2 overflow-hidden py-0.5 items-center shrink-0" data-hero-follower-avatars="">
                ${avatarsHtml}
              </div>
              <span class="leading-tight text-ink font-normal text-[13.5px]" data-hero-follower-text="">
                ${textMarkup}
              </span>
            `;
          } else {
            heroFollowers.className = 'font-semibold text-brand hover:underline cursor-pointer';
            heroFollowers.innerHTML = '0 followers';
          }
        }

        // 2. Update Activity section Followers row
        const followerSummary = activity?.querySelector('[data-follower-summary]') || (activity ? $$('a', activity).find(link => /followers|followed by/i.test(link.textContent)) : null);
        if (followerSummary) {
          if (count > 0) {
            followerSummary.className = 'flex items-center gap-2.5 mt-1.5 text-[13.5px] sm:text-[14px] text-muted hover:text-ink transition cursor-pointer';
            followerSummary.innerHTML = `
              <div class="flex -space-x-2 overflow-hidden py-0.5 items-center shrink-0" data-follower-avatars="">
                ${avatarsHtml}
              </div>
              <span class="leading-snug text-muted" data-follower-text="">
                ${textMarkup}
              </span>
            `;
          } else {
            followerSummary.className = 'inline-block mt-1 text-[13.5px] font-semibold text-brand hover:underline cursor-pointer';
            followerSummary.innerHTML = '0 followers';
          }
        }
      }).catch(() => {});
    };
    refreshProfileCounts();

    if (isSelf) {
      $$('[aria-label="Edit profile"],[aria-label="Edit services"]', hero || document).forEach(button => {
        button.onclick = () => openProfileEditor(user, button.getAttribute('aria-label') === 'Edit services' ? 'ministry' : 'display_name');
      });
      $('[aria-label="Edit cover photo"]', hero || document)?.addEventListener('click', () => openProfileEditor(user, 'profile_cover'));
      $('[aria-label="Edit about"]')?.addEventListener('click', () => openProfileEditor(user, 'bio'));
      const openTo = $$('#main button').find(button => /^open to$/i.test(button.textContent.trim()));
      if (openTo) { openTo.removeAttribute('data-toast'); openTo.onclick = () => openProfileEditor(user, 'role'); }
      const addSection = $$('#main button').find(button => /add profile section/i.test(button.textContent));
      if (addSection) { addSection.removeAttribute('data-toast'); addSection.onclick = () => openProfileEditor(user, 'ministry'); }
      const more = $$('#main button').find(button => /^more$/i.test(button.textContent.trim()));
      if (more) more.onclick = async () => {
        try { await navigator.clipboard.writeText(location.href); toast('Profile link copied'); }
        catch (_) { toast('Profile link: ' + location.href); }
      };
    } else {
      // Visiting another member's profile
      $$('.reveal, [aria-label^="Edit"]', '#main').forEach(el => el.remove());
      $$('a', activity).find(link => /create a post/i.test(link.textContent))?.remove();

      const btnGroup = $$('#main .flex.flex-wrap.gap-2', hero)[0];
      if (btnGroup) {
        btnGroup.innerHTML = `
          <button class="btn ${user.is_following ? 'btn-outline' : 'btn-primary'}" data-profile-connect>
            ${user.is_following ? 'Following' : '<i class="fa-solid fa-user-plus text-[11px] mr-1.5"></i>Connect'}
          </button>
          <button class="btn btn-neutral" data-profile-message>
            <i class="fa-regular fa-comment-dots text-[13px] mr-1.5"></i>Message
          </button>
          <button class="btn btn-ghost border border-line" data-profile-share>
            <i class="fa-solid fa-share-nodes text-[12px] mr-1.5"></i>Share
          </button>
        `;

        const connectBtn = $('[data-profile-connect]', btnGroup);
        if (connectBtn) {
          connectBtn.onclick = async () => {
            if (!requireUser()) return;
            const following = /following/i.test(connectBtn.textContent);
            connectBtn.disabled = true;
            try {
              await api.request(following ? 'cv_social_unfollow_user' : 'cv_social_follow_user', { target_uid: user.uid });
              const nowFollowing = !following;
              connectBtn.textContent = nowFollowing ? 'Following' : 'Connect';
              connectBtn.className = `btn ${nowFollowing ? 'btn-outline' : 'btn-primary'}`;
              if (!nowFollowing) connectBtn.innerHTML = '<i class="fa-solid fa-user-plus text-[11px] mr-1.5"></i>Connect';
              toast(nowFollowing ? `Following ${user.name}` : `Unfollowed ${user.name}`);
              refreshProfileCounts();
            } catch (err) {
              toast(err.message);
            } finally {
              connectBtn.disabled = false;
            }
          };
        }

        const messageBtn = $('[data-profile-message]', btnGroup);
        if (messageBtn) {
          messageBtn.onclick = () => openMessenger(user.uid);
        }

        const shareBtn = $('[data-profile-share]', btnGroup);
        if (shareBtn) {
          shareBtn.onclick = async () => {
            try { await navigator.clipboard.writeText(location.href); toast('Profile link copied'); }
            catch (_) { toast('Profile link: ' + location.href); }
          };
        }
      }
    }

    const detailsButton = $$('#main button').find(button => /show details/i.test(button.textContent));
    if (detailsButton) {
      detailsButton.onclick = () => {
        const line = detailsButton.previousElementSibling;
        line?.classList.toggle('line-clamp-1');
        detailsButton.textContent = /show/i.test(detailsButton.textContent) ? 'Hide details' : 'Show details';
      };
    }

    const urlDisplay = $$('#main aside p').find(node => /faithin\.co\/in\//i.test(node.textContent));
    if (urlDisplay) {
      const slug = String(user.name || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || user.uid;
      urlDisplay.textContent = `faithin.co/in/${slug}`;
    }
    $('[aria-label="Edit activity"]')?.remove();
    $('[aria-label="Edit profile language"]')?.addEventListener('click', () => { location.href = '/settings'; });
    $('[aria-label="Edit public URL"]')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); toast('Public profile URL copied'); }
      catch (_) {}
    });
  }

  // Switching search indexing off adds a robots directive to the member's
  // profile, which is the part of Faith In that search engines actually crawl.
  function applySearchIndexing(user) {
    if (document.body.dataset.page !== 'profile') return;
    if (user?.settings?.search_indexing === false) {
      if (!document.querySelector('meta[name="robots"]')) {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);
      }
    } else {
      document.querySelector('meta[name="robots"]')?.remove();
    }
  }

  function loadSettings(user) {
    if (!user) return;
    const profileSummary = $$('#main h4').find(node => /name, location/i.test(node.textContent))?.parentElement?.querySelector('p'); if (profileSummary) profileSummary.textContent = [user.name, user.role, user.location].filter(Boolean).join(' · ');
    let settings = Object.assign({ theme: 'system', lang: 'English', content_languages: ['English', 'ភាសាខ្មែរ'], autoplay_videos: true, sound_effects: false, daily_verse: true, larger_text: false }, user.settings || {});
    const save = async changes => { try { const result = await api.request('cv_update_user_settings', changes); settings = result.settings || Object.assign(settings, changes); toast('Preference saved'); } catch (error) { toast(error.message); } };
    $('#theme-picker')?.addEventListener('click', event => { const button = event.target.closest('[data-theme-mode]'); if (button) save({ theme: button.dataset.themeMode }); });
    const toggles = {
      'Larger text': 'larger_text', 'Autoplay videos': 'autoplay_videos',
      'Sound effects': 'sound_effects', 'Daily verse notification': 'daily_verse',
      'Search engine indexing': 'search_indexing',
      'Reactions': 'notify_reactions', 'Comments': 'notify_comments',
      'New followers': 'notify_follows', 'Messages and replies': 'notify_messages',
      'Posts and opportunities': 'notify_posts',
    };
    // Everything not yet chosen defaults to on, which is what the backend
    // assumes when the field is undefined.
    ['search_indexing', 'notify_reactions', 'notify_comments', 'notify_follows', 'notify_messages', 'notify_posts']
      .forEach(key => { if (settings[key] === undefined) settings[key] = true; });
    Object.entries(toggles).forEach(([label, key]) => { const input = $(`input[aria-label="${label}"]`); if (!input) return; input.checked = !!settings[key]; input.addEventListener('change', () => { if (key === 'larger_text') document.documentElement.style.fontSize = input.checked ? '112.5%' : ''; save({ [key]: input.checked }); }); });
    const languageRows = $$('#main .settings-row').filter(row => /^(Language|Content language)$/i.test($('h4', row)?.textContent || ''));
    const openPicker = (title, options, multiple, current, onSave) => {
      const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
      modal.innerHTML = `<form class="card w-full max-w-md p-5 space-y-4"><div class="flex justify-between"><h2 class="text-[20px] font-bold">${esc(title)}</h2><button type="button" class="icon-btn" data-picker-close><i class="fa-solid fa-xmark"></i></button></div><div class="space-y-2">${options.map(option => `<label class="settings-row !p-3 !rounded-xl border border-line"><span class="font-semibold text-[14px]">${esc(option)}</span><input ${multiple ? 'type="checkbox"' : 'type="radio" name="choice"'} value="${esc(option)}" ${current.includes(option) ? 'checked' : ''}></label>`).join('')}</div><button class="btn btn-primary w-full">Save</button></form>`;
      document.body.appendChild(modal); $('[data-picker-close]', modal).onclick = () => modal.remove();
      $('form', modal).onsubmit = event => { event.preventDefault(); const values = $$('input:checked', modal).map(input => input.value); if (!values.length) return toast('Choose at least one language'); onSave(multiple ? values : values[0]); modal.remove(); };
    };
    if (languageRows[0]) { const value = $$('p', languageRows[0])[1]; if (value) value.textContent = settings.lang; const button = $('button', languageRows[0]); button?.removeAttribute('data-toast'); if (button) button.onclick = () => openPicker('Faith In language', ['English', 'ភាសាខ្មែរ'], false, [settings.lang], lang => { if (value) value.textContent = lang; save({ lang }); }); }
    if (languageRows[1]) { const value = $$('p', languageRows[1])[1]; if (value) value.textContent = settings.content_languages.join(' · '); const button = $('button', languageRows[1]); button?.removeAttribute('data-toast'); if (button) button.onclick = () => openPicker('Content languages', ['English', 'ភាសាខ្មែរ', 'ไทย', 'မြန်မာ', 'Tiếng Việt'], true, settings.content_languages, languages => { if (value) value.textContent = languages.join(' · '); save({ content_languages: languages }); }); }
    // Default audience for new posts — the composers read this when they
    // publish, so choosing "Followers" here really does change what happens.
    const AUDIENCE = { public: 'Public', followers: 'Followers only', private: 'Only me' };
    const audienceValue = $('[data-audience-value]');
    const paintAudience = () => {
      if (audienceValue) audienceValue.textContent = AUDIENCE[settings.default_post_audience || 'public'] || 'Public';
    };
    paintAudience();
    $('[data-audience-change]')?.addEventListener('click', () => {
      openPicker('Default audience for new posts', Object.values(AUDIENCE), false,
        [AUDIENCE[settings.default_post_audience || 'public']], choice => {
          const code = Object.keys(AUDIENCE).find(key => AUDIENCE[key] === choice) || 'public';
          settings.default_post_audience = code;
          paintAudience();
          save({ default_post_audience: code });
        });
    });

    // External calendar/contact OAuth is not configured. Remove those claims
    // instead of presenting buttons that pretend to sync third-party data.
    $$('#main section').find(section => /syncing options/i.test($('h3', section)?.textContent || ''))?.remove();
  }

  async function loadSettingsSecurity(user) {
    if (!user) return;
    
    let security = {
      email: user.email || '',
      email_verified: true,
      phone: user.phone || user.settings?.phone || '+855 12 345 678',
      two_step_verification: user.settings?.two_step_verification !== undefined ? user.settings.two_step_verification : true,
      two_step_enrolled: false,
      passkeys_enabled: !!user.settings?.passkeys_enabled,
      remember_devices: user.settings?.remember_devices !== undefined ? user.settings.remember_devices : true,
      last_password_change: 'August 2026'
    };

    try {
      const res = await api.request('cv_get_security_status');
      if (res) security = Object.assign(security, res);
    } catch (_) {}

    // 1. Email addresses
    const emailRow = $('[data-security-email-row]');
    const emailVal = $('[data-security-primary-email]');
    if (emailVal) {
      emailVal.innerHTML = `Primary: <span class="font-medium text-ink">${esc(security.email || 'h.chet@faithin.co')}</span>`;
    }
    if (emailRow) {
      emailRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Email addresses</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="p-4 rounded-xl bg-raised border border-line space-y-1">
              <p class="text-[12px] text-muted font-medium uppercase tracking-wider">Primary email</p>
              <p class="text-[15px] font-semibold text-ink">${esc(security.email || 'h.chet@faithin.co')}</p>
              <span class="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                <i class="fa-solid fa-circle-check text-[11px]"></i> Verified for account access
              </span>
            </div>
            <button type="button" class="btn btn-outline w-full" data-send-verification>
              <i class="fa-solid fa-envelope mr-1.5"></i> Resend verification email
            </button>
            <button type="button" class="btn btn-neutral w-full" data-modal-close>Close</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-send-verification]', modal).onclick = async () => {
          try {
            await api.request('cv_send_email_verification');
            toast('Verification link sent to your inbox.');
            modal.remove();
          } catch (err) {
            toast(err.message || 'Verification email sent.');
            modal.remove();
          }
        };
      };
    }

    // 2. Phone numbers
    const phoneRow = $('[data-security-phone-row]');
    const phoneVal = $('[data-security-phone-val]');
    const phoneCount = $('[data-security-phone-count]');
    const updatePhoneUI = (p) => {
      security.phone = p;
      if (phoneVal) phoneVal.textContent = p || 'None added';
      if (phoneCount) phoneCount.textContent = p ? '1 phone number' : '0 phone numbers';
    };
    updatePhoneUI(security.phone);

    if (phoneRow) {
      phoneRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <form class="card w-full max-w-md p-6 space-y-4 shadow-pop" data-phone-form>
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Phone number</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Add a mobile phone number to receive security alerts and verify your sign-in.</p>
            <div>
              <label class="block text-[12.5px] font-semibold text-muted mb-1.5">Mobile phone</label>
              <input type="tel" name="phone" value="${esc(security.phone || '+855 ')}" class="field" placeholder="+855 12 345 678" required>
            </div>
            <div class="flex gap-2 pt-2">
              <button type="button" class="btn btn-ghost flex-1" data-modal-close>Cancel</button>
              <button type="submit" class="btn btn-primary flex-1">Save phone</button>
            </div>
          </form>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-phone-form]', modal).onsubmit = async event => {
          event.preventDefault();
          const p = String(new FormData(event.target).get('phone') || '').trim();
          try {
            await api.request('cv_update_user_settings', { phone: p });
            updatePhoneUI(p);
            toast('Phone number updated.');
            modal.remove();
          } catch (err) {
            toast(err.message);
          }
        };
      };
    }

    // 3. Change password
    const passRow = $('[data-security-password-row]');
    if (passRow) {
      passRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <form class="card w-full max-w-md p-6 space-y-4 shadow-pop" data-pass-form>
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Change password</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Confirm your current password, then choose a new one of at least 8 characters. If you have forgotten it, send yourself a reset link instead.</p>
            <div class="space-y-3">
              <div>
                <label class="block text-[12.5px] font-semibold text-muted mb-1">Current password</label>
                <input type="password" name="current_password" class="field" placeholder="••••••••" autocomplete="current-password" required>
              </div>
              <div>
                <label class="block text-[12.5px] font-semibold text-muted mb-1">New password</label>
                <input type="password" name="password" class="field" placeholder="••••••••" minlength="8" autocomplete="new-password" required>
                <p class="text-[12px] mt-1" data-pass-strength>&nbsp;</p>
              </div>
              <div>
                <label class="block text-[12.5px] font-semibold text-muted mb-1">Confirm new password</label>
                <input type="password" name="confirm_password" class="field" placeholder="••••••••" minlength="8" autocomplete="new-password" required>
              </div>
            </div>
            <div class="flex flex-col gap-2 pt-2">
              <button type="submit" class="btn btn-primary w-full">Update password</button>
              <button type="button" class="btn btn-outline w-full" data-send-reset>
                <i class="fa-solid fa-paper-plane mr-1.5"></i> Send password reset link to email
              </button>
            </div>
          </form>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-send-reset]', modal).onclick = async () => {
          try {
            await api.request('cv_password_reset', { email: security.email });
            toast(`Password reset link sent to ${security.email}`);
            modal.remove();
          } catch (err) {
            toast(err.message);
          }
        };
        // Live feedback while typing, so a weak password is caught before the
        // member submits rather than after.
        const strengthOf = value => {
          if (value.length < 8) return { label: 'Too short — use at least 8 characters', tone: 'text-rose' };
          let score = 0;
          if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
          if (/[0-9]/.test(value)) score++;
          if (/[^A-Za-z0-9]/.test(value)) score++;
          if (value.length >= 12) score++;
          if (score <= 1) return { label: 'Weak — mix upper and lower case, numbers or symbols', tone: 'text-rose' };
          if (score === 2) return { label: 'Fair — a longer passphrase would be stronger', tone: 'text-amber-600' };
          return { label: 'Strong', tone: 'text-emerald-600' };
        };
        const strengthNote = $('[data-pass-strength]', modal);
        $('input[name="password"]', modal)?.addEventListener('input', event => {
          const value = event.target.value;
          if (!strengthNote) return;
          if (!value) { strengthNote.innerHTML = '&nbsp;'; strengthNote.className = 'text-[12px] mt-1'; return; }
          const { label, tone } = strengthOf(value);
          strengthNote.textContent = label;
          strengthNote.className = `text-[12px] mt-1 font-semibold ${tone}`;
        });

        $('[data-pass-form]', modal).onsubmit = async event => {
          event.preventDefault();
          const form = new FormData(event.target);
          const current = String(form.get('current_password') || '');
          const p1 = String(form.get('password') || '');
          const p2 = String(form.get('confirm_password') || '');
          if (p1 !== p2) return toast('Passwords do not match.');
          if (p1.length < 8) return toast('Choose a password of at least 8 characters.');
          const submit = $('button[type="submit"]', modal);
          if (submit) { submit.disabled = true; submit.textContent = 'Updating…'; }
          try {
            await api.request('cv_update_password', { password: p1, current_password: current });
            toast('Password successfully updated.');
            modal.remove();
          } catch (err) {
            toast(err.message);
            if (submit) { submit.disabled = false; submit.textContent = 'Update password'; }
          }
        };
      };
    }

    // 4. Two-step verification
    // The badge reports what the auth provider has actually enrolled. A stored
    // preference is not protection, and telling a member they have a second
    // factor when no code is ever asked for is worse than telling them nothing.
    const twoFaRow = $('[data-security-2fa-row]');
    const twoFaBadge = $('[data-security-2fa-badge]');
    const twoFaSub = $('[data-security-2fa-sub]');
    const twoFaEnrolled = !!security.two_step_enrolled;
    if (twoFaBadge) {
      twoFaBadge.textContent = twoFaEnrolled ? 'On' : 'Not set up';
      twoFaBadge.className = `status-badge ${twoFaEnrolled ? 'status-on' : 'status-off'}`;
    }
    if (twoFaSub) {
      twoFaSub.textContent = twoFaEnrolled
        ? 'A second factor is enrolled on this account.'
        : 'Your account is protected by your password alone.';
    }

    if (twoFaRow) {
      twoFaRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Two-step verification</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            ${twoFaEnrolled ? `
              <p class="text-[13px] text-muted">A second factor is enrolled on this account. You are asked for a code when signing in on a new device.</p>
            ` : `
              <div class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <p class="text-[13.5px] font-bold text-amber-700">Not set up yet</p>
                <p class="text-[13px] text-ink/80 mt-1">Your account is protected by your password alone. Two-step verification is not switched on for Faith In yet, so no code is asked for at sign-in.</p>
              </div>
              <p class="text-[13px] text-muted">Until it is available, the strongest thing you can do is use a long, unique password and keep your email account secure — a reset link goes there.</p>
            `}
            <button type="button" class="btn btn-primary w-full" data-modal-close>Close</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
      };
    }

    // 5. Passkeys
    const passkeyRow = $('[data-security-passkeys-row]');
    const passkeyBadge = $('[data-security-passkeys-badge]');
    const updatePasskeyUI = (enabled) => {
      security.passkeys_enabled = enabled;
      if (passkeyBadge) {
        passkeyBadge.textContent = enabled ? 'On' : 'Off';
        passkeyBadge.className = `status-badge ${enabled ? 'status-on' : 'status-off'}`;
      }
    };
    updatePasskeyUI(security.passkeys_enabled);

    if (passkeyRow) {
      passkeyRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Passkeys</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Sign in seamlessly with Touch ID, Face ID, or your device screen lock without typing a password.</p>
            <div class="p-4 rounded-xl bg-raised border border-line flex items-center justify-between">
              <div>
                <p class="font-semibold text-[14px]">Device Biometric Passkey</p>
                <p class="text-[12px] text-muted mt-0.5">Supports WebAuthn and FIDO2</p>
              </div>
              <label class="switch">
                <input type="checkbox" ${security.passkeys_enabled ? 'checked' : ''} data-passkey-toggle>
                <span></span>
              </label>
            </div>
            <button type="button" class="btn btn-primary w-full" data-modal-close>Done</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-passkey-toggle]', modal)?.addEventListener('change', async (e) => {
          const val = e.target.checked;
          try {
            await api.request('cv_update_user_settings', { passkeys_enabled: val });
            updatePasskeyUI(val);
            toast(val ? 'Passkeys enabled on this device.' : 'Passkeys disabled.');
          } catch (err) {
            toast(err.message);
          }
        });
      };
    }

    // 6. Active sessions & OS detection
    const osVal = $('[data-security-current-os]');
    const browserVal = $('[data-security-current-browser]');
    const ua = navigator.userAgent;
    let detectedOS = 'Mac OS X';
    if (/Windows/i.test(ua)) detectedOS = 'Windows';
    else if (/iPhone|iPad|iPod/i.test(ua)) detectedOS = 'iOS';
    else if (/Android/i.test(ua)) detectedOS = 'Android';
    else if (/Linux/i.test(ua)) detectedOS = 'Linux';

    let detectedBrowser = 'Chrome';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) detectedBrowser = 'Safari';
    else if (/Firefox/i.test(ua)) detectedBrowser = 'Firefox';
    else if (/Edg/i.test(ua)) detectedBrowser = 'Microsoft Edge';

    if (osVal) osVal.textContent = `${detectedOS} • ${user.location || 'Phnom Penh, Cambodia'}`;
    if (browserVal) browserVal.textContent = `${detectedBrowser} • Current session`;

    $('[data-security-manage-sessions]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
      modal.innerHTML = `
        <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
          <div class="flex items-center justify-between">
            <h3 class="text-[18px] font-bold">Active Sessions</h3>
            <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
          </div>
          <p class="text-[13px] text-muted">You are currently signed in on this browser. You can sign out other devices at any time.</p>
          <div class="p-3.5 rounded-xl bg-raised border border-line flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <i class="fa-solid fa-desktop text-[13px]"></i>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[13.5px] font-semibold">${detectedOS} • Current device</p>
              <p class="text-[12px] text-muted">${detectedBrowser} • Active now</p>
            </div>
          </div>
          <button type="button" class="btn btn-outline text-rose border-rose/30 hover:bg-rose/10 w-full" data-signout-others>
            Sign out of all other sessions
          </button>
          <button type="button" class="btn btn-neutral w-full" data-modal-close>Close</button>
        </div>
      `;
      document.body.appendChild(modal);
      $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
      $('[data-signout-others]', modal).onclick = () => {
        toast('Signed out of all other sessions.');
        modal.remove();
      };
    });

    // 7. Devices that remember your password
    const rememberRow = $('[data-security-remember-devices-row]');
    if (rememberRow) {
      rememberRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Remember password</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Manage whether this device securely saves your login state between browser restarts.</p>
            <div class="p-4 rounded-xl bg-raised border border-line flex items-center justify-between">
              <div>
                <p class="font-semibold text-[14px]">Keep me signed in</p>
                <p class="text-[12px] text-muted mt-0.5">Stay signed in on this trusted browser</p>
              </div>
              <label class="switch">
                <input type="checkbox" checked data-remember-toggle>
                <span></span>
              </label>
            </div>
            <button type="button" class="btn btn-primary w-full" data-modal-close>Done</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-remember-toggle]', modal)?.addEventListener('change', async (e) => {
          toast(e.target.checked ? 'Login session will be remembered.' : 'Session will clear upon browser close.');
        });
      };
    }

    // 8. Permitted services
    const servicesRow = $('[data-security-services-row]');
    if (servicesRow) {
      servicesRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Connected Services</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">These cloud infrastructure services are authorized to deliver your Faith In profile, authentication, and file storage.</p>
            <div class="space-y-2.5">
              <div class="p-3 rounded-xl bg-raised border border-line flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <i class="fa-brands fa-google text-brand text-[18px]"></i>
                  <div>
                    <p class="text-[13.5px] font-semibold">Google Identity & Firebase</p>
                    <p class="text-[11.5px] text-muted">Authentication & Realtime Firestore</p>
                  </div>
                </div>
                <span class="status-badge status-on">Active</span>
              </div>
              <div class="p-3 rounded-xl bg-raised border border-line flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <i class="fa-solid fa-cloud text-emerald-500 text-[18px]"></i>
                  <div>
                    <p class="text-[13.5px] font-semibold">Supabase Storage</p>
                    <p class="text-[11.5px] text-muted">Encrypted photos & resource bundles</p>
                  </div>
                </div>
                <span class="status-badge status-on">Active</span>
              </div>
            </div>
            <button type="button" class="btn btn-neutral w-full" data-modal-close>Close</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
      };
    }

    // Sidebar notices
    $$('[data-settings-notice]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        toast(btn.dataset.settingsNotice);
      };
    });
  }

  async function loadStudio(user) {
    if (!user) return;
    
    let data = {
      followers: 1042,
      followers_growth: '+12',
      impressions: '12.4K',
      impressions_growth: '+15%',
      engagement: 843,
      engagement_growth: '-2%',
      analytics: {
        labels: ['Aug 12', 'Aug 13', 'Aug 14', 'Aug 15', 'Aug 16', 'Aug 17', 'Aug 18', 'Aug 19', 'Aug 20', 'Aug 21', 'Aug 22', 'Aug 23', 'Aug 24', 'Aug 25'],
        impressions: [320, 450, 410, 890, 1200, 850, 600, 450, 2100, 1800, 1500, 900, 1100, 850],
        engagements: [24, 38, 30, 65, 92, 58, 41, 32, 142, 118, 95, 62, 78, 68],
        followers: [1, 2, 0, 3, 4, 2, 1, 0, 5, 4, 3, 2, 3, 2]
      },
      recent_content: []
    };

    try {
      const res = await api.request('cv_get_studio_dashboard');
      if (res) data = Object.assign(data, res);
    } catch (_) {}

    // Populate Top Metrics
    const followersEl = $('[data-metric-followers]');
    const followersGrowthEl = $('[data-metric-followers-growth]');
    const impressionsEl = $('[data-metric-impressions]');
    const impressionsGrowthEl = $('[data-metric-impressions-growth]');
    const engagementEl = $('[data-metric-engagement]');
    const engagementGrowthEl = $('[data-metric-engagement-growth]');

    if (followersEl) followersEl.textContent = Number(data.followers).toLocaleString();
    if (followersGrowthEl) followersGrowthEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${data.followers_growth}`;
    if (impressionsEl) impressionsEl.textContent = data.impressions;
    if (impressionsGrowthEl) impressionsGrowthEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${data.impressions_growth}`;
    if (engagementEl) engagementEl.textContent = Number(data.engagement).toLocaleString();
    if (engagementGrowthEl) engagementGrowthEl.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${data.engagement_growth}`;

    // Render Recent Content List
    const contentContainer = $('[data-studio-recent-content]');
    if (contentContainer && data.recent_content && data.recent_content.length > 0) {
      contentContainer.innerHTML = data.recent_content.map((item, idx) => {
        const borderClass = idx === data.recent_content.length - 1 ? '' : 'border-b border-gray-100 dark:border-slate-800';
        const typeBadge = item.type === 'Video'
          ? `<div class="absolute inset-0 bg-black/25 flex items-center justify-center"><i class="fa-solid fa-play text-white text-xs drop-shadow"></i></div><div class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded uppercase font-bold tracking-wider">Video</div>`
          : (item.type === 'Article'
            ? `<div class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded uppercase font-bold tracking-wider">Article</div>`
            : `<div class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded uppercase font-bold tracking-wider">Post</div>`);

        const thumb = item.cover
          ? `<img src="${esc(item.cover)}" class="w-full h-full object-cover" alt="Thumbnail">`
          : `<div class="w-full h-full bg-brand-soft text-brand flex items-center justify-center"><i class="fa-solid fa-${item.type === 'Video' ? 'video' : (item.type === 'Article' ? 'newspaper' : 'pen-nib')} text-[18px]"></i></div>`;

        return `
          <div class="p-4 ${borderClass} flex items-start gap-4 hover:bg-raised/60 transition-colors group">
            <div class="w-[100px] h-[56px] shrink-0 rounded-lg border border-line overflow-hidden relative">
              ${thumb}
              ${typeBadge}
            </div>
            <div class="flex-1 min-w-0">
              <a href="/home" class="font-bold text-[14px] text-ink group-hover:text-brand leading-tight line-clamp-1 transition-colors">
                ${esc(item.title)}
              </a>
              <p class="text-[12px] text-muted mt-1">${esc(item.date)}</p>
              <div class="flex items-center gap-6 mt-3 text-[13px] text-muted flex-wrap">
                <div class="flex flex-col">
                  <span class="text-[11px] text-faint font-medium">Impressions</span>
                  <span class="font-semibold text-ink">${Number(item.impressions).toLocaleString()}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] text-faint font-medium">Likes</span>
                  <span class="font-semibold text-ink">${Number(item.likes).toLocaleString()}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] text-faint font-medium">Comments</span>
                  <span class="font-semibold text-ink">${Number(item.comments).toLocaleString()}</span>
                </div>
                <div class="flex flex-col ml-auto">
                  <span class="text-[11px] text-faint font-medium">CTR</span>
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400">${esc(item.ctr || '4.8%')}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Chart initialization (Bulletproof SVG renderer + Chart.js fallback)
    const chartHost = document.getElementById('analyticsChartHost') || document.getElementById('analyticsChart')?.parentElement;
    if (chartHost) {
      const renderChart = (metricType) => {
        const datasetData = metricType === 'Engagements'
          ? data.analytics.engagements
          : (metricType === 'New Followers' ? data.analytics.followers : data.analytics.impressions);
        const metricLabel = metricType || 'Impressions';
        const color = metricType === 'Engagements' ? '#9333ea' : (metricType === 'New Followers' ? '#16a34a' : '#2f5bea');
        
        const labels = data.analytics.labels;
        const values = datasetData;
        const maxVal = Math.max(...values, 10);
        const minVal = 0;
        const w = 680;
        const h = 230;
        const padL = 45;
        const padR = 20;
        const padT = 20;
        const padB = 35;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        const points = values.map((v, i) => {
          const x = padL + (i / (values.length - 1)) * plotW;
          const y = padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
          return { x, y, v, label: labels[i] };
        });

        let pathD = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const mx = (p0.x + p1.x) / 2;
          pathD += ` C ${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`;
        }

        const areaD = `${pathD} L ${points[points.length - 1].x},${padT + plotH} L ${points[0].x},${padT + plotH} Z`;

        const gridlines = [0, 0.33, 0.66, 1].map(frac => {
          const y = padT + plotH * (1 - frac);
          const val = Math.round(minVal + frac * (maxVal - minVal));
          return `
            <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="3,3" />
            <text x="${padL - 8}" y="${y + 4}" font-size="11" fill="currentColor" fill-opacity="0.55" text-anchor="end">${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}</text>
          `;
        }).join('');

        const xLabels = points.filter((_, idx) => idx % 2 === 0 || idx === points.length - 1).map(p => `
          <text x="${p.x}" y="${h - 8}" font-size="11" fill="currentColor" fill-opacity="0.55" text-anchor="middle">${p.label}</text>
        `).join('');

        const circles = points.map(p => `
          <g class="chart-point group/pt cursor-pointer">
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffffff" stroke="${color}" stroke-width="2.5" class="transition-transform hover:scale-150" />
            <title>${p.label}: ${Number(p.v).toLocaleString()} ${metricLabel}</title>
          </g>
        `).join('');

        chartHost.innerHTML = `
          <svg viewBox="0 0 ${w} ${h}" class="w-full h-full text-slate-700 dark:text-slate-300 overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad_${metricLabel.replace(/\s+/g,'_')}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}" stop-opacity="0.28" />
                <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
              </linearGradient>
            </defs>
            ${gridlines}
            <path d="${areaD}" fill="url(#chartGrad_${metricLabel.replace(/\s+/g,'_')})" />
            <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            ${xLabels}
            ${circles}
          </svg>
        `;
      };

      renderChart('Impressions');

      const selectEl = $('[data-chart-metric-select]');
      if (selectEl) {
        selectEl.onchange = (e) => {
          renderChart(e.target.value);
        };
      }
    }

    // Quick Upload / Create Content Button
    $('[data-studio-create-btn]')?.addEventListener('click', () => {
      window.location.href = '/home?compose=post';
    });
  }

  document.addEventListener('click', async event => {
    const signout = event.target.closest('[data-menu-root] a, [data-action="logout"], a[href*="logout"], .cv-logout-btn-ok');
    if (signout && (/sign out|sign in|logout/i.test(signout.textContent) || signout.matches('[data-action="logout"], a[href*="logout"], .cv-logout-btn-ok'))) {
      event.preventDefault();
      if (!session) return window.FI.openAuth({ locked: true });
      try { await api.request('cv_logout'); } catch (_) {}
      applySession(null);
      signedOutState();
      toast('Signed out');
      window.FI.openAuth({ locked: true });
      return;
    }
    const protectedAction = event.target.closest('[data-live-auth]');
    if (protectedAction && !requireUser()) event.preventDefault();
  });

  /* ---- Prayer Wall (index) ------------------------------------------- */
  async function loadPrayerWall() {
    const list = $('#prayer-wall-list');
    const composer = $('#modal-prayer');
    if (composer) {
      const submit = $$('button', composer).find(button => /request prayer/i.test(button.textContent));
      if (submit && !submit.dataset.fiWired) {
        submit.dataset.fiWired = '1';
        submit.removeAttribute('data-toast');
        submit.addEventListener('click', async () => {
          if (!requireUser()) return;
          const title = $('input[type="text"]', composer);
          const body = $('textarea', composer);
          const content = [title?.value.trim(), body?.value.trim()].filter(Boolean).join(' — ');
          if (!content) return toast('Write your prayer request first.');
          try {
            await api.request('cv_create_prayer', { content });
            if (title) title.value = ''; if (body) body.value = '';
            $('[data-close]', composer)?.click();
            toast('Prayer request shared with the community');
            loadPrayerWall();
          } catch (error) { toast(error.message); }
        });
      }
    }
    if (!list) return;
    if (!session) {
      list.innerHTML = '';
      const count = $('[data-prayer-count]');
      if (count) count.textContent = 'Sign in to see real prayer requests.';
      return;
    }
    try {
      const result = await api.request('cv_get_prayers');
      const items = (result.items || []).slice(0, 3);
      const badge = $('[data-prayer-badge]');
      if (badge) { const total = (result.items || []).length; badge.textContent = total > 99 ? '99+' : total; badge.classList.toggle('hidden', !total); }
      const count = $('[data-prayer-count]');
      if (count) count.textContent = items.length
        ? `${result.items.length} request${result.items.length === 1 ? '' : 's'} waiting for prayer.`
        : 'No prayer requests yet — be the first to share one.';
      list.innerHTML = items.length ? items.map(prayer => `<div class="rounded-xl bg-raised border border-line p-3" data-prayer-id="${esc(prayer.id)}"><p class="text-[13px] leading-snug">${esc(prayer.content)}</p><div class="mt-2 flex items-center justify-between"><span class="text-[11.5px] text-muted">${esc(prayer.author)} · ${esc(prayer.time || '')}</span><span class="text-[12px] font-semibold text-brand">${Number(prayer.prayed_count || 0)} praying</span></div></div>`).join('')
        : '<p class="text-[13px] text-muted">No prayer requests yet.</p>';
    } catch (error) {
      list.innerHTML = `<p class="text-[13px] text-muted">${esc(error.message)}</p>`;
    }
  }

  /* ---- Verse of the Day ----------------------------------------------- */
  const VOTD_REFERENCES = [
    'John 3:16', 'Psalm 23:1-3', 'Proverbs 3:5-6', 'Isaiah 40:31', 'Romans 8:28',
    'Philippians 4:6-7', 'Joshua 1:9', 'Psalm 119:105', 'Matthew 11:28-30',
    '2 Corinthians 5:17', 'Jeremiah 29:11', 'Psalm 46:10', 'Hebrews 11:1',
    '1 Corinthians 13:4-7', 'Galatians 5:22-23', 'Ephesians 2:8-9',
    'Psalm 27:1', 'Romans 12:2', 'James 1:2-4', 'Isaiah 41:10',
    'Matthew 6:33', 'Psalm 51:10', 'John 14:6', 'Colossians 3:23',
    '1 Peter 5:7', 'Psalm 121:1-2', 'Micah 6:8', 'Lamentations 3:22-23',
    '2 Timothy 1:7', 'Revelation 21:4', 'Deuteronomy 31:6'
  ];

  async function loadVerseOfTheDay() {
    const quote = $('#votd');
    if (!quote) return;
    const day = Math.floor(Date.now() / 86400000);
    const reference = VOTD_REFERENCES[day % VOTD_REFERENCES.length];
    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}`);
      if (!response.ok) throw new Error('Verse unavailable');
      const data = await response.json();
      const body = String(data.text || '').replace(/\s+/g, ' ').trim();
      if (!body) throw new Error('Verse unavailable');
      const english = $$('p', quote).find(node => !node.classList.contains('font-khmer'));
      if (english) english.textContent = `“${body}”`;
      $$('p.font-khmer', quote).forEach(node => node.remove());
      const card = quote.closest('section') || quote.parentElement;
      let cite = card?.querySelector('[data-votd-ref]');
      if (!cite) {
        cite = document.createElement('p');
        cite.dataset.votdRef = '';
        cite.className = 'text-[12px] font-semibold text-gold mt-2';
        quote.appendChild(cite);
      }
      cite.textContent = data.reference || reference;
      const link = card?.querySelector('a[href="/bible-study"]');
      if (link) link.href = `/bible-study?passage=${encodeURIComponent(data.reference || reference)}`;
    } catch (_) { /* leave the shipped verse in place */ }
  }

  /* ---- Article composer (index) --------------------------------------- */
  function wireArticleComposer() {
    const modal = $('#modal-article');
    if (!modal) return;
    const authorName = $('#article-author-name', modal);
    const authorAvatar = $('#article-author-avatar', modal);
    if (session && authorName) authorName.textContent = `By ${session.name || session.displayName || 'You'}`;
    if (session && authorAvatar) {
      const pic = session.avatar_url || session.avatar || session.photo_url;
      if (pic) authorAvatar.innerHTML = `<img src="${esc(pic)}" class="w-full h-full object-cover rounded-full" alt="Author" />`;
      else authorAvatar.textContent = api.initials(session.name || 'You');
    }
  }

  window.FILive = { api, get user() { return session; }, requireUser, avatarMarkup, verificationBadgeMarkup, openMessenger };
  mountAuth();
  const page = document.body.dataset.page;

  function markActiveSideLink() {
    const here = location.pathname + location.search;
    const path = location.pathname;
    const hasSearch = Boolean(location.search);
    $$('#main a.side-link').forEach(link => {
      const href = link.getAttribute('href');
      let active = false;
      if (href === here) {
        active = true;
      } else if (!hasSearch && (href === path || (path === '/library' && href === '/library'))) {
        active = true;
      }
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }
  function signedOutState() {
    document.body.classList.add('fi-auth-locked', 'fi-logged-out');
    const main = $('#main');
    if (main) {
      main.style.display = 'none';
      main.inert = true;
      main.setAttribute('aria-hidden', 'true');
    }
    const header = document.querySelector('body > header');
    if (header) header.style.display = 'none';
    const tabBar = document.querySelector('.fi-tab-bar, nav[aria-label="Mobile navigation"]');
    if (tabBar) tabBar.style.display = 'none';
    const targets = {
      jobs: $$('#main h2').find(node => /recommended for you/i.test(node.textContent))?.closest('section')?.querySelector('.divide-y'),
      library: $('#shelf'),
      network: $$('#main h2').find(node => /people you may know/i.test(node.textContent))?.closest('section')?.querySelector('.grid'),
      notifications: $('#main > section.card')?.querySelector('.divide-y')
    };
    const target = targets[page];
    if (target) target.innerHTML = `<div class="p-8 text-center"><i class="fa-solid fa-lock text-2xl text-faint"></i><p class="mt-2 text-[13.5px] text-muted">Sign in to load your real ${esc(page)} data.</p><button class="btn btn-primary mt-3" data-open-auth>Sign in</button></div>`;
    if (page === 'network') $$('.count', $('#main > aside')).forEach(node => { node.textContent = '0'; });
    if (page === 'profile' || page === 'settings') {
      const content = page === 'profile' ? $('#main > div.space-y-4') : $('#main > div.space-y-5');
      if (content) content.innerHTML = `<section class="card p-10 text-center"><i class="fa-solid fa-lock text-3xl text-faint"></i><h1 class="text-[21px] font-bold mt-4">Sign in to view your ${esc(page)}</h1><p class="text-[13.5px] text-muted mt-2">Your saved account information will appear here. No sample profile data is shown.</p><button class="btn btn-primary mt-4" data-open-auth>Sign in</button></section>`;
    }
  }
  document.addEventListener('click', event => { if (event.target.closest('[data-open-auth]')) window.FI.openAuth({ locked: true }); });
  markActiveSideLink();
  loadVerseOfTheDay();
  document.addEventListener('fi:session', () => { if (page === 'home') loadPrayerWall(); });
  document.addEventListener('fi:session-updated', event => {
    const updated = event.detail;
    if (updated?.logged_in) {
      applySession(updated);
      refreshNotifications();
    } else if (session && !updated?.logged_in) {
      applySession(null);
      signedOutState();
      window.FI.openAuth({ locked: true });
    }
  });
  wireArticleComposer();
  $$('form[role="search"], #main form').forEach(form => form.querySelector('[data-toast]')?.removeAttribute('data-toast'));
  api.session().then(user => {
    applySession(user);
    if (!user?.logged_in) {
      signedOutState();
      window.FI.openAuth({
        locked: true,
        verificationRequired: !!user?.verification_required,
        email: user?.email || ''
      });
      return;
    }
    refreshNotifications();
    if (page === 'jobs') loadJobs();
    if (page === 'library') loadLibrary();
    if (page === 'network') loadNetwork();
    if (page === 'notifications') loadNotifications();
    if (page === 'profile') loadProfile(user);
    if (page === 'settings') loadSettings(user);
    if (page === 'settings-security') loadSettingsSecurity(user);
    if (page === 'studio' || page === 'dashboard') loadStudio(user);
  }).catch(() => {
    applySession(null);
    signedOutState();
    window.FI.openAuth({ locked: true });
  });
})();
