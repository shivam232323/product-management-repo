import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.html',
 
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  productId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      image: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => (this.categories = categories),
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          image: product.image,
          price: product.price,
          categoryId: product.categoryId,
        });
      },
      error: (err) => console.error('Error loading product:', err),
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.loading = true;
    const productData = this.productForm.value;

    const request =
      this.isEditMode && this.productId
        ? this.productService.update(this.productId, productData)
        : this.productService.create(productData);

    request.subscribe({
      next: () => {
        alert(`Product ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Error saving product:', err);
        alert('Failed to save product');
        this.loading = false;
      },
    });
  }
}
