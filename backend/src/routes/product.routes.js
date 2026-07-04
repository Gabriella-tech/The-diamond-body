"use strict";

const router = require("express").Router();
const c = require("../controllers/product.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

router.get("/", c.list);
router.get("/featured", c.featured);
router.get("/best-sellers", c.bestSellers);
router.get("/categories", c.listCategories);
router.get("/:slug", c.getBySlug);

router.post("/", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.create);
router.put("/:id", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.update);
router.delete("/:id", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.remove);
router.delete("/hard/:id", requireAuth, requireRole("SUPER_ADMIN"), c.hardDelete);

router.post("/categories", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.createCategory);
router.put("/categories/:id", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.updateCategory);
router.delete("/categories/:id", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), c.deleteCategory);

module.exports = router;