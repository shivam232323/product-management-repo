import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { query } from '../config/database';

export const getProducts = async (req: Request, res: Response) => {
  try {
    
    const {
      page = 1,
      limit = 10,
      sortBy = 'price',
      order = 'asc',
      search = '',
      categoryId
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build WHERE clause
    let whereConditions = [];
    let params: any[] = [];

    if (search) {
      whereConditions.push('p.name LIKE ?');
      params.push(`%${search}%`);
    }

    if (categoryId) {
      whereConditions.push('p.category_id = ?');
      params.push(categoryId);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const countResult: any = await query(countQuery, params);
    const total = countResult[0].total;

    // Get products with category
    const productsQuery = `
      SELECT 
        p.id,
        p.unique_id as uniqueId,
        p.name,
        p.image,
        p.price,
        p.category_id as categoryId,
        p.created_at as createdAt,
        p.updated_at as updatedAt,
        c.id as 'category.id',
        c.unique_id as 'category.uniqueId',
        c.name as 'category.name'
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${order}
      LIMIT ? OFFSET ?
    `;

    const products: any = await query(productsQuery, [...params, Number(limit), offset]);

    // Transform nested category object
    const transformedProducts = products.map((p: any) => ({
      id: p.id,
      uniqueId: p.uniqueId,
      name: p.name,
      image: p.image,
      price: parseFloat(p.price),
      categoryId: p.categoryId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: {
        id: p['category.id'],
        uniqueId: p['category.uniqueId'],
        name: p['category.name']
      }
    }));

    res.json({
      products: transformedProducts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productQuery = `
      SELECT 
        p.*,
        c.id as 'category_id',
        c.unique_id as 'category_uniqueId',
        c.name as 'category_name'
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;

    const products: any = await query(productQuery, [req.params.id]);

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const p = products[0];
    const product = {
      id: p.id,
      uniqueId: p.unique_id,
      name: p.name,
      image: p.image,
      price: parseFloat(p.price),
      categoryId: p.category_id,
      category: {
        id: p.category_id,
        uniqueId: p.category_uniqueId,
        name: p.category_name
      }
    };

    res.json(product);
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, image, price, categoryId } = req.body;

    const uniqueId = randomUUID();

    const result: any = await query(
      'INSERT INTO products (unique_id, name, image, price, category_id) VALUES (?, ?, ?, ?, ?)',
      [uniqueId, name, image || '', price, categoryId]
    );

    const newProduct: any = await query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(Array.isArray(newProduct) ? newProduct[0] : newProduct);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, image, price, categoryId } = req.body;
    const { id } = req.params;

    await query(
      'UPDATE products SET name = ?, image = ?, price = ?, category_id = ? WHERE id = ?',
      [name, image, price, categoryId, id]
    );

    const updated: any = await query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!Array.isArray(updated) || updated.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
};
