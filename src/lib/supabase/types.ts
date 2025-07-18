export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      api_usage_logs: {
        Row: {
          created_at: string | null;
          id: string;
          ip_address: unknown;
          project_id: string;
          request_method: string;
          request_path: string;
          response_status: number;
          response_time_ms: number | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          ip_address?: unknown;
          project_id: string;
          request_method: string;
          request_path: string;
          response_status: number;
          response_time_ms?: number | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          ip_address?: unknown;
          project_id?: string;
          request_method?: string;
          request_path?: string;
          response_status?: number;
          response_time_ms?: number | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "api_usage_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      project_settings: {
        Row: {
          created_at: string | null;
          custom_headers: Json | null;
          enable_analytics: boolean | null;
          id: string;
          mock_data_count: number | null;
          project_id: string;
          rate_limit_per_minute: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          custom_headers?: Json | null;
          enable_analytics?: boolean | null;
          id?: string;
          mock_data_count?: number | null;
          project_id: string;
          rate_limit_per_minute?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          custom_headers?: Json | null;
          enable_analytics?: boolean | null;
          id?: string;
          mock_data_count?: number | null;
          project_id?: string;
          rate_limit_per_minute?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_settings_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string | null;
          description: string | null;
          endpoint_id: string;
          expected_status_codes: number[];
          expires_at: string;
          http_method: Database["public"]["Enums"]["http_method"];
          id: string;
          interface_code: string;
          name: string;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          endpoint_id: string;
          expected_status_codes?: number[];
          expires_at: string;
          http_method?: Database["public"]["Enums"]["http_method"];
          id?: string;
          interface_code: string;
          name: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          endpoint_id?: string;
          expected_status_codes?: number[];
          expires_at?: string;
          http_method?: Database["public"]["Enums"]["http_method"];
          id?: string;
          interface_code?: string;
          name?: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      cleanup_expired_projects: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      generate_endpoint_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      update_expired_projects: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      http_method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      project_status: "active" | "inactive" | "expired";
    };
    CompositeTypes: Record<never, never>;
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | keyof DefaultSchema["CompositeTypes"]
      | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      http_method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      project_status: ["active", "inactive", "expired"],
    },
  },
} as const;

// Derived types for easier use
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type ProjectSettings =
  Database["public"]["Tables"]["project_settings"]["Row"];
export type ProjectSettingsInsert =
  Database["public"]["Tables"]["project_settings"]["Insert"];
export type ProjectSettingsUpdate =
  Database["public"]["Tables"]["project_settings"]["Update"];

export type ApiUsageLog = Database["public"]["Tables"]["api_usage_logs"]["Row"];
export type ApiUsageLogInsert =
  Database["public"]["Tables"]["api_usage_logs"]["Insert"];
export type ApiUsageLogUpdate =
  Database["public"]["Tables"]["api_usage_logs"]["Update"];

export type HttpMethod = Database["public"]["Enums"]["http_method"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];

// Extended types with relations
export type ProjectWithSettings = Project & {
  project_settings?: ProjectSettings;
};

export type ProjectWithProfile = Project & {
  profiles: Profile;
};

export type FullProject = Project & {
  profiles: Profile;
  project_settings?: ProjectSettings;
};

// API request/response types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  interface_code: string;
  http_method?: HttpMethod;
  expected_status_codes?: number[];
  expiration_hours?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  interface_code?: string;
  http_method?: HttpMethod;
  expected_status_codes?: number[];
  expires_at?: string;
  status?: ProjectStatus;
}

export interface ProjectResponse {
  success: boolean;
  data?: Project | Project[];
  error?: string;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface MockDataResponse {
  success: boolean;
  data: unknown;
  timestamp: string;
  metadata?: {
    project_id: string;
    generated_count: number;
    interface_name?: string;
  };
}
