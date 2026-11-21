import {
    getAllCategories,
    getCategoryById,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    createCategory,
    updateCategory
} from '../models/categories.js';
import { getProjectsByCategoryId, getProjectDetails } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// PostgreSQL error code for a UNIQUE constraint violation (category names must be unique)
const UNIQUE_VIOLATION = '23505';

// Define validation rules for the new and edit category forms
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Category name must be between 3 and 100 characters')
];

const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Categories';

    res.render('categories', { title, categories });
};

const showCategoryDetailsPage = async (req, res) => {
    const id = Number(req.params.id);
    const category = Number.isInteger(id) ? await getCategoryById(id) : null;

    if (!category) {
        return res.status(404).send('Category not found');
    }

    const projects = await getProjectsByCategoryId(id);

    res.render('category', { title: category.name, category, projects });
};

const showAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;

    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails) {
        return res.status(404).send('Service project not found');
    }

    const categories = await getAllCategories();
    const assignedCategories = await getCategoriesByProjectId(projectId);

    const title = 'Assign Categories to Project';

    res.render('assign-categories', { title, projectId, projectDetails, categories, assignedCategories });
};

const processAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;
    const selectedCategoryIds = req.body.categoryIds || [];

    // Ensure selectedCategoryIds is an array (a single checkbox sends a plain string)
    const categoryIdsArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [selectedCategoryIds];

    await updateCategoryAssignments(projectId, categoryIdsArray);
    req.flash('success', 'Categories updated successfully.');
    res.redirect(`/project/${projectId}`);
};

const showNewCategoryForm = async (req, res) => {
    const title = 'Add New Category';

    res.render('new-category', { title });
};

const processNewCategoryForm = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loop through validation errors and flash them
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new category form
        return res.redirect('/new-category');
    }

    const { name } = req.body;

    try {
        const categoryId = await createCategory(name);
        req.flash('success', 'Category added successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        if (error.code === UNIQUE_VIOLATION) {
            req.flash('error', `A category named "${name}" already exists.`);
            return res.redirect('/new-category');
        }
        console.error('Error creating new category:', error);
        res.status(500).send('An error occurred while creating the category.');
    }
};

const showEditCategoryForm = async (req, res) => {
    const categoryId = req.params.id;

    // Get the existing category data so the form can be pre-filled
    const categoryDetails = await getCategoryById(categoryId);

    if (!categoryDetails) {
        return res.status(404).send('Category not found');
    }

    const title = 'Edit Category';

    res.render('edit-category', { title, categoryDetails });
};

const processEditCategoryForm = async (req, res) => {
    const categoryId = req.params.id;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loop through validation errors and flash them
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the edit category form
        return res.redirect(`/edit-category/${categoryId}`);
    }

    const { name } = req.body;

    try {
        await updateCategory(categoryId, name);
        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        if (error.code === UNIQUE_VIOLATION) {
            req.flash('error', `A category named "${name}" already exists.`);
            return res.redirect(`/edit-category/${categoryId}`);
        }
        console.error('Error updating category:', error);
        res.status(500).send('An error occurred while updating the category.');
    }
};

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm
};
