import { Component, OnInit } from '@angular/core';
import { ProductService, Product, ProductListResponse } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css'],
 
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalProducts = 0;

  // Filters
  searchTerm = '';
  selectedCategoryId: number | null = null;
  sortBy = 'price';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => (this.categories = categories),
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalProducts);
  }

  loadProducts(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      order: this.sortOrder,
      search: this.searchTerm,
      categoryId: this.selectedCategoryId || undefined,
    };

    this.productService.getAll(params).subscribe({
      next: (response: ProductListResponse) => {
        this.products = response.products;
        this.totalPages = response.pagination.totalPages;
        this.totalProducts = response.pagination.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.loadProducts();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  editProduct(id: number): void {
    this.router.navigate(['/products/edit', id]);
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          alert('Product deleted successfully');
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Failed to delete product');
        },
      });
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
