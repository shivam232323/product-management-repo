import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.css'],
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  showAddForm = false;
  categoryName = '';
  editingCategory: Category | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => (this.categories = categories),
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  saveCategory(): void {
    if (!this.categoryName.trim()) return;

    const request = this.editingCategory
      ? this.categoryService.update(this.editingCategory.id, { name: this.categoryName })
      : this.categoryService.create({ name: this.categoryName });

    request.subscribe({
      next: () => {
        this.loadCategories();
        this.cancelEdit();
      },
      error: (err) => console.error('Error saving category:', err),
    });
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryName = category.name;
    this.showAddForm = true;
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure?')) {
      this.categoryService.delete(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => console.error('Error deleting category:', err),
      });
    }
  }

  cancelEdit(): void {
    this.showAddForm = false;
    this.categoryName = '';
    this.editingCategory = null;
  }
}
