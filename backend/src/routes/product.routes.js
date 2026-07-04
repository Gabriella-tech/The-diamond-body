"use strict";

const router = require("express").Router();
const c = require("../controllers/product.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Public read routes
router.get("/", c.list);
router.get("/featured", c.featured);
router.get("/best-sellers", c.bestSellers);
router.get("/categories", c.listCategories);
router.get("/:slug", c.getBySlug);

// Protected routes for Admin/Super Admin
// These now require authentication and specific role clearance
router.post("/", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.create);
router.put("/:id", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.update);
router.delete("/:id", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.delete);

module.exports = router;