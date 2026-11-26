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
import { showUserRegistrationForm, processUserRegistrationForm } from './controllers/users.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/new-organization', showNewOrganizationForm);
router.get('/organization/:id', organizationDetailsPage);
router.get('/organization/:id/logo', showOrganizationLogo);
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);

// Route to handle new organization form submission
router.post('/new-organization', organizationValidation, processNewOrganizationForm);

// Routes to display and process the edit organization form
router.get('/edit-organization/:id', showEditOrganizationForm);
// uploadLogo runs first: it reads the multipart form (logo file + text fields) so the validation can see req.body
router.post('/edit-organization/:id', uploadLogo, organizationValidation, processEditOrganizationForm);

// Route for new project page
router.get('/new-project', showNewProjectForm);

// Route to handle new project form submission
router.post('/new-project', projectValidation, processNewProjectForm);

// Routes to display and process the edit project form
router.get('/edit-project/:id', showEditProjectForm);
router.post('/edit-project/:id', projectValidation, processEditProjectForm);

// Routes to handle the assign categories to project form
router.get('/assign-categories/:projectId', showAssignCategoriesForm);
router.post('/assign-categories/:projectId', processAssignCategoriesForm);

// Routes to display and process the new category form
router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);

// Routes to display and process the edit category form
router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, processEditCategoryForm);

// User registration routes
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);

// error-handling routes
router.get('/test-error', testErrorPage);

export default router;
