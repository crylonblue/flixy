import { Database } from './database'

export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type CompanyUser = Database['public']['Tables']['company_users']['Row']
export type CompanyUserInsert = Database['public']['Tables']['company_users']['Insert']
export type CompanyUserUpdate = Database['public']['Tables']['company_users']['Update']

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

// Helper types for address
export interface Address {
  street: string
  streetnumber: string
  city: string
  zip: string
  country: string
}

// Helper types for line items
export interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  vat_rate: number
  total: number
}

// Helper type for customer snapshot
export interface CustomerSnapshot {
  id?: string
  name: string
  address: Address
  email?: string
  vat_id?: string
}

// Helper type for issuer/company snapshot
export interface IssuerSnapshot {
  name: string
  address: Address
  vat_id?: string
  tax_id?: string
  bank_details?: {
    bank_name?: string
    iban?: string
    bic?: string
    account_holder?: string
  }
}

