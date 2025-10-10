import './style.css';
import { supabase } from './supabaseClient.js';

// Redirect if user is already logged in
const checkSessionAndRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.replace('app.html');
    }
};

document.addEventListener('DOMContentLoaded', () => {
  // Run the session check as soon as the DOM is ready.
  setTimeout(checkSessionAndRedirect, 0);

  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.querySelector('.login-button');
  const errorMessageDiv = document.getElementById('error-message');

  if (!loginForm) {
    console.error("Fatal Error: Login form not found in the DOM.");
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessageDiv.textContent = '';
    loginButton.disabled = true;
    loginButton.textContent = 'Signing In...';

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      // On successful login, redirect to the main application
      window.location.replace('app.html');

    } catch (error) {
      console.error('Error logging in:', error.message);
      // Custom error message for unconfirmed email
      if (error.message === 'Email not confirmed') {
        errorMessageDiv.innerHTML = 'Email not confirmed. Please check your inbox for the confirmation link. <br> <a href="#" id="resend-confirmation" class="forgot-password" style="display: inline-block; margin-top: 0.5rem;">Resend confirmation email?</a>';
        
        const resendLink = document.getElementById('resend-confirmation');
        if(resendLink) {
            resendLink.addEventListener('click', async (e) => {
                e.preventDefault();
                const emailForResend = emailInput.value;
                if(!emailForResend) {
                    errorMessageDiv.textContent = 'Please enter your email address to resend confirmation.';
                    return;
                }
                
                errorMessageDiv.textContent = 'Resending confirmation...';

                const { error: resendError } = await supabase.auth.resend({
                    type: 'signup',
                    email: emailForResend,
                });

                if (resendError) {
                    errorMessageDiv.textContent = resendError.message;
                } else {
                    errorMessageDiv.innerHTML = 'Confirmation email resent successfully. Please check your inbox.';
                }
            });
        }
      } else {
        errorMessageDiv.textContent = error.message || 'An unexpected error occurred. Please try again.';
      }
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Sign In';
    }
  });
});
