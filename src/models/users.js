import db from './db.js'
import bcrypt from 'bcrypt';

/**
 * Creates a new user in the database with the default 'user' role.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address (used as the username).
 * @param {string} passwordHash - The hashed password (never the plain-text password).
 * @returns {Promise<number>} The ID of the newly created user.
 */
const createUser = async (name, email, passwordHash) => {
    const default_role = 'user';
    const query = `
        INSERT INTO public.users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM public.roles WHERE role_name = $4))
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, default_role];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

/**
 * Finds a user by email address, including the name of their role.
 * @param {string} email - The email address (username) to look up.
 * @returns {Promise<object|null>} The user row (including password_hash and role_name), or null if not found.
 */
const findUserByEmail = async (email) => {
    // Join the roles table so the user object carries role_name (e.g. 'user' or 'admin')
    // u.name is kept because the dashboard displays the user's name from the session
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM public.users u
        JOIN public.roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const queryParams = [email];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }

    return result.rows[0];
};

/**
 * Checks a plain-text password against a stored bcrypt hash.
 * @param {string} password - The password the user typed.
 * @param {string} passwordHash - The hash stored in the database.
 * @returns {Promise<boolean>} True if they match, false if not.
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Checks a user's email and password.
 * @param {string} email - The email address (username).
 * @param {string} password - The plain-text password the user typed.
 * @returns {Promise<object|null>} The user (without password_hash) if the login is valid, otherwise null.
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) {
        return null; // No user with that email
    }

    const isPasswordCorrect = await verifyPassword(password, user.password_hash);

    if (!isPasswordCorrect) {
        return null; // Wrong password
    }

    // Never send the password hash back to the rest of the app
    delete user.password_hash;
    return user;
};

/**
 * Gets every registered user with the name of their role.
 * The password hash is never selected.
 * @returns {Promise<Array<{user_id: number, name: string, email: string, role_name: string, created_at: Date}>>}
 */
const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name, u.created_at
        FROM public.users u
        LEFT JOIN public.roles r ON u.role_id = r.role_id
        ORDER BY u.name ASC
    `;

    const result = await db.query(query);

    return result.rows;
};

export { createUser, authenticateUser, getAllUsers };
