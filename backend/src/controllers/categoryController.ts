import { Request, Response } from 'express';
import { query } from '../config/database';
import { randomUUID } from 'crypto';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY id DESC');
    res.json(categories);
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const categories: any = await query(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(categories[0]);
  } catch (error: any) {
    console.error('Get category error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const uniqueId = randomUUID();
    const result: any = await query(
      'INSERT INTO categories (unique_id, name) VALUES (?, ?)',
      [uniqueId, name]
    );

    const newCategory: any = await query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(Array.isArray(newCategory) ? newCategory[0] : newCategory);
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    await query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name, id]
    );

    const updated: any = await query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (!Array.isArray(updated) || updated.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message });
  }
};
