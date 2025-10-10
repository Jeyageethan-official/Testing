import { supabase } from './supabaseClient.js';

const authContainer = document.getElementById('authContainer');

// Function to protect the page
const protectPage = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // If no session, redirect to login page
        window.location.replace('index.html');
    } else {
        // If session exists, setup the user UI
        setupUserUI(session.user);
    }
};

// Function to set up user-specific UI elements (like logout button)
const setupUserUI = (user) => {
    if (user && authContainer) {
        authContainer.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-700 hidden md:inline">${user.email}</span>
                <button id="logout-button" class="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200">Logout</button>
            </div>
        `;
        
        const logoutButton = document.getElementById('logout-button');
        logoutButton.addEventListener('click', async () => {
            logoutButton.disabled = true;
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
                alert('Failed to sign out. Please try again.');
                logoutButton.disabled = false;
            }
            // onAuthStateChange will handle the redirect
        });
    }
};

// Listen for auth state changes to handle login/logout events
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
        // Redirect to login page on sign out
        window.location.replace('index.html');
    } else if (event === 'SIGNED_IN') {
        // When user signs in, setup their UI
        setupUserUI(session.user);
    }
});

// Run the protection check when the script loads
protectPage();
