import db from './db.js'

const getAllCategories = async() => {
    const query = `
        SELECT category_id, name
        FROM public.categories;
    `;

    const result = await db.query(query);

    return result.rows;
}


const getCategoryById = async(categoryId) => {
    const query = `
        SELECT category_id, name
        FROM public.categories
        WHERE category_id = $1;
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows[0] || null;
}

const getCategoriesByProjectId = async(projectId) => {
    const query = `
        SELECT c.category_id, c.name
        FROM public.categories c
        INNER JOIN public.project_categories pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name ASC;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
}

/**
 * Creates a new category in the database.
 * @param {string} name - The name of the category.
 * @returns {Promise<number>} The ID of the newly created category.
 */
const createCategory = async (name) => {
    const query = `
        INSERT INTO public.categories (name)
        VALUES ($1)
        RETURNING category_id;
    `;

    const result = await db.query(query, [name]);

    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new category with ID:', result.rows[0].category_id);
    }

    return result.rows[0].category_id;
};

/**
 * Updates the name of an existing category.
 * @param {number} categoryId - The ID of the category to update.
 * @param {string} name - The new name of the category.
 * @returns {Promise<number>} The ID of the updated category.
 */
const updateCategory = async (categoryId, name) => {
    const query = `
        UPDATE public.categories
        SET name = $1
        WHERE category_id = $2
        RETURNING category_id;
    `;

    const result = await db.query(query, [name, categoryId]);

    if (result.rows.length === 0) {
        throw new Error('Category not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated category with ID:', categoryId);
    }

    return result.rows[0].category_id;
};

// Assign a single category to a project (used only inside this file)
const assignCategoryToProject = async(projectId, categoryId) => {
    const query = `
        INSERT INTO public.project_categories (project_id, category_id)
        VALUES ($1, $2);
    `;

    await db.query(query, [projectId, categoryId]);
}

// Replace all category assignments for a project with the given list
const updateCategoryAssignments = async(projectId, categoryIds) => {
    // First, remove existing category assignments for the project
    const deleteQuery = `
        DELETE FROM public.project_categories
        WHERE project_id = $1;
    `;
    await db.query(deleteQuery, [projectId]);

    // Next, add the new category assignments
    for (const categoryId of categoryIds) {
        await assignCategoryToProject(projectId, categoryId);
    }
}

export {
    getAllCategories,
    getCategoryById,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    createCategory,
    updateCategory
};
