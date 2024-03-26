// securityHeadersMiddleware.js
const securityHeadersMiddleware = (req, res, next) => {
    // Add security headers to the response
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    // Call the next middleware in the chain
    next();
};

module.exports = securityHeadersMiddleware;
