import { Component,OnInit } from '@angular/core';
import { Category } from '../interface';
import { categoryService } from '../service/category/category.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';

interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Category> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<Category> | null;
  width?: string | number | null;
}

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],

})
export class CategoryComponent implements OnInit {
  category: Category[] = [];
  editCache: { [key: string]: { edit: boolean; data: Category } } = {};
  isAdding: boolean = false;
  newRow: Category= { _id: '', name: '' };
  listOfColumns: ColumnItem[] = [ 
    {
      name: 'Loại sản phẩm',
      sortOrder: null,
      sortFn: null,
      listOfFilter: [],
      filterFn: null,
      width: 'auto',
    },
    {
      name: 'Thao tác',
      sortOrder: null,
      sortFn: null,
      listOfFilter: [],
      filterFn: null
    }
  ];

  validateForm!: FormGroup;

  constructor(
    private api: categoryService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.getAllCategorys();
    this.initializeForm();
  }

  private initializeForm(): void {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Đảm bảo tên là bắt buộc và có độ dài tối thiểu
    });
  }

  // Lấy tất cả thương hiệu
  getAllCategorys(): void {
    this.api.getAllCategory().subscribe(
      (response) => {
        this.category = response.data;
        this.updateEditCache(); // Cập nhật lại editCache sau khi lấy dữ liệu
      },
      (error) => {
        this.message.error('Lỗi khi lấy danh sách loại sản phẩm');
        console.error('Lỗi khi lấy danh sách loại sản phẩm:', error);
      }
    );
  }

  // Cập nhật editCache khi dữ liệu thay đổi
  private updateEditCache(): void {
    this.category.forEach((category) => {
      if (!this.editCache[category._id]) {
        this.editCache[category._id] = {
          edit: false,
          data: { ...category },
        };
      }
    });
  }

  // Bắt đầu thêm dòng mới
  addNewRow(): void {
    this.isAdding = true;
    this.newRow = { 
      _id: '', // Khởi tạo với chuỗi rỗng thay vì null hoặc undefined
      name: '' 
    }; 
  }

  // Lưu thương hiệu mới
  saveNewRow(): void {
    // if (this.validateForm.invalid) {
    // this.message.error('Vui lòng nhập đầy đủ thông tin hợp lệ');
    // return;
    // }

    this.api.createCategory(this.newRow).subscribe(
    
      (response) => {
        this.category = [...this.category, response.data];  // Thêm thương hiệu mới vào danh sách
        this.message.success('Thêm loại sản phẩm thành công');
        this.isAdding = false;
        this.getAllCategorys();  // Làm mới danh sách
      },
      (error) => {
        this.message.error('Lỗi khi thêm loại sản phẩm');
        console.error('Lỗi khi thêm loại sản phẩm:', error);
      }
    );
  }

  // Hủy bỏ việc thêm thương hiệu
  cancelAdd(): void {
    this.isAdding = false;
  }

  // Xóa thương hiệu
  deleteCategory(id: string): void {
    this.api.deleteCategory(id).subscribe(
      () => {
        this.category = this.category.filter(category =>category._id !== id);
        this.message.success('Xóa loại sản phẩm thành công');
      },
      (error) => {
        this.message.error('Lỗi khi xóa loại sản phẩm');
        console.error('Lỗi khi xóa loại sản phẩm:', error);
      }
    );
  }

  // Bắt đầu chỉnh sửa thương hiệu
  startEdit(id: string): void {
    // Kiểm tra nếu thương hiệu đang có trong cache và không đang chỉnh sửa
    if (this.editCache[id] && !this.editCache[id].edit) {
      this.editCache[id].edit = true;  // Mở chế độ chỉnh sửa
    } else {
      console.error('Không thể chỉnh sửa loại sản phẩm, không có dữ liệu hoặc đang chỉnh sửa');
    }
  }

  // Lưu thay đổi khi chỉnh sửa thương hiệu
  saveEdit(id: string): void {
    const editedBrand = this.editCache[id].data;

    this.api.updateCategory(id, editedBrand).subscribe(
      (response) => {
        // Cập nhật thương hiệu trong danh sách
        this.category = this.category.map(category =>
          category._id === id ? response : category
        );
        this.message.success('Cập nhật loại sản phẩm thành công');
        this.cancelEdit(id);  // Đóng chế độ chỉnh sửa
      },
      (error) => {
        this.message.error('Lỗi khi cập nhật loại sản phẩm');
        console.error('Lỗi khi cập nhật loại sản phẩm:', error);
      }
    );
  }

  // Hủy bỏ chỉnh sửa thương hiệu
  cancelEdit(id: string): void {
    this.editCache[id].edit = false;  // Đóng chế độ chỉnh sửa
  }

  // Theo dõi sự thay đổi trong các dòng bảng (tối ưu hóa cho ngFor)
  trackByFn(index: number, item: Category): string {
    return item._id;
  }

  // Định nghĩa các phương thức còn thiếu
  cancelNewRow(): void {
    this.isAdding = false;
    this.newRow = { _id: '', name: '' };
  }

  selectRow(id: string): void {
    console.log('Đã chọn loại sản phẩm với ID:', id);
  }

  delete(id: string): void {
    this.deleteCategory(id);
  }
}