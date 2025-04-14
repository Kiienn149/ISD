const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/register', userController.showRegisterForm);
router.post('/register', userController.register);
router.get('/login', userController.showLoginForm);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

router.get('/settings', userController.showSettings); // Trang settings chính
module.exports = router;
