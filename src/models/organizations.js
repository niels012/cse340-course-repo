import db from './db.js'

/**
 * SQL that builds the URL the views use for an organization's logo:
 * - an uploaded logo is served from /organization/:id/logo
 *   (?v=<upload time> makes browsers fetch the new image after a change)
 * - otherwise the image file named in logo_filename is used from /public/images
 * The logo bytes themselves are NOT selected here, so lists stay fast.
 */
const LOGO_URL_SQL = `
    CASE
        WHEN logo_data IS NOT NULL
            THEN '/organization/' || organization_id || '/logo?v=' || FLOOR(EXTRACT(EPOCH FROM logo_updated_at))::bigint
        ELSE '/images/' || logo_filename
    END AS logo_url
`;

const getAllOrganizations = async() => {
    const query = `
        SELECT organization_id, name, description, email, logo_filename, ${LOGO_URL_SQL}
        FROM public.organizations
        ORDER BY organization_id;
    `;

    const result = await db.query(query);

    return result.rows;
}

// A single organization, or null if no organization has that id
const getOrganizationById = async(organizationId) => {
    const query = `
        SELECT organization_id, name, description, email, logo_filename, ${LOGO_URL_SQL}
        FROM public.organizations
        WHERE organization_id = $1;
    `;

    const result = await db.query(query, [organizationId]);

    return result.rows[0] || null;
}

/**
 * Creates a new organization in the database.
 * @param {string} name - The name of the organization.
 * @param {string} description - A description of the organization.
 * @param {string} contactEmail - The contact email for the organization.
 * @param {string} logoFilename - The filename of the organization's logo.
 * @returns {Promise<number>} The id of the newly created organization record.
 */
const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
      INSERT INTO public.organizations (name, description, email, logo_filename)
      VALUES ($1, $2, $3, $4)
      RETURNING organization_id
    `;

    const queryParams = [name, description, contactEmail, logoFilename];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new organization with ID:', result.rows[0].organization_id);
    }

    return result.rows[0].organization_id;
};

/**
 * Updates an existing organization in the database.
 * @param {number} organizationId - The ID of the organization to update.
 * @param {string} name - The new name of the organization.
 * @param {string} description - The new description of the organization.
 * @param {string} contactEmail - The new contact email for the organization.
 * @param {string} logoFilename - The filename of the organization's logo.
 * @returns {Promise<number>} The ID of the updated organization.
 */
const updateOrganization = async (organizationId, name, description, contactEmail, logoFilename) => {
    const query = `
        UPDATE public.organizations
        SET name = $1,
            description = $2,
            email = $3,
            logo_filename = $4
        WHERE organization_id = $5
        RETURNING organization_id;
    `;

    const queryParams = [name, description, contactEmail, logoFilename, organizationId];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Organization not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated organization with ID:', organizationId);
    }

    return result.rows[0].organization_id;
};

/**
 * Saves an uploaded logo image for an organization.
 * @param {number} organizationId - The ID of the organization.
 * @param {Buffer} logoData - The image file contents.
 * @param {string} logoMime - The image type, e.g. 'image/png'.
 * @returns {Promise<number>} The ID of the updated organization.
 */
const updateOrganizationLogo = async (organizationId, logoData, logoMime) => {
    const query = `
        UPDATE public.organizations
        SET logo_data = $1,
            logo_mime = $2,
            logo_updated_at = NOW()
        WHERE organization_id = $3
        RETURNING organization_id;
    `;

    const result = await db.query(query, [logoData, logoMime, organizationId]);

    if (result.rows.length === 0) {
        throw new Error('Organization not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated logo for organization with ID:', organizationId);
    }

    return result.rows[0].organization_id;
};

/**
 * Gets the uploaded logo image for an organization.
 * @param {number} organizationId - The ID of the organization.
 * @returns {Promise<{logo_data: Buffer, logo_mime: string} | null>} The logo, or null if none was uploaded.
 */
const getOrganizationLogo = async (organizationId) => {
    const query = `
        SELECT logo_data, logo_mime
        FROM public.organizations
        WHERE organization_id = $1
          AND logo_data IS NOT NULL;
    `;

    const result = await db.query(query, [organizationId]);

    return result.rows[0] || null;
};

export {
    getAllOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    updateOrganizationLogo,
    getOrganizationLogo
}
