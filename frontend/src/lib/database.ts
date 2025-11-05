// Database service - Client-side interface for database operations
import type { Database } from '@/types/database';

// Client-side query function that calls API endpoints
export async function query(text: string, params?: any[]): Promise<any> {
  try {
    const response = await fetch('/api/database/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: text, params }),
    });

    if (!response.ok) {
      throw new Error(`Database query failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Client-side database query error:', error);
    throw error;
  }
}

// Type helpers
type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type TableRow<T extends TableName> = Tables[T]['Row'];
type TableInsert<T extends TableName> = Tables[T]['Insert'];
type TableUpdate<T extends TableName> = Tables[T]['Update'];

// Database client class - Client-side interface
export class DatabaseClient {
  // Generic table access - calls API endpoints
  from<T extends TableName>(table: T) {
    return new TableQueryBuilder(table);
  }

  // Direct query access - calls API endpoint
  async query(sql: string, params?: any[]) {
    const response = await fetch('/api/database/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sql, params }),
    });
    
    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Transaction support - server-side only
  async transaction(callback: (client: any) => Promise<any>) {
    throw new Error('Transactions should be handled server-side only');
  }

  // Auth methods (placeholder - implement based on your auth system)
  auth = {
    getUser: async () => {
      // Implement your user authentication logic
      return { data: { user: null }, error: null };
    },
    signIn: async (credentials: any) => {
      // Implement sign in logic
      return { data: null, error: null };
    },
    signOut: async () => {
      // Implement sign out logic
      return { error: null };
    },
    signUp: async (credentials: any) => {
      // Implement sign up logic
      return { data: null, error: null };
    }
  };
}

// Simple query builder for client-side
class TableQueryBuilder {
  constructor(private tableName: string) {}

  async select(fields: string = '*') {
    const response = await fetch(`/api/database/${this.tableName}?fields=${fields}`);
    if (!response.ok) throw new Error(`Failed to fetch ${this.tableName}`);
    return await response.json();
  }

  async insert(data: Record<string, any>) {
    const response = await fetch(`/api/database/${this.tableName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to insert into ${this.tableName}`);
    return await response.json();
  }

  async update(data: Record<string, any>) {
    const response = await fetch(`/api/database/${this.tableName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update ${this.tableName}`);
    return await response.json();
  }

  async delete() {
    const response = await fetch(`/api/database/${this.tableName}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete from ${this.tableName}`);
    return await response.json();
  }
}

// Create and export database client instance
export const db = new DatabaseClient();

// Export for backward compatibility
export default db;