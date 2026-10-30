CREATE table organizations (
	organization_id serial PRIMARY KEY ,
	name varchar(150) NOT NULL,
	description TEXT NOT NULL,
	email varchar(255) NOT NULL,
	logo_filename varchar(255) NOT NULL
)

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