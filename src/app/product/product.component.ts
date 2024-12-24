import { Component, OnInit } from '@angular/core';
import { Product, Brand, Category } from '../interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProductService } from '../service/product/product.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { categoryService } from '../service/category/category.service';
import { BrandService } from '../service/brand/brand.service';

interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Product> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<Product> | null;
  width?: string | number | null;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  product: Product[] = [];
  editCache: { [key: string]: { edit: boolean; data: Product } } = {};
  isVisible = false;
  isOkLoading = false;
  imageFile: File | null = null;
  imageUrl: string = '';
  categories: Category[] = [];
  brands: Brand[] = [];
  categoryMap: { [key: string]: string } = {};
  brandMap: { [key: string]: string } = {};
  modalTitle: string = 'Thêm sản phẩm mới';
  isEditing: boolean = false;
  currentEditId: string = '';

  listOfColumns: ColumnItem[] = [
    {
      name: 'Tên sản phẩm',
      sortOrder: null,
      sortFn: (a: Product, b: Product) => a.name.localeCompare(b.name),
      listOfFilter: [],
      filterFn: null,
      width: 'auto',
    }
  ];

  validateForm!: FormGroup;

  constructor(
    private api: ProductService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalService: NzModalService,
    private categoryService: categoryService,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    this.getAllProduct();
    this.initializeForm();
    this.loadCategories();
    this.loadBrands();
  }

  private initializeForm(): void {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      brand: ['', Validators.required],
      image: ['', Validators.required]
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategory().subscribe(
      (response) => {
        this.categories = response.data;
        this.categories.forEach(category => {
          this.categoryMap[category._id] = category.name;
        });
      },
      (error) => {
        this.message.error('Lỗi khi tải danh mục sản phẩm');
        console.error('Error:', error);
      }
    );
  }
  
  loadBrands(): void {
    this.brandService.getAllBrands().subscribe(
      (response) => {
        this.brands = response.data;
        this.brands.forEach(brand => {
          this.brandMap[brand._id] = brand.name;
        });
      },
      (error) => {
        this.message.error('Lỗi khi tải thương hiệu');
        console.error('Error:', error);
      }
    );
  }

  showModal(product?: Product): void {
    this.isVisible = true;
    if (product) {
      this.isEditing = true;
      this.currentEditId = product._id;
      this.modalTitle = 'Chỉnh sửa sản phẩm';
      this.validateForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        brand: product.brand,
        image: product.image
      });
      this.imageUrl = `assets/img/${product.image}`;
    } else {
      this.isEditing = false;
      this.currentEditId = '';
      this.modalTitle = 'Thêm sản phẩm mới';
      this.validateForm.reset();
      this.imageUrl = '';
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset();
    this.imageUrl = '';
    this.isEditing = false;
    this.currentEditId = '';
  }

  handleImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const imagePath = file.name;
      this.validateForm.patchValue({
        image: imagePath
      });
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async handleOk(): Promise<void> {
    if (this.validateForm.valid) {
      this.isOkLoading = true;
      try {
        const productData = {
          name: this.validateForm.value.name,
          description: this.validateForm.value.description,
          price: this.validateForm.value.price,
          stock: this.validateForm.value.stock,
          category: this.validateForm.value.category,
          brand: this.validateForm.value.brand,
          image: this.validateForm.value.image,
          sold: this.isEditing ? undefined : 0
        };

        if (this.isEditing) {
          await this.api.updateProduct(this.currentEditId, productData).toPromise();
          this.message.success('Cập nhật sản phẩm thành công');
        } else {
          await this.api.createProduct(productData).toPromise();
          this.message.success('Thêm sản phẩm thành công');
        }
        
        this.isVisible = false;
        this.validateForm.reset();
        this.imageUrl = '';
        this.getAllProduct();
      } catch (error) {
        this.message.error(this.isEditing ? 'Có lỗi xảy ra khi cập nhật sản phẩm' : 'Có lỗi xảy ra khi thêm sản phẩm');
        console.error('Error:', error);
      } finally {
        this.isOkLoading = false;
      }
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  getAllProduct(): void {
    this.api.getAllProduct().subscribe(
      (response) => {
        this.product = response.data;
        this.updateEditCache();
      },
      (error) => {
        this.message.error('Lỗi khi lấy danh sách sản phẩm');
        console.error('Lỗi:', error);
      }
    );
  }

  private updateEditCache(): void {
    this.product.forEach((product) => {
      this.editCache[product._id] = {
        edit: false,
        data: { ...product }
      };
    });
  }
  deleteProduct(id: string): void {
    this.api.deleteProduct(id).subscribe(
      (response) => {
        this.message.success('Xóa sản phẩm thành công');
        this.getAllProduct(); // Refresh the product list
      },
      (error) => {
        this.message.error('Có lỗi xảy ra khi xóa sản phẩm');
        console.error('Error:', error);
      }
    );
  }

  startEdit(product: Product): void {
    this.showModal(product);
  }
  
  selectRow(id: string): void {
    console.log('Đã chọn sản phẩm với ID:', id);
  }

  trackByFn(index: number, item: Product): string {
    return item._id;
  }
}