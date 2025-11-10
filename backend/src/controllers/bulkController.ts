// controllers/bulkController.ts
import { Request, Response } from 'express';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { pool } from '../config/database';
import { randomUUID } from 'crypto';

export const bulkUploadProducts = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const products: any[] = [];
    const errors: any[] = [];
    const BATCH_SIZE = 500;
    const jobId = `job_${Date.now()}`;

    // Send immediate response
    res.json({
      message: 'Bulk upload started',
      jobId,
      info: 'Processing in background. Check status using job ID'
    });

    // Process in background
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csvParser())
      .on('data', (row) => {
        try {
          if (row.name && row.price && row.categoryId) {
            products.push({
              uniqueId: randomUUID(),
              name: row.name,
              image: row.image || '',
              price: parseFloat(row.price),
              categoryId: parseInt(row.categoryId)
            });

            // Insert batch when size is reached
            if (products.length >= BATCH_SIZE) {
              const batch = products.splice(0, BATCH_SIZE);
              insertBatch(batch).catch(err => {
                console.error('Batch insert error:', err);
              });
            }
          } else {
            errors.push({ row, error: 'Missing required fields' });
          }
        } catch (error: any) {
          errors.push({ row, error: error.message });
        }
      })
      .on('end', async () => {
        try {
          // Insert remaining products
          if (products.length > 0) {
            await insertBatch(products);
          }
          console.log(`✅ Bulk upload completed: ${products.length} products processed, ${errors.length} errors`);
        } catch (error) {
          console.error('Final batch error:', error);
        }
      })
      .on('error', (error) => {
        console.error('Stream error:', error);
      });

  } catch (error: any) {
    console.error('Upload error:', error);
  }
};

// Helper function to insert batch
async function insertBatch(products: any[]) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const values = products.map(p => [
      p.uniqueId,
      p.name,
      p.image,
      p.price,
      p.categoryId
    ]);

    const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();

    await connection.query(
      `INSERT INTO products (unique_id, name, image, price, category_id) VALUES ${placeholders}`,
      flatValues
    );

    await connection.commit();
    console.log(`Inserted batch of ${products.length} products`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}