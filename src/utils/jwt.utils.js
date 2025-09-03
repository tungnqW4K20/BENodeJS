const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1);
}

const DEFAULT_CUSTOMER_EXPIRES_IN = process.env.JWT_CUSTOMER_EXPIRES_IN || '24h';
const DEFAULT_ADMIN_EXPIRES_IN = process.env.JWT_ADMIN_EXPIRES_IN || '24h';

const generateToken = (payload, userType) => {
    if (!payload || !payload.id || !payload.role) {
        throw new Error('Payload for JWT must contain id and role.');
    }
    const expiresIn = userType === 'admin' ? DEFAULT_ADMIN_EXPIRES_IN : DEFAULT_CUSTOMER_EXPIRES_IN;
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};


const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        throw error; 
    }
};

module.exports = {
    generateToken,
    verifyToken
};