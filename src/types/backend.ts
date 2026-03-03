// Map 1-1 với file ApiResponse.java
// <T> là Generic, nghĩa là "result" có thể là bất cứ kiểu gì (User, Product, List...)
export interface ApiResponse<T> {
    code: number;      // Backend: private int code = 1000;
    message?: string;   // Backend: private String message;
    result?: T;         // Backend: private T result;
}

// Map 1-1 với file UserResponse.java
export interface UserResponse {
    id: number;
    username: string;
    // roles?: string[]; // Sau này nếu backend trả về role thì bỏ comment dòng này
}

// Map 1-1 với file PageResponse.java (Dùng cho phân trang sau này)
export interface PageResponse<T> {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    data: T[]; // Danh sách dữ liệu (List Product, List Order...)
}

// Map với ProductResponse.java
export interface ProductResponse {
    id: number;
    code: string;
    name: string;
    description: string;
    price: number;     // BigDecimal bên Java về JS là number
    stockQuantity: number;
    image: string;
    categoryName: string;
}

// Category
export interface CategoryResponse {
    id: number;
    name: string;
    description: string;
}

export interface CategoryRequest {
    name: string;
    description: string;
}

// Cart
export interface CartItemResponse {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    price: number;      // BigDecimal -> number
    quantity: number;
    totalPrice: number; // BigDecimal -> number (Tổng tiền item này: price * quantity)
}

export interface CartItemRequest {
    productId: number;
    quantity: number;
}

// 2. Interface Giỏ hàng tổng
export interface CartResponse {
    id: number;
    totalAmount: number; // Tổng tiền cả giỏ
    items: CartItemResponse[];
}

// Orders
export interface OrderCreationRequest {
    customerName: string,
    phone: string,
    address: string,
    items: CartItemRequest[],
    discountCode: string,
}

export interface OrderDetailResponse {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    isDiscounted: boolean;
}

export interface OrderResponse {
    id: number;
    user: UserResponse;
    customerName: string;
    phone: string;
    address: string;
    totalAmount: number;
    discountAmount: number;
    status: string;
    createdAt: string;
    discountCode: string;
    orderDetails: OrderDetailResponse[];
}

// BANNER
export interface BannerResponse {
    id: number;
    imageUrl: string;
    linkUrl: string;
    priority: number;
    active: boolean;
}

// Discount
export interface Discount {
    id: number;
    code: string;
    description: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    scope: 'GLOBAL' | 'SPECIFIC_PRODUCT' | 'SPECIFIC_CATEGORY';
    applicableIds: string;
    usageLimit: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    minOrderValue: number;
    maxDiscountAmount?: number;
    active: boolean;
}

export interface DiscountCalculationResponse {
    totalDiscount: number;
    affectedProductIds: number[];
}
