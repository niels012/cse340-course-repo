CREATE table organizations (
	organization_id serial PRIMARY KEY ,
	name varchar(150) NOT NULL,
	description TEXT NOT NULL,
	email varchar(255) NOT NULL,
	logo_filename varchar(255) NOT NULL
);

-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organizations (name, description, email, logo_filename)
VALUES
    ('BrightFuture Builders',
     'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
     'info@brightfuturebuilders.org',
     'brightfuture-logo.png'),
    ('GreenHarvest Growers',
     'An urban farming collective promoting food sustainability and education in local neighborhoods.',
     'contact@greenharvest.org',
     'greenharvest-logo.png'),
    ('UnityServe Volunteers',
     'A volunteer coordination group supporting local charities and service initiatives.',
     'hello@unityserve.org',
     'unityserve-logo.png');

-- ========================================
-- Table: Service Projects
-- ========================================
CREATE TABLE service_projects (
    project_id serial PRIMARY KEY,
    organization_id integer NOT NULL
        REFERENCES organizations (organization_id),
    title varchar(150) NOT NULL,
    description TEXT NOT NULL,
    location varchar(255) NOT NULL,
    project_date date NOT NULL
);

-- ========================================
-- Insert sample data: Service Projects
-- ========================================
INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES
    -- BrightFuture Builders (1): community infrastructure / construction
    (1, 'Park Bench Restoration',
        'Sand, repair, and repaint worn benches throughout the park to make them safe and welcoming again.',
        'Riverside Park, 120 River Rd', '2026-11-14'),
    (1, 'Playground Rebuild',
        'Help assemble new playground equipment and lay safety mulch for neighborhood children.',
        'Maple Street Elementary, 45 Maple St', '2026-12-05'),
    (1, 'Senior Home Accessibility Ramps',
        'Build wheelchair ramps for elderly residents to improve home accessibility.',
        'Oakwood Senior Community, 300 Oak Ave', '2027-01-16'),
    (1, 'Community Center Repainting',
        'Repaint interior walls and trim of the community center ahead of the spring season.',
        'Eastside Community Center, 88 Center Blvd', '2027-02-20'),
    (1, 'Trail Bridge Construction',
        'Construct a small wooden footbridge over the creek on the nature trail.',
        'Pinecrest Nature Trail, Trailhead Lot B', '2027-03-27'),

    -- GreenHarvest Growers (2): urban farming / food sustainability
    (2, 'Community Garden Winter Prep',
        'Mulch beds, plant cover crops, and prepare the garden for the winter months.',
        'GreenHarvest Garden Plot, 15 Elm St', '2026-11-21'),
    (2, 'Composting Workshop',
        'Teach families how to start and maintain a backyard compost system.',
        'Central Library Meeting Room, 200 Main St', '2026-12-12'),
    (2, 'School Garden Planting Day',
        'Work with students to plant vegetables in raised beds and learn about healthy eating.',
        'Lincoln Middle School, 75 Lincoln Way', '2027-02-06'),
    (2, 'Seed Library Sorting',
        'Sort, package, and label donated seeds for the free community seed library.',
        'GreenHarvest Greenhouse, 15 Elm St', '2027-03-06'),
    (2, 'Spring Harvest Food Share',
        'Harvest fresh produce and distribute it to local families and food pantries.',
        'Westside Urban Farm, 410 Harvest Ln', '2027-04-17'),

    -- UnityServe Volunteers (3): supporting local charities
    (3, 'Thanksgiving Food Drive',
        'Collect, sort, and pack donated food into holiday meal boxes for families in need.',
        'UnityServe Warehouse, 9 Commerce Dr', '2026-11-25'),
    (3, 'Winter Coat Collection',
        'Gather and distribute warm coats, hats, and gloves to those in need this winter.',
        'Downtown Shelter, 55 Hope St', '2026-12-19'),
    (3, 'Homeless Shelter Meal Service',
        'Prepare and serve hot meals to guests at the local shelter.',
        'Downtown Shelter, 55 Hope St', '2027-01-23'),
    (3, 'Literacy Tutoring Night',
        'Tutor children and adults in reading and writing skills.',
        'Central Library, 200 Main St', '2027-02-27'),
    (3, 'Neighborhood Cleanup Day',
        'Pick up litter and clear debris from streets, sidewalks, and storm drains.',
        'Meet at City Hall Plaza, 1 Civic Center', '2027-04-10');
   

-- ========================================
-- Table: Categories
-- ========================================
CREATE TABLE categories (
    category_id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE
);

-- ========================================
-- Junction table: Service Projects <-> Categories (many-to-many)
-- ========================================
CREATE TABLE project_categories (
    project_id integer NOT NULL
        REFERENCES service_projects (project_id) ON DELETE CASCADE,
    category_id integer NOT NULL
        REFERENCES categories (category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- ========================================
-- Insert sample data: Categories
-- ========================================
INSERT INTO categories (name)
VALUES
    ('Construction & Repair'),   -- 1
    ('Environmental'),           -- 2
    ('Education'),               -- 3
    ('Food & Hunger Relief'),    -- 4
    ('Community Outreach');      -- 5

-- ========================================
-- Insert sample data: Project Categories
-- ========================================
INSERT INTO project_categories (project_id, category_id)
VALUES
    (1, 1), (1, 2),     -- Park Bench Restoration
    (2, 1), (2, 5),     -- Playground Rebuild
    (3, 1), (3, 5),     -- Senior Home Accessibility Ramps
    (4, 1),             -- Community Center Repainting
    (5, 1), (5, 2),     -- Trail Bridge Construction
    (6, 2),             -- Community Garden Winter Prep
    (7, 2), (7, 3),     -- Composting Workshop
    (8, 2), (8, 3),     -- School Garden Planting Day
    (9, 2),             -- Seed Library Sorting
    (10, 2), (10, 4),   -- Spring Harvest Food Share
    (11, 4), (11, 5),   -- Thanksgiving Food Drive
    (12, 5),            -- Winter Coat Collection
    (13, 4), (13, 5),   -- Homeless Shelter Meal Service
    (14, 3),            -- Literacy Tutoring Night
    (15, 2), (15, 5);   -- Neighborhood Cleanup Day
