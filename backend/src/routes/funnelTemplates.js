const { Router } = require('express');
const c = require('../controllers/funnelTemplatesController');

const r = Router();

r.get('/categories', c.listCategories);
r.get('/', c.listFunnelTemplates);
r.get('/:id', c.getFunnelTemplate);
r.post('/:id/use', c.useFunnelTemplate);

module.exports = r;
