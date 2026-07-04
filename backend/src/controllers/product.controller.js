"use strict";

const list = async (req, res) => res.status(200).json({ message: "List" });
const featured = async (req, res) => res.status(200).json({ message: "Featured" });
const bestSellers = async (req, res) => res.status(200).json({ message: "Best Sellers" });
const listCategories = async (req, res) => res.status(200).json({ message: "Categories" });
const getBySlug = async (req, res) => res.status(200).json({ message: "Slug" });
const create = async (req, res) => res.status(201).json({ message: "Created" });
const update = async (req, res) => res.status(200).json({ message: "Updated" });
const remove = async (req, res) => res.status(200).json({ message: "Removed" });
const hardDelete = async (req, res) => res.status(200).json({ message: "Hard Deleted" });
const createCategory = async (req, res) => res.status(201).json({ message: "Category Created" });
const updateCategory = async (req, res) => res.status(200).json({ message: "Category Updated" });
const deleteCategory = async (req, res) => res.status(200).json({ message: "Category Deleted" });

module.exports = {
  list,
  featured,
  bestSellers,
  listCategories,
  getBySlug,
  create,
  update,
  remove,
  hardDelete,
  createCategory,
  updateCategory,
  deleteCategory
};