import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private proUrl = 'http://localhost:8080/api/product'; 
  constructor(private http: HttpClient) {}
  //lay tat ca san pham
  getAllProduct(): Observable<any> {
    return this.http.get(`${this.proUrl}/get-all-product`);
  }
  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.proUrl}/create-product`, product);
  }
  

  
  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put(`${this.proUrl}/update-product/${id}`, product);
  }

  
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.proUrl}/delete-product/${id}`);
  }
}
