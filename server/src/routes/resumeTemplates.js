const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/resumeTemplateController');

// All template routes are public
router.get('/meta/options', ctrl.metaOptions);
router.get('/',             ctrl.list);
router.get('/:id',          ctrl.get);

module.exports = router;
