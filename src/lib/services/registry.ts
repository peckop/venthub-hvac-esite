import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'
import type { TablesInsert } from '@/types/database.types'
import type { DbUserAddressInsert, DbUserAddressUpdate } from '@/types/db-rows'
import type { DbInvoiceProfileInsert, DbInvoiceProfileUpdate } from '@/types/db-rows'
import type { Product } from '@/types/ui-models'

import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress} from './address.service'
import {
  clearCartItems,
  getOrCreateShoppingCart,
  listCartItems,
  listCartItemsWithProducts,
  removeCartItem,
  upsertCartItem} from './cart.service'
import { getCategories } from './category.service'
import {
  createInvoiceProfile,
  deleteInvoiceProfile,
  fetchDefaultInvoiceProfile,
  listInvoiceProfiles,
  setDefaultInvoiceProfile,
  updateInvoiceProfile} from './invoice.service'
import {
  getEffectivePriceInfo,
  getEffectiveUnitPrice} from './pricing.service'
import {
  adminSearchProducts,
  ftsSearchProducts,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  getProductBySlugOrId,
  getProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  getSearchSuggestions} from './product.service'
import {
  addProductToProject,
  createProject,
  deleteProject,
  listProjectItems,
  listUserProjects,
  removeProductFromProject} from './project.service'

export class AddressService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listAddresses() {
    return listAddresses(this.supabase)
  }

  async createAddress(payload: DbUserAddressInsert) {
    return createAddress(this.supabase, payload)
  }

  async updateAddress(id: string, payload: DbUserAddressUpdate) {
    return updateAddress(this.supabase, id, payload)
  }

  async deleteAddress(id: string) {
    return deleteAddress(this.supabase, id)
  }

  async setDefaultAddress(kind: 'shipping' | 'billing', id: string) {
    return setDefaultAddress(this.supabase, kind, id)
  }
}

export class CartService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getOrCreateShoppingCart(userId: string) {
    return getOrCreateShoppingCart(this.supabase, userId)
  }

  async listCartItems(cartId: string) {
    return listCartItems(this.supabase, cartId)
  }

  async listCartItemsWithProducts(cartId: string) {
    return listCartItemsWithProducts(this.supabase, cartId)
  }

  async upsertCartItem(payload: { cartId: string; _productId: string; quantity: number; unitPrice?: number; priceListId?: string }) {
    return upsertCartItem(this.supabase, payload)
  }

  async removeCartItem(cartId: string, productId: string) {
    return removeCartItem(this.supabase, cartId, productId)
  }

  async clearCartItems(cartId: string) {
    return clearCartItems(this.supabase, cartId)
  }
}

export class CategoryService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getCategories() {
    return getCategories(this.supabase)
  }
}

export class InvoiceService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listInvoiceProfiles() {
    return listInvoiceProfiles(this.supabase)
  }

  async createInvoiceProfile(payload: DbInvoiceProfileInsert) {
    return createInvoiceProfile(this.supabase, payload)
  }

  async updateInvoiceProfile(id: string, payload: DbInvoiceProfileUpdate) {
    return updateInvoiceProfile(this.supabase, id, payload)
  }

  async deleteInvoiceProfile(id: string) {
    return deleteInvoiceProfile(this.supabase, id)
  }

  async setDefaultInvoiceProfile(id: string) {
    return setDefaultInvoiceProfile(this.supabase, id)
  }

  async fetchDefaultInvoiceProfile() {
    return fetchDefaultInvoiceProfile(this.supabase)
  }
}

export class PricingService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getEffectiveUnitPrice(product: Product) {
    return getEffectiveUnitPrice(this.supabase, product)
  }

  async getEffectivePriceInfo(product: Product) {
    return getEffectivePriceInfo(this.supabase, product)
  }
}

export class ProductService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getSearchSuggestions(query: string, limit?: number) {
    return getSearchSuggestions(this.supabase, query, limit)
  }

  async ftsSearchProducts(term: string, limit?: number) {
    return ftsSearchProducts(this.supabase, term, limit)
  }

  async getProducts(limit?: number) {
    return getProducts(this.supabase, limit)
  }

  async getAllProducts() {
    return getAllProducts(this.supabase)
  }

  async getProductsByCategory(categoryId: string) {
    return getProductsByCategory(this.supabase, categoryId)
  }

  async getProductsBySubcategory(subcategoryId: string) {
    return getProductsBySubcategory(this.supabase, subcategoryId)
  }

  async getProductById(id: string) {
    return getProductById(this.supabase, id)
  }

  async getProductBySlugOrId(identifier: string) {
    return getProductBySlugOrId(this.supabase, identifier)
  }

  async getProductBySlug(slug: string) {
    return getProductBySlug(this.supabase, slug)
  }

  async getFeaturedProducts() {
    return getFeaturedProducts(this.supabase)
  }

  async adminSearchProducts(query: string) {
    return adminSearchProducts(this.supabase, query)
  }
}

export class ProjectService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async listUserProjects() {
    return listUserProjects(this.supabase)
  }

  async createProject(project: TablesInsert<'user_projects'>) {
    return createProject(this.supabase, project)
  }

  async deleteProject(id: string) {
    return deleteProject(this.supabase, id)
  }

  async addProductToProject(projectId: string, productId: string, quantity?: number) {
    return addProductToProject(this.supabase, projectId, productId, quantity)
  }

  async removeProductFromProject(projectId: string, productId: string) {
    return removeProductFromProject(this.supabase, projectId, productId)
  }

  async listProjectItems(projectId: string) {
    return listProjectItems(this.supabase, projectId)
  }
}

export class ServiceRegistry {
  public readonly address: AddressService
  public readonly cart: CartService
  public readonly category: CategoryService
  public readonly invoice: InvoiceService
  public readonly pricing: PricingService
  public readonly product: ProductService
  public readonly project: ProjectService

  constructor(private supabase: SupabaseClient<Database>) {
    this.address = new AddressService(this.supabase)
    this.cart = new CartService(this.supabase)
    this.category = new CategoryService(this.supabase)
    this.invoice = new InvoiceService(this.supabase)
    this.pricing = new PricingService(this.supabase)
    this.product = new ProductService(this.supabase)
    this.project = new ProjectService(this.supabase)
  }
}
