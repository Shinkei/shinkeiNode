const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore)); // this is a handler that will wrap the funtion to catch the errors

router.get('/echoed', storeController.echoed);

router.get('/reverse/:name', storeController.reverse_name);

module.exports = router;
