import { getAllOrganizations, getOrganizationById, createOrganization} from '../models/organizations.js';

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
    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png'; // Use the placeholder logo for all new organizations

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
 
    // Set a success flash message
    req.flash('success', 'Organization added successfully!');
    
    res.redirect(`/organization/${organizationId}`);
};

export { showOrganizationsPage, organizationDetailsPage, showNewOrganizationForm, processNewOrganizationForm };


