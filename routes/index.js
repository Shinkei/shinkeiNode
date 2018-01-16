const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', storeController.homePage);
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);
router.post('/add', storeController.upload, catchErrors(storeController.resize), catchErrors(storeController.createStore)); // this is a handler that will wrap the funtion to catch the errors
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.post('/add/:id', storeController.upload, catchErrors(storeController.resize), catchErrors(storeController.updateStore)); // this is a handler that will wrap the funtion to catch the errors

router.get('/echoed', storeController.echoed);
router.get('/reverse/:name', storeController.reverse_name);

module.exports = router;
