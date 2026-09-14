const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

router.get('/banners', cmsController.getBanners);
router.put('/banners/:key', cmsController.updateBanner);
router.get('/testimonials', cmsController.getTestimonials);
router.post('/testimonials', cmsController.createTestimonial);
router.put('/testimonials/:id', cmsController.updateTestimonial);
router.delete('/testimonials/:id', cmsController.deleteTestimonial);

// Announcements
router.get('/announcements', cmsController.getAnnouncements);
router.post('/announcements', cmsController.createAnnouncement);
router.delete('/announcements/:id', cmsController.deleteAnnouncement);

// Articles / Journal (CMS & SEO)
router.get('/articles', cmsController.getArticles);
router.get('/articles/:slugOrId', cmsController.getArticleBySlugOrId);
router.post('/articles', cmsController.createArticle);
router.put('/articles/:id', cmsController.updateArticle);
router.patch('/articles/:id/featured', cmsController.toggleArticleFeatured);
router.delete('/articles/:id', cmsController.deleteArticle);

// CMS aliases for articles
router.get('/cms/articles', cmsController.getArticles);
router.get('/cms/articles/:slugOrId', cmsController.getArticleBySlugOrId);
router.post('/cms/articles', cmsController.createArticle);
router.put('/cms/articles/:id', cmsController.updateArticle);
router.delete('/cms/articles/:id', cmsController.deleteArticle);

module.exports = router;
