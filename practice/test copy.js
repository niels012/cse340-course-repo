

import express from 'express';
const app = express();

// Normal route
app.get('/', (req, res) => res.send('Home works'));

// Triggers a 500
app.get('/boom', (req, res) => {
    throw new Error('Something broke');
});

// Triggers a 404 through the error handler
app.get('/missing', (req, res, next) => {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
});

// Catch-all: turns any unmatched URL into a 404 error
app.use((req, res, next) => {
    const err = new Error('Page not found');
    err.status = 404;
    next(err);
});


// Global error handler - note the four parameters
app.use((err, req, res, next) => {
    // Log error details for developers
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
    
    // Determine response based on error type
    const status = err.status || 500;
    const message = status === 404 
        ? 'The page you requested could not be found.' 
        : 'An unexpected error occurred. Please try again later.';
    
    // Send appropriate response to user
    res.status(status).send(message);
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Test server running at http://localhost:${PORT}`);
});
