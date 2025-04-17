import { supabase } from "./supabase-client"
import type { PostgrestError } from "@supabase/supabase-js"

export interface DatabaseResponse<T> {
  data: T | null
  error: PostgrestError | Error | null
}

export const databaseService = {
  // Generic fetch function
  async fetch<T>(
    table: string,
    query?: {
      select?: string
      eq?: [string, any][]
      order?: [string, { ascending: boolean }]
      limit?: number
      single?: boolean
    },
  ): Promise<DatabaseResponse<T>> {
    try {
      let queryBuilder = supabase.from(table).select(query?.select || "*")

      // Apply equality filters
      if (query?.eq) {
        for (const [column, value] of query.eq) {
          queryBuilder = queryBuilder.eq(column, value)
        }
      }

      // Apply ordering
      if (query?.order) {
        for (const [column, options] of query.order) {
          queryBuilder = queryBuilder.order(column, options)
        }
      }

      // Apply limit
      if (query?.limit) {
        queryBuilder = queryBuilder.limit(query.limit)
      }

      // Get single result if requested
      if (query?.single) {
        const { data, error } = await queryBuilder.single()
        return { data, error }
      } else {
        const { data, error } = await queryBuilder
        return { data, error }
      }
    } catch (error) {
      console.error(`Error fetching from ${table}:`, error)
      return { data: null, error: error as Error }
    }
  },

  // Generic insert function
  async insert<T>(table: string, data: any): Promise<DatabaseResponse<T>> {
    try {
      const { data: result, error } = await supabase.from(table).insert(data).select()
      return { data: result as T, error }
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error)
      return { data: null, error: error as Error }
    }
  },

  // Generic update function
  async update<T>(table: string, id: string, data: any, idColumn = "id"): Promise<DatabaseResponse<T>> {
    try {
      const { data: result, error } = await supabase.from(table).update(data).eq(idColumn, id).select()
      return { data: result as T, error }
    } catch (error) {
      console.error(`Error updating ${table}:`, error)
      return { data: null, error: error as Error }
    }
  },

  // Generic delete function
  async delete(table: string, id: string, idColumn = "id"): Promise<DatabaseResponse<null>> {
    try {
      const { error } = await supabase.from(table).delete().eq(idColumn, id)
      return { data: null, error }
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error)
      return { data: null, error: error as Error }
    }
  },

  // Execute RPC function
  async rpc<T>(functionName: string, params: any): Promise<DatabaseResponse<T>> {
    try {
      const { data, error } = await supabase.rpc(functionName, params)
      return { data, error }
    } catch (error) {
      console.error(`Error executing RPC ${functionName}:`, error)
      return { data: null, error: error as Error }
    }
  },
}
