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
          endpoint_id: string;
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
          endpoint_id: string;
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
          endpoint_id?: string;
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
            foreignKeyName: "api_usage_logs_endpoint_id_fkey";
            columns: ["endpoint_id"];
            isOneToOne: false;
            referencedRelation: "endpoints";
            referencedColumns: ["id"];
          },
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
      endpoint_settings: {
        Row: {
          created_at: string | null;
          custom_headers: Json | null;
          enable_analytics: boolean | null;
          endpoint_id: string;
          id: string;
          mock_data_count: number | null;
          rate_limit_per_minute: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          custom_headers?: Json | null;
          enable_analytics?: boolean | null;
          endpoint_id: string;
          id?: string;
          mock_data_count?: number | null;
          rate_limit_per_minute?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          custom_headers?: Json | null;
          enable_analytics?: boolean | null;
          endpoint_id?: string;
          id?: string;
          mock_data_count?: number | null;
          rate_limit_per_minute?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "endpoint_settings_endpoint_id_fkey";
            columns: ["endpoint_id"];
            isOneToOne: true;
            referencedRelation: "endpoints";
            referencedColumns: ["id"];
          },
        ];
      };
      endpoints: {
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
          project_id: string;
          status: Database["public"]["Enums"]["endpoint_status"];
          updated_at: string | null;
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
          project_id: string;
          status?: Database["public"]["Enums"]["endpoint_status"];
          updated_at?: string | null;
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
          project_id?: string;
          status?: Database["public"]["Enums"]["endpoint_status"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "endpoints_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
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
      projects: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
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
    Views: {
      project_stats: {
        Row: {
          active_endpoints: number | null;
          expired_endpoints: number | null;
          inactive_endpoints: number | null;
          last_endpoint_created: string | null;
          project_created_at: string | null;
          project_id: string | null;
          project_name: string | null;
          project_updated_at: string | null;
          total_endpoints: number | null;
          user_id: string | null;
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
    Functions: {
      cleanup_expired_endpoints: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      generate_endpoint_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      update_expired_endpoints: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      endpoint_status: "active" | "inactive" | "expired";
      http_method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      project_status: "active" | "inactive" | "archived";
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
      endpoint_status: ["active", "inactive", "expired"],
      http_method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      project_status: ["active", "inactive", "archived"],
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

export type Endpoint = Database["public"]["Tables"]["endpoints"]["Row"];
export type EndpointInsert = Database["public"]["Tables"]["endpoints"]["Insert"];
export type EndpointUpdate = Database["public"]["Tables"]["endpoints"]["Update"];

export type EndpointSettings = Database["public"]["Tables"]["endpoint_settings"]["Row"];
export type EndpointSettingsInsert = Database["public"]["Tables"]["endpoint_settings"]["Insert"];
export type EndpointSettingsUpdate = Database["public"]["Tables"]["endpoint_settings"]["Update"];

export type ApiUsageLog = Database["public"]["Tables"]["api_usage_logs"]["Row"];
export type ApiUsageLogInsert = Database["public"]["Tables"]["api_usage_logs"]["Insert"];
export type ApiUsageLogUpdate = Database["public"]["Tables"]["api_usage_logs"]["Update"];

export type ProjectStats = Database["public"]["Views"]["project_stats"]["Row"];

export type HttpMethod = Database["public"]["Enums"]["http_method"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type EndpointStatus = Database["public"]["Enums"]["endpoint_status"];

// Extended types with relations
export type ProjectWithEndpoints = Project & {
  endpoints: Endpoint[];
};

export type ProjectWithStats = Project & {
  stats: {
    total_endpoints: number;
    active_endpoints: number;
    expired_endpoints: number;
    inactive_endpoints: number;
  };
};

export type EndpointWithSettings = Endpoint & {
  endpoint_settings?: EndpointSettings;
};

export type ProjectWithProfile = Project & {
  profiles: Profile;
};

export type FullProject = Project & {
  profiles: Profile;
  endpoints: EndpointWithSettings[];
};

// API request/response types
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface CreateEndpointRequest {
  project_id: string;
  name: string;
  description?: string;
  interface_code: string;
  http_method?: HttpMethod;
  expected_status_codes?: number[];
  expiration_hours?: number;
}

export interface UpdateEndpointRequest {
  name?: string;
  description?: string;
  interface_code?: string;
  http_method?: HttpMethod;
  expected_status_codes?: number[];
  expires_at?: string;
  status?: EndpointStatus;
}

export interface ProjectResponse {
  success: boolean;
  data?: Project | Project[];
  error?: string;
  timestamp: string;
}

export interface EndpointResponse {
  success: boolean;
  data?: Endpoint | Endpoint[];
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
    endpoint_id: string;
    project_id: string;
    generated_count: number;
    interface_name?: string;
  };
}

// Statistics and analytics types
export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  archived_projects: number;
  total_endpoints: number;
  active_endpoints: number;
  expired_endpoints: number;
  inactive_endpoints: number;
  total_api_calls: number;
  api_calls_today: number;
}

export interface ProjectListResponse {
  projects: ProjectWithStats[];
  stats: DashboardStats;
}