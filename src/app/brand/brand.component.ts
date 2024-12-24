import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Brand } from '../interface';
import { BrandService } from '../service/brand/brand.service';

interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Brand> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<Brand> | null;
  width?: string | number | null;
}

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.css'],
})
export class BrandComponent implements OnInit {
  brands: Brand[] = [];
  editCache: { [key: string]: { edit: boolean; data: Brand } } = {};
  isAdding: boolean = false;
  newRow: Brand = { _id: '', name: '' };
  listOfColumns: ColumnItem[] = [
    {
      name: 'Tên thương hiệu',
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
    private api: BrandService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.getAllBrands();
    this.initializeForm();
  }

  private initializeForm(): void {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Đảm bảo tên là bắt buộc và có độ dài tối thiểu
    });
  }

  // Lấy tất cả thương hiệu
  getAllBrands(): void {
    this.api.getAllBrands().subscribe(
      (response) => {
        this.brands = response.data;
        this.updateEditCache(); // Cập nhật lại editCache sau khi lấy dữ liệu
      },
      (error) => {
        this.message.error('Lỗi khi lấy danh sách thương hiệu');
        console.error('Lỗi khi lấy danh sách thương hiệu:', error);
      }
    );
  }

  // Cập nhật editCache khi dữ liệu thay đổi
  private updateEditCache(): void {
    this.brands.forEach((brand) => {
      if (!this.editCache[brand._id]) {
        this.editCache[brand._id] = {
          edit: false,
          data: { ...brand },
        };
      }
    });
  }

  // Bắt đầu thêm dòng mới
  addNewRow(): void {
    this.isAdding = true;
    this.newRow = { 
      _id: '', 
      name: '' 
    }; 
  }

  // Lưu thương hiệu mới
  saveNewRow(): void {
    // if (this.validateForm.invalid) {
    // this.message.error('Vui lòng nhập đầy đủ thông tin hợp lệ');
    // return;
    // }

    this.api.createBrand(this.newRow).subscribe(
    
      (response) => {
        this.brands = [...this.brands, response.data];  // Thêm thương hiệu mới vào danh sách
        this.message.success('Thêm thương hiệu thành công');
        this.isAdding = false;
        this.getAllBrands();  // Làm mới danh sách
      },
      (error) => {
        this.message.error('Lỗi khi thêm thương hiệu');
        console.error('Lỗi khi thêm thương hiệu:', error);
      }
    );
  }

  // Hủy bỏ việc thêm thương hiệu
  cancelAdd(): void {
    this.isAdding = false;
  }

  // Xóa thương hiệu
  deleteBrand(id: string): void {
    this.api.deleteBrand(id).subscribe(
      () => {
        this.brands = this.brands.filter(brand => brand._id !== id);
        this.message.success('Xóa thương hiệu thành công');
      },
      (error) => {
        this.message.error('Lỗi khi xóa thương hiệu');
        console.error('Lỗi khi xóa thương hiệu:', error);
      }
    );
  }

  // Bắt đầu chỉnh sửa thương hiệu
  startEdit(id: string): void {
    // Kiểm tra nếu thương hiệu đang có trong cache và không đang chỉnh sửa
    if (this.editCache[id] && !this.editCache[id].edit) {
      this.editCache[id].edit = true;  // Mở chế độ chỉnh sửa
    } else {
      console.error('Không thể chỉnh sửa thương hiệu, không có dữ liệu hoặc đang chỉnh sửa');
    }
  }

  // Lưu thay đổi khi chỉnh sửa thương hiệu
  saveEdit(id: string): void {
    const editedBrand = this.editCache[id].data;

    this.api.updateBrand(id, editedBrand).subscribe(
      (response) => {
        // Cập nhật thương hiệu trong danh sách
        this.brands = this.brands.map(brand =>
          brand._id === id ? response : brand
        );
        this.message.success('Cập nhật thương hiệu thành công');
        this.cancelEdit(id);  // Đóng chế độ chỉnh sửa
      },
      (error) => {
        this.message.error('Lỗi khi cập nhật thương hiệu');
        console.error('Lỗi khi cập nhật thương hiệu:', error);
      }
    );
  }

  // Hủy bỏ chỉnh sửa thương hiệu
  cancelEdit(id: string): void {
    this.editCache[id].edit = false;  // Đóng chế độ chỉnh sửa
  }

  // Theo dõi sự thay đổi trong các dòng bảng (tối ưu hóa cho ngFor)
  trackByFn(index: number, item: Brand): string {
    return item._id;
  }

  // Định nghĩa các phương thức còn thiếu
  cancelNewRow(): void {
    this.isAdding = false;
    this.newRow = { _id: '', name: '' };
  }

  selectRow(id: string): void {
    console.log('Đã chọn thương hiệu với ID:', id);
  }

  delete(id: string): void {
    this.deleteBrand(id);
  }
}