import bcrypt from 'bcrypt';
import { createUser } from '../models/users.js';

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

export { showUserRegistrationForm, processUserRegistrationForm };
