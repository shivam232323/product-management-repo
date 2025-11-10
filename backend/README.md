# Product Management System — Backend

This folder contains the Node.js + TypeScript backend for the Product Management System.

Contents
- `src/` — TypeScript source
- `.env` — environment variables (not committed)
- `package.json` / `tsconfig.json`

Quick start

1. Install dependencies

   Open a terminal in `backend/` and run:

   npm install

2. Create or copy `.env`

   Use the provided `.env` template (if any). Required env vars typically include:
   - `PORT` (e.g. 3000)
   - `DATABASE_URL` or DB connection pieces (host, user, password, db)
   - `JWT_SECRET`

3. Build (optional) and run in dev

   - Run in dev with ts-node / ts-node-dev (if configured):

     npm run dev

   - Or compile and run:

     npm run build
     npm start

API docs and Postman

- See `API_README.md` for endpoint documentation and examples.
- To test quickly, import `backend/postman_collection.json` into Postman and set the `baseUrl` environment variable to `http://localhost:3000`.

Testing

- Tests (if present) live in `tests/`.
- Run tests with:

  npm test

Notes

- This README gives a quick overview. See `API_README.md` for detailed API routes and examples.


File Structure

backend/
├── src/
│   ├── config/
│   │   └── database.ts                    
│   │
│   ├── models/
│   │   ├── User.ts                        
│   │   ├── Category.ts                    
│   │   ├── Product.ts                     
│   │   └── index.ts                       
│   │
│   ├── controllers/
│   │   ├── authController.ts              
│   │   ├── categoryController.ts          
│   │   ├── productController.ts           
│   │   ├── bulkController.ts              
│   │   └── reportController.ts            
│   │
│   ├── middleware/
│   │   └── auth.ts                        
│   │
│   ├── routes/
│   │   ├── auth.routes.ts                 
│   │   ├── category.routes.ts             
│   │   ├── product.routes.ts              
│   │   └── bulk.routes.ts                 
│   │
│   └── app.ts                             
│
├── .env                                    
├── .gitignore                              
├── package.json                            
└── tsconfig.json                           
