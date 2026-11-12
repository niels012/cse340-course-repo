import { getAllOrganizations, getOrganizationById } from '../models/organizations.js';

const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';

    res.render('organizations', { title, organizations });
};

const showOrganizationDetailsPage = async (req, res) => {
    const id = Number(req.params.id);
    const organization = Number.isInteger(id) ? await getOrganizationById(id) : null;

    if (!organization) {
        return res.status(404).send('Organization not found');
    }

    res.render('organization', { title: organization.name, organization });
};

export { showOrganizationsPage, showOrganizationDetailsPage };
