import { Request, Response } from 'express';
import { pool } from '../config/database';
import * as ExcelJS from 'exceljs';

export const generateProductReport = async (req: Request, res: Response) => {
  try {
    const { format = 'csv' } = req.query;

    // Set timeout to 5 minutes for large datasets
    req.setTimeout(300000);

    const CHUNK_SIZE = 1000;
    let offset = 0;
    let hasMore = true;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products.csv');

      // Write CSV header
      res.write('UniqueID,Name,Price,Category,Image\n');

      while (hasMore) {
        const products: any = await pool.query(
          `SELECT 
            p.unique_id,
            p.name,
            p.price,
            p.image,
            c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LIMIT ? OFFSET ?`,
          [CHUNK_SIZE, offset]
        );

        const rows = products[0];

        if (!Array.isArray(rows) || rows.length === 0) {
          hasMore = false;
        } else {
          rows.forEach((product: any) => {
            const row = `${product.unique_id},"${product.name}",${product.price},"${product.category_name || ''}","${product.image}"\n`;
            res.write(row);
          });
          offset += CHUNK_SIZE;
        }
      }
      res.end();

    } else if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
      const worksheet = workbook.addWorksheet('Products');

      worksheet.columns = [
        { header: 'UniqueID', key: 'uniqueId', width: 30 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Image', key: 'image', width: 40 }
      ];

      while (hasMore) {
        const products: any = await pool.query(
          `SELECT 
            p.unique_id,
            p.name,
            p.price,
            p.image,
            c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LIMIT ? OFFSET ?`,
          [CHUNK_SIZE, offset]
        );

        const rows = products[0];

        if (!Array.isArray(rows) || rows.length === 0) {
          hasMore = false;
        } else {
          rows.forEach((product: any) => {
            worksheet.addRow({
              uniqueId: product.unique_id,
              name: product.name,
              price: product.price,
              category: product.category_name || '',
              image: product.image
            }).commit();
          });
          offset += CHUNK_SIZE;
        }
      }

      await worksheet.commit();
      await workbook.commit();
    } else {
      res.status(400).json({ error: 'Invalid format. Use csv or xlsx' });
    }

  } catch (error: any) {
    console.error('Report generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};
