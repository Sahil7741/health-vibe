const express = require('express');
const router = express.Router();
const { setToken, addUser } = require('../controllers/authController');

router.post('/new-user', addUser);
router.post('/api/set-token', setToken);

module.exports = router;
