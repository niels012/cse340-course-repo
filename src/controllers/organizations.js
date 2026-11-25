import {
    getAllOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    updateOrganizationLogo,
    getOrganizationLogo
} from '../models/organizations.js';
import { body, validationResult } from 'express-validator';

// Define validation and sanitization rules for organization form
// Define validation rules for organization form
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

// Define any controller functions
const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';

    res.render('organizations', { title, organizations });
};


const organizationDetailsPage = async (req, res) => {
    const id = Number(req.params.id);
    const organization = Number.isInteger(id) ? await getOrganizationById(id) : null;

    if (!organization) {
        return res.status(404).send('Organization not found');
    }

    res.render('organization', { title: organization.name, organization });
};

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';

    res.render('new-organization', { title });
}

const processNewOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new organization form
        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png'; // Use the placeholder logo for all new organizations    

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
    req.flash('success', 'Organization added successfully!');
    res.redirect(`/organization/${organizationId}`);
};

const showEditOrganizationForm = async (req, res) => {
    const organizationId = req.params.id;

    // Get the existing organization data so the form can be pre-filled
    const organizationDetails = await getOrganizationById(organizationId);

    if (!organizationDetails) {
        return res.status(404).send('Organization not found');
    }

    const title = 'Edit Organization';

    res.render('edit-organization', { title, organizationDetails });
};

const processEditOrganizationForm = async (req, res) => {
    const organizationId = req.params.id;

    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the edit organization form
        return res.redirect(`/edit-organization/${organizationId}`);
    }

    const { name, description, contactEmail } = req.body;

    // Keep the organization's fallback logo filename (e.g. placeholder-logo.png)
    const organizationDetails = await getOrganizationById(organizationId);

    if (!organizationDetails) {
        return res.status(404).send('Organization not found');
    }

    await updateOrganization(organizationId, name, description, contactEmail, organizationDetails.logo_filename);

    // If a new logo was chosen, save it (the uploadLogo middleware already checked it is a valid image)
    if (req.file) {
        await updateOrganizationLogo(organizationId, req.file.buffer, req.file.mimetype);
    }

    req.flash('success', 'Organization updated successfully!');
    res.redirect(`/organization/${organizationId}`);
};

// Sends an organization's uploaded logo image to the browser
const showOrganizationLogo = async (req, res) => {
    const id = Number(req.params.id);
    const logo = Number.isInteger(id) ? await getOrganizationLogo(id) : null;

    if (!logo) {
        return res.status(404).send('Logo not found');
    }

    res.set({
        'Content-Type': logo.logo_mime,
        // The URL changes (?v=...) whenever a new logo is uploaded, so browsers can cache it long-term
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Tell browsers not to guess a different file type
        'X-Content-Type-Options': 'nosniff'
    });
    res.send(logo.logo_data);
};

export {
    showOrganizationsPage,
    organizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    organizationValidation,
    showEditOrganizationForm,
    processEditOrganizationForm,
    showOrganizationLogo
};


