const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.get('/stats', supportController.getStats);
router.get('/', supportController.getTickets);
router.post('/', supportController.createTicket);
router.put('/:id/status', supportController.updateStatus);
router.post('/:id/reply', supportController.replyTicket);
router.get('/:id/replies', supportController.getReplies);
router.delete('/:id', supportController.deleteTicket);

module.exports = router;
