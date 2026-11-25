import multer from 'multer';

/**
 * Logo Upload Middleware
 *
 * Reads a single image from the "logo" field of a multipart form into memory
 * (req.file.buffer) so the controller can save it in the database.
 * Files are not written to disk because the hosting server's disk is reset
 * on every restart and redeploy.
 *
 * Multer also parses the form's text fields into req.body, so this middleware
 * must run BEFORE the express-validator rules on the route.
 */

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * Works out the image type from the file's first bytes ("magic numbers")
 * instead of trusting the type the browser reports.
 * SVG is intentionally not allowed because SVG files can contain scripts.
 * @param {Buffer} buffer - The uploaded file contents.
 * @returns {string|null} The image MIME type, or null if it is not a supported image.
 */
const detectImageType = (buffer) => {
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        return 'image/png';
    }
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }
    if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
        return 'image/gif';
    }
    if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
        return 'image/webp';
    }
    return null;
};

const logoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_LOGO_SIZE, files: 1 }
}).single('logo');

/**
 * Handles the logo upload and sends the user back to the form with a flash
 * message if the file is too large or is not a supported image.
 * When the user does not choose a file, req.file is undefined and the
 * organization keeps its current logo.
 */
const uploadLogo = (req, res, next) => {
    logoUpload(req, res, (error) => {
        if (error) {
            const message = error.code === 'LIMIT_FILE_SIZE'
                ? 'Logo image must be 2 MB or smaller.'
                : 'The logo could not be uploaded. Please try again.';
            req.flash('error', message);
            return res.redirect(req.originalUrl);
        }

        if (req.file) {
            const imageType = detectImageType(req.file.buffer);

            if (!imageType) {
                req.flash('error', 'Logo must be a PNG, JPG, GIF, or WebP image.');
                return res.redirect(req.originalUrl);
            }

            // Use the type detected from the file contents, not the browser's claim
            req.file.mimetype = imageType;
        }

        next();
    });
};

export { uploadLogo };
