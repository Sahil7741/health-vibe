const jwt = require('jsonwebtoken');
const userCollection = require('../models/User');

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Unauthorized access' });

    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token expired or forbidden access' });
        req.decoded = decoded;
        next();
    });
};

const verifyRole = (role) => {
    return async (req, res, next) => {
        const email = req.decoded.email;
        const user = await userCollection.findOne({ email });
        if (user?.role === role) return next();
        return res.status(401).json({ error: 'Unauthorized access' });
    };
};

// Verify admin
const verifyAdmin = async (req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    if (user.role === 'admin') {
        next()
    }
    else {
        return res.status(401).send({ error: true, message: 'Unauthorize access' })
    }
}

const verifyInstructor = async (req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    if (user.role === 'instructor' || user.role === 'admin') {
        next()
    }
    else {
        return res.status(401).send({ error: true, message: 'Unauthorize access' })
    }
}

module.exports = { 
    verifyJWT, 
    verifyRole,
    verifyAdmin,
    verifyInstructor  
};
