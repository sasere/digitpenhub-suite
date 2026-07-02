const { Router } = require('express');
const c = require('../controllers/formTemplatesController');

const r = Router();

r.get('/categories', c.listCategories);
r.get('/', c.listFormTemplates);
r.get('/:id', c.getFormTemplate);

module.exports = r;
