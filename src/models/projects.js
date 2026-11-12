import db from './db.js'

const getAllProjects = async() => {
    const query = `
        SELECT
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            o.name AS organization_name
        FROM public.service_projects p
        INNER JOIN public.organizations o ON p.organization_id = o.organization_id
        ORDER BY p.project_date ASC;
    `;
    const result = await db.query(query);
    return result.rows;
}

// The next `number_of_projects` projects dated today or later, soonest first
const getUpcomingProjects = async(number_of_projects) => {
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.project_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM public.service_projects p
        INNER JOIN public.organizations o ON p.organization_id = o.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date ASC
        LIMIT $1;
    `;
    const result = await db.query(query, [number_of_projects]);
    return result.rows;
}

// A single project with its organization, or null if no project has that id
const getProjectDetails = async(id) => {
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.project_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM public.service_projects p
        INNER JOIN public.organizations o ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
}

export {getAllProjects, getUpcomingProjects, getProjectDetails}
