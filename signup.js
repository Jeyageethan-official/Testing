import './style.css';
import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signupButton = document.querySelector('.login-button');
    const errorMessageDiv = document.getElementById('error-message');
    
    const signupView = document.getElementById('signup-view');
    const successView = document.getElementById('success-view');

    if (!signupForm) {
        console.error("Fatal Error: Signup form not found in the DOM.");
        return;
    }

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.textContent = '';
        signupButton.disabled = true;
        signupButton.textContent = 'Creating Account...';

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            // Construct the redirect URL relative to the current location.
            // This makes it work correctly whether on localhost or a deployed site.
            const redirectUrl = new URL('app.html', window.location.href).href;

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    // This ensures the redirect works correctly after email confirmation
                    emailRedirectTo: redirectUrl
                }
            });

            if (error) {
                throw error;
            }

            // Show success message and hide form
            if (signupView && successView) {
                signupView.classList.add('hidden');
                successView.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error signing up:', error.message);
            errorMessageDiv.textContent = error.message || 'An unexpected error occurred. Please try again.';
        } finally {
            signupButton.disabled = false;
            signupButton.textContent = 'Create Account';
        }
    });
});
