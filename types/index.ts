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

export type ApiKey = Database['public']['Tables']['api_keys']['Row']
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

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
  product_id?: string
  description: string
  quantity: number
  unit: string
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
  contact?: {
    name?: string
    phone?: string
    email?: string
  }
}

// Helper type for DNS record
export interface DnsRecord {
  type: string
  host: string
  value: string
  verified?: boolean
}

// Helper type for email settings (Postmark integration)
export interface EmailSettings {
  mode: 'default' | 'custom_domain'
  reply_to_email?: string
  reply_to_name?: string
  // Custom domain fields
  custom_domain?: string
  from_email?: string
  from_name?: string
  domain_verified?: boolean
  domain_verified_at?: string
  postmark_domain_id?: number
  dns_records?: {
    dkim?: DnsRecord
    return_path?: DnsRecord
  }
  // Invoice email template fields
  invoice_email_subject?: string
  invoice_email_body?: string
}

