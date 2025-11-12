// Re-export the generated Supabase types
export type { Json } from "./database.types";
import type { Database as GeneratedDatabase } from "./database.types";

// Merge Tables and Views for easier access
export type Database = {
  public: {
    Tables: GeneratedDatabase["public"]["Tables"] & GeneratedDatabase["public"]["Views"];
    Views: GeneratedDatabase["public"]["Views"];
    Functions: GeneratedDatabase["public"]["Functions"];
    Enums: GeneratedDatabase["public"]["Enums"];
    CompositeTypes: GeneratedDatabase["public"]["CompositeTypes"];
  };
};

// Helper types for table operations
type PublicSchema = Database["public"];

export type Tables<
  TableName extends keyof PublicSchema["Tables"],
  Table = PublicSchema["Tables"][TableName],
> = Table extends {
  Row: infer Row;
}
  ? Row
  : never;

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"],
  Table = PublicSchema["Tables"][TableName],
> = Table extends {
  Insert: infer Insert;
}
  ? Insert
  : never;

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"],
  Table = PublicSchema["Tables"][TableName],
> = Table extends {
  Update: infer Update;
}
  ? Update
  : never;
