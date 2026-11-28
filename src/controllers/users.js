import bcrypt from 'bcrypt';
import { createUser, authenticateUser, getAllUsers } from '../models/users.js';

// PostgreSQL error code for a UNIQUE constraint violation (email must be unique)
const UNIQUE_VIOLATION = '23505';

const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Hash the password before storing it (never store the plain-text password)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create the user in the database
        await createUser(name, email, passwordHash);

        // Redirect to the home page after successful registration
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
    } catch (error) {
        // The email is already used by another account
        if (error.code === UNIQUE_VIOLATION) {
            req.flash('error', 'An account with that email already exists.');
            return res.redirect('/register');
        }

        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);

        if (user) {
            // Store user info in session (authenticateUser already removed the password hash)
            req.session.user = user;
            req.flash('success', 'Login successful!');

            if (res.locals.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            // Send the user to their dashboard after a successful login
            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = async (req, res) => {
    // Remove the user from the session. The session itself is kept (not destroyed)
    // so the "Logout successful!" flash message, which is stored in the session,
    // survives the redirect and can be shown on the login page.
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

/**
 * Middleware that protects routes only logged-in users may see.
 * processLoginForm stores the user in req.session.user, so if it is missing
 * the visitor is sent to the login page with a flash message.
 */
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to view that page.');
        return res.redirect('/login');
    }

    next();
};

/**
 * Middleware factory to require specific role for route access
 * Returns middleware that checks if user has the required role
 *
 * @param {string} role - The role name required (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 */
const requireRole = (role) => {
    return (req, res, next) => {
        // Check if user is logged in first
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        // Check if user's role matches the required role.
        // Logged-in users without the role go back to their dashboard (which every logged-in user can see)
        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/dashboard');
        }

        // User has required role, continue
        next();
    };
};

const showDashboard = (req, res) => {
    // requireLogin (on the route) guarantees req.session.user exists here
    const user = req.session.user;

    res.render('dashboard', {
        title: 'Dashboard',
        name: user.name,
        email: user.email,
        role: user.role_name
    });
};

// Admin-only page listing every registered user (protected by requireRole('admin') on the route)
const showUsersPage = async (req, res) => {
    const users = await getAllUsers();

    res.render('users', {
        title: 'Registered Users',
        users
    });
};

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    showUsersPage
};
