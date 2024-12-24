export interface Brand {
    _id: string; 
    name: string; 
  }
export interface Category {
    _id: string; 
    name: string;
}
export interface Product {
    _id: string; 
    name: string;
    description: string;
    price: number;
    stock: number;
    sold: number;
    category: string;
    brand: string;
    image: string;
  }