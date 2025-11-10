import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.html',
  styleUrls: ['./bulk-upload.css'],
})
export class BulkUploadComponent {
  selectedFile: File | null = null;
  uploading = false;
  uploadMessage = '';

  constructor(private productService: ProductService) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.uploadMessage = '';
  }

  onUpload(): void {
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }

    this.uploading = true;
    this.uploadMessage = 'Uploading...';

    this.productService.bulkUpload(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadMessage = `Upload started! Job ID: ${response.jobId}. Processing in background.`;
        this.uploading = false;
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.uploadMessage = 'Upload failed: ' + (err.error?.error || 'Unknown error');
        this.uploading = false;
      },
    });
  }

  downloadReport(format: 'csv' | 'xlsx'): void {
    this.productService.downloadReport(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download error:', err);
        alert('Failed to download report');
      },
    });
  }

  downloadSampleCSV(): void {
    const csv = 'name,price,categoryId,image\nSample Product,29.99,1,https://example.com/image.jpg';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_products.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
