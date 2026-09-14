const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.post('/login', agentController.loginAgent);

router.get('/stats', agentController.getStats);
router.get('/top', agentController.getTopAgents);
router.get('/requests', agentController.getLogs);
router.get('/applicants', agentController.getApplicants);
router.get('/hierarchy', agentController.getHierarchy);
router.get('/my-referral-network', agentController.getMyReferralNetwork);
router.get('/my-referral-network', agentController.getMyReferralNetwork);
router.post('/onboard', agentController.onboard);
router.put('/applicants/:id/status', agentController.updateStatus);
router.put('/:id/notes', agentController.updateNotes);
router.delete('/:id', agentController.deleteAgent);
router.get('/payouts', agentController.getPayouts);
router.put('/payouts/:id/status', agentController.updatePayoutStatus);
router.post('/payouts/process-batch', agentController.processPayoutBatch);
router.get('/referral-codes', agentController.getReferralCodes);
router.post('/referral-codes', agentController.createReferralCode);
router.get('/referral-codes/validate/:code', agentController.validateReferralCode);
router.put('/referral-codes/:id/status', agentController.updateReferralCodeStatus);
router.post('/referral-codes/:id/recognize', agentController.sendRecognition);
router.get('/referral-orders', agentController.getReferralOrders);
router.get('/referral-orders/stats', agentController.getReferralOrderStats);
router.get('/logs', agentController.getLogs);
router.delete('/logs', agentController.clearLogs);

// Commission Rules & Settings
router.get('/commission-rules', agentController.getCommissionRules);
router.post('/commission-rules', agentController.createCommissionRule);
router.delete('/commission-rules/:id', agentController.deleteCommissionRule);
router.post('/commission-rules/bulk-update', agentController.bulkUpdateCommissionRules);
router.get('/settings', agentController.getSettings);
router.put('/settings', agentController.updateSettings);

// Auto Commission Calculation Engine
router.post('/commissions/calculate', agentController.calculateCommission);
router.get('/commissions', agentController.getCommissions);
router.get('/commissions/summary', agentController.getAgentCommissionSummary);
router.get('/commissions/referral-wise', agentController.getReferralWiseCommission);
router.get('/commissions/level-wise', agentController.getLevelWiseCommission);
router.put('/commissions/:id/status', agentController.updateCommissionStatus);

module.exports = router;
