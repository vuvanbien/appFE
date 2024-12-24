import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private baseUrl = 'http://localhost:8080/api/brand'; 

  constructor(private http: HttpClient) {}

  // Lấy tất cả các brand
  getAllBrands(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-all-brand`);
  }

  // Lấy brand theo filter (phân trang và tìm kiếm)
  getFilteredBrands(page: number = 1, pageSize: number = 100, filterName?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filterName) {
      params = params.set('filterName', filterName);
    }

    return this.http.get(`${this.baseUrl}/get-all`, { params });
  }

  // Lấy brand theo ID
  getBrandById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-brand/${id}`);
  }

  // Tạo brand mới
  createBrand(brand: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-brand`, brand);
  }

  // Cập nhật brand
  updateBrand(id: string, brand: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-brand/${id}`, brand);
  }

  // Xóa brand
  deleteBrand(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-brand/${id}`);
  }
}