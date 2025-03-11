import prisma from '../../DB/db.config.js';

// Get all categories (public access)
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json({ categories }); // Return { categories: [...] }
  } catch (error) {
    console.error('[ERROR] Fetch categories failed:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
// Create a category (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Update a category (admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Delete a category (admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    // Check if category has associated posts
    const postCount = await prisma.post.count({
      where: { categoryId },
    });
    if (postCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category with existing posts' });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};