const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Do work here
router.get('/', storeController.homePage);

router.get('/echoed', storeController.echoed);

router.get('/reverse/:name', storeController.reverse_name);

module.exports = router;
