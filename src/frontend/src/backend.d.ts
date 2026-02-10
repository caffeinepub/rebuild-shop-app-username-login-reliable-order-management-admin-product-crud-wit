import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    status: ProductStatus;
    imageData?: string;
    name: string;
    category: Category;
    price: number;
}
export interface Purchase {
    username: string;
    productName: string;
    confirmed: boolean;
    price: number;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    normal = "normal",
    kostenlos = "kostenlos"
}
export enum ProductStatus {
    available = "available",
    soldOut = "soldOut"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptPurchase(purchaseIdToAccept: bigint): Promise<void>;
    addProduct(name: string, price: number, category: Category, imageData: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyProduct(productName: string): Promise<bigint>;
    declinePurchase(purchaseIdToDecline: bigint): Promise<void>;
    deleteConfirmedPurchase(purchaseIdToDelete: bigint): Promise<void>;
    deleteProduct(productName: string): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConfirmedPurchases(): Promise<Array<Purchase>>;
    getPendingPurchases(): Promise<Array<Purchase>>;
    getProduct(name: string): Promise<Product>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isBackendInitialized(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    login(username: string): Promise<UserRole>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
