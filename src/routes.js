import express from 'express';

import { showHomePage } from './controllers/index.js';
import { showOrganizationsPage, organizationDetailsPage } from './controllers/organizations.js';
import { showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
import {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm
} from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';
import { showNewOrganizationForm } from './controllers/organizations.js';
import { processNewOrganizationForm } from './controllers/organizations.js';
import { organizationValidation } from './controllers/organizations.js';
import { showEditOrganizationForm, processEditOrganizationForm, showOrganizationLogo } from './controllers/organizations.js';
import { uploadLogo } from './middleware/upload.js';
import { processNewProjectForm } from './controllers/projects.js';
import { showNewProjectForm } from './controllers/projects.js';
import { projectValidation } from './controllers/projects.js';
import { showEditProjectForm, processEditProjectForm } from './controllers/projects.js';
import {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard
} from './controllers/users.js';

const router = express.Router();

// ========================================
// Public pages (anyone can view)
// ========================================
router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', organizationDetailsPage);
router.get('/organization/:id/logo', showOrganizationLogo);
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);

// ========================================
// Admin-only routes: requireRole('admin') runs first on every one,
// so only logged-in admins can create or update data
// ========================================

// Route for new organization page
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);

// Route to handle new organization form submission
router.post('/new-organization', requireRole('admin'), organizationValidation, processNewOrganizationForm);

// Routes to display and process the edit organization form
router.get('/edit-organization/:id', requireRole('admin'), showEditOrganizationForm);
// requireRole runs before uploadLogo so a non-admin's file is never read;
// uploadLogo then reads the multipart form (logo file + text fields) so the validation can see req.body
router.post('/edit-organization/:id', requireRole('admin'), uploadLogo, organizationValidation, processEditOrganizationForm);

// Route for new project page
router.get('/new-project', requireRole('admin'), showNewProjectForm);

// Route to handle new project form submission
router.post('/new-project', requireRole('admin'), projectValidation, processNewProjectForm);

// Routes to display and process the edit project form
router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireRole('admin'), projectValidation, processEditProjectForm);

// Routes to handle the assign categories to project form
router.get('/assign-categories/:projectId', requireRole('admin'), showAssignCategoriesForm);
router.post('/assign-categories/:projectId', requireRole('admin'), processAssignCategoriesForm);

// Routes to display and process the new category form
router.get('/new-category', requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireRole('admin'), categoryValidation, processNewCategoryForm);

// Routes to display and process the edit category form
router.get('/edit-category/:id', requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireRole('admin'), categoryValidation, processEditCategoryForm);

// User registration routes
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);

// User login routes
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);

// Protected dashboard route (requireLogin runs first, so only logged-in users reach showDashboard)
router.get('/dashboard', requireLogin, showDashboard);

// error-handling routes
router.get('/test-error', testErrorPage);

export default router;
