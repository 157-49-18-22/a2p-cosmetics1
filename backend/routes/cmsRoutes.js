const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

router.get('/banners', cmsController.getBanners);
router.put('/banners/:key', cmsController.updateBanner);
router.get('/testimonials', cmsController.getTestimonials);
router.post('/testimonials', cmsController.createTestimonial);

// Announcements
router.get('/announcements', cmsController.getAnnouncements);
router.post('/announcements', cmsController.createAnnouncement);
router.delete('/announcements/:id', cmsController.deleteAnnouncement);

module.exports = router;
