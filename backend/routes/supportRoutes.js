const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.get('/stats', supportController.getStats);
router.get('/export/csv', supportController.exportCSV);
router.post('/bulk', supportController.bulkAction);
router.get('/', supportController.getTickets);
router.post('/', supportController.createTicket);
router.get('/:id', supportController.getTicketById);
router.put('/:id/status', supportController.updateStatus);
router.put('/:id/priority', supportController.updatePriority);
router.put('/:id/assign', supportController.assignTicket);
router.put('/:id/tags', supportController.updateTags);
router.post('/:id/reply', supportController.replyTicket);
router.get('/:id/replies', supportController.getReplies);
router.delete('/:id', supportController.deleteTicket);

module.exports = router;
