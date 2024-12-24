import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class categoryService {
  private catUrl = 'http://localhost:8080/api/category'; 

  constructor(private http: HttpClient) {}

  // Lấy tất cả các category
  getAllCategory(): Observable<any> {
    return this.http.get(`${this.catUrl}/get-all-category`);
  }

  // Lấy category theo filter (phân trang và tìm kiếm)
  getFilteredcategorys(page: number = 1, pageSize: number = 100, filterName?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filterName) {
      params = params.set('filterName', filterName);
    }

    return this.http.get(`${this.catUrl}/get-all`, { params });
  }

  // Lấy category theo ID
  getCategoryById(id: string): Observable<any> {
    return this.http.get(`${this.catUrl}/get-category/${id}`);
  }

  // Tạo category mới
  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.catUrl}/create-category`, category);
  }

  // Cập nhật category
  updateCategory(id: string, category: any): Observable<any> {
    return this.http.put(`${this.catUrl}/update-category/${id}`, category);
  }

  // Xóa category
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.catUrl}/delete-category/${id}`);
  }
}