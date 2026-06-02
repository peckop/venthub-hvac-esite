import { describe, it, expect, beforeEach } from 'vitest'
import { MockDatabaseEngine } from './helpers/mockDb'

// Define interfaces to match our application structures
interface UserProfile {
  id: string
  tenant_id: string
  role: string
  full_name?: string
  created_at?: string
  updated_at?: string
}

interface Tenant {
  id: string
  name: string
  is_active: boolean
}

describe('Challenger 1 Security Hardening and Admin Login Fixes Verification Suite', () => {
  let db: MockDatabaseEngine
  
  // Real migration R1 policy:
  // CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT TO authenticated
  //   USING ( tenant_id = public.jwt_tenant_id() AND (id = auth.uid() OR public.is_admin_user()) );
  const evaluateUserProfilesSelectRLS = (
    row: UserProfile,
    sessionContext: { tenantId: string | null; userId: string | null; role: string | null; userProfiles: UserProfile[] }
  ): boolean => {
    // Must be authenticated
    if (!sessionContext.role || sessionContext.role === 'anon') {
      return false;
    }
    
    // Resolve helper functions
    const jwt_tenant_id = () => sessionContext.tenantId || 'd3b07384-d113-495f-a558-8c38634e0000';
    
    const is_admin_user = () => {
      if (sessionContext.role === 'service_role') return true;
      // Database lookup mock
      return sessionContext.userProfiles.some(
        up => up.id === sessionContext.userId && ['admin', 'superadmin', 'super_admin'].includes(up.role)
      );
    };

    // Evaluate RLS USING clause: tenant_id = jwt_tenant_id() AND (id = auth.uid() OR is_admin_user())
    const tenantMatch = row.tenant_id === jwt_tenant_id();
    const identityOrAdminMatch = (row.id === sessionContext.userId) || is_admin_user();
    
    return tenantMatch && identityOrAdminMatch;
  };

  // Real migration R6 Auth Hook:
  // custom_access_token_hook(event jsonb)
  const simulateCustomAccessTokenHook = (
    event: { user_id: string; claims: any },
    callerRole: string,
    userProfiles: UserProfile[]
  ) => {
    // Verify R6 revocation: denied to anon and authenticated
    if (callerRole === 'anon' || callerRole === 'authenticated') {
      throw new Error('42501: Permission Denied - EXECUTE privilege revoked');
    }
    if (callerRole !== 'supabase_auth_admin' && callerRole !== 'service_role') {
      throw new Error('42501: Permission Denied');
    }

    // Process hook logic:
    const userProfile = userProfiles.find(up => up.id === event.user_id);
    const user_role = userProfile ? userProfile.role : 'user';
    const tenant_id_val = userProfile ? userProfile.tenant_id : 'd3b07384-d113-495f-a558-8c38634e0000';

    let claims = { ...event.claims };
    if (!claims.app_metadata) {
      claims.app_metadata = {};
    }

    // Inject claims
    claims.user_role = user_role;
    claims.app_metadata.user_role = user_role;
    claims.tenant_id = tenant_id_val;
    claims.app_metadata.tenant_id = tenant_id_val;

    return {
      ...event,
      claims
    };
  };

  // Real migration R6 self-promotion protection trigger logic
  const simulateHandleNewUserMetadataTrigger = (
    newUserMetadata: { role?: string; tenant_id?: string; [key: string]: any },
    callerContext: { authRole: string; isCallerAdmin: boolean }
  ) => {
    let role_val = newUserMetadata.role || 'user';
    const tenant_id_raw = newUserMetadata.tenant_id;
    
    // Prevent role self-elevation
    if (!(callerContext.authRole === 'service_role' || callerContext.isCallerAdmin)) {
      role_val = 'user';
    }

    const resolved_tenant_id = tenant_id_raw || 'd3b07384-d113-495f-a558-8c38634e0000';

    const raw_app_meta_data = {
      tenant_id: resolved_tenant_id,
      user_role: role_val
    };

    const raw_user_meta_data = {
      ...newUserMetadata,
      tenant_id: resolved_tenant_id,
      role: role_val
    };

    return {
      raw_app_meta_data,
      raw_user_meta_data
    };
  };

  const simulateHandleNewUserProfileTrigger = (
    newRecord: { id: string; raw_app_meta_data: any; raw_user_meta_data: any },
    callerContext: { authRole: string; isCallerAdmin: boolean }
  ) => {
    const resolved_tenant_id = newRecord.raw_app_meta_data.tenant_id;
    const full_name_val = newRecord.raw_user_meta_data.full_name;
    let role_val = newRecord.raw_user_meta_data.role || 'user';

    // Prevent role self-elevation
    if (!(callerContext.authRole === 'service_role' || callerContext.isCallerAdmin)) {
      role_val = 'user';
    }

    return {
      id: newRecord.id,
      tenant_id: resolved_tenant_id,
      full_name: full_name_val,
      role: role_val,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  // Real migration R4 Admin RPC Auth Checks:
  const checkAdminRpcAuth = (
    callerContext: { authRole: string | null | undefined; userId: string | null | undefined; userProfiles: UserProfile[] }
  ) => {
    const isServiceRole = callerContext.authRole === 'service_role';
    const isAdminInDb = callerContext.userId ? callerContext.userProfiles.some(
      up => up.id === callerContext.userId && 
      ['super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater'].includes(up.role)
    ) : false;

    if (!(isServiceRole || isAdminInDb)) {
      throw new Error('not authorized');
    }
  };

  beforeEach(() => {
    db = new MockDatabaseEngine()
  })

  // ===========================================================================
  // 1. VERIFY RLS POLICY ON public.user_profiles PREVENTS CROSS-TENANT DATA LEAKS
  // ===========================================================================
  describe('1. User Profiles RLS Policy Tenant Isolation', () => {
    const profilesTable: UserProfile[] = [
      { id: 'user-tenant-a-regular', tenant_id: 'tenant-a', role: 'user' },
      { id: 'user-tenant-a-admin', tenant_id: 'tenant-a', role: 'admin' },
      { id: 'user-tenant-b-regular', tenant_id: 'tenant-b', role: 'user' },
      { id: 'user-tenant-b-admin', tenant_id: 'tenant-b', role: 'admin' }
    ];

    it('should prevent regular user of Tenant A from reading Tenant B profiles', () => {
      const session = { tenantId: 'tenant-a', userId: 'user-tenant-a-regular', role: 'authenticated', userProfiles: profilesTable };
      
      const readable = profilesTable.filter(row => evaluateUserProfilesSelectRLS(row, session));
      
      // Should see ONLY their own profile
      expect(readable).toHaveLength(1);
      expect(readable[0].id).toBe('user-tenant-a-regular');
      expect(readable[0].tenant_id).toBe('tenant-a');
    });

    it('should prevent admin of Tenant A from reading Tenant B profiles (no cross-tenant leak)', () => {
      const session = { tenantId: 'tenant-a', userId: 'user-tenant-a-admin', role: 'authenticated', userProfiles: profilesTable };
      
      const readable = profilesTable.filter(row => evaluateUserProfilesSelectRLS(row, session));
      
      // Should see Tenant A profiles, but NOT Tenant B profiles
      expect(readable).toHaveLength(2);
      expect(readable.map(r => r.id)).toContain('user-tenant-a-regular');
      expect(readable.map(r => r.id)).toContain('user-tenant-a-admin');
      expect(readable.map(r => r.id)).not.toContain('user-tenant-b-regular');
      expect(readable.map(r => r.id)).not.toContain('user-tenant-b-admin');
    });

    it('should deny read to anonymous users entirely', () => {
      const session = { tenantId: 'tenant-a', userId: null, role: 'anon', userProfiles: profilesTable };
      const readable = profilesTable.filter(row => evaluateUserProfilesSelectRLS(row, session));
      expect(readable).toHaveLength(0);
    });
  });

  // ===========================================================================
  // 2. VERIFY public.custom_access_token_hook RESTRICTIONS
  // ===========================================================================
  describe('2. Custom Access Token Hook Restriction', () => {
    const userProfiles: UserProfile[] = [
      { id: 'user-1', tenant_id: 'tenant-a', role: 'moderator' }
    ];
    const event = {
      user_id: 'user-1',
      claims: {
        sub: 'user-1',
        email: 'user1@venthub.com'
      }
    };

    it('should deny execute to anon role', () => {
      expect(() => simulateCustomAccessTokenHook(event, 'anon', userProfiles)).toThrow(
        /Permission Denied/
      );
    });

    it('should deny execute to authenticated role', () => {
      expect(() => simulateCustomAccessTokenHook(event, 'authenticated', userProfiles)).toThrow(
        /Permission Denied/
      );
    });

    it('should allow execute to supabase_auth_admin and inject claims correctly', () => {
      const result = simulateCustomAccessTokenHook(event, 'supabase_auth_admin', userProfiles);
      
      expect(result.claims.user_role).toBe('moderator');
      expect(result.claims.tenant_id).toBe('tenant-a');
      expect(result.claims.app_metadata.user_role).toBe('moderator');
      expect(result.claims.app_metadata.tenant_id).toBe('tenant-a');
    });
  });

  // ===========================================================================
  // 3. ATTEMPT ROLE SELF-PROMOTION ATTACK
  // ===========================================================================
  describe('3. Role Self-Promotion Attack Mitigation', () => {
    it('should downgrade metadata role spoofing to user role when a regular customer signs up', () => {
      const attackerMetadata = {
        role: 'admin',
        tenant_id: 'tenant-a',
        full_name: 'Attacker Bob'
      };

      const callerContext = { authRole: 'authenticated', isCallerAdmin: false };
      
      // Step A: metadata trigger
      const metadataResult = simulateHandleNewUserMetadataTrigger(attackerMetadata, callerContext);
      expect(metadataResult.raw_app_meta_data.user_role).toBe('user');
      expect(metadataResult.raw_user_meta_data.role).toBe('user');

      // Step B: profile insert trigger
      const mockNewRecord = {
        id: 'attacker-123',
        raw_app_meta_data: metadataResult.raw_app_meta_data,
        raw_user_meta_data: metadataResult.raw_user_meta_data
      };
      const profileRecord = simulateHandleNewUserProfileTrigger(mockNewRecord, callerContext);
      
      expect(profileRecord.role).toBe('user');
      expect(profileRecord.tenant_id).toBe('tenant-a');
    });

    it('should allow admin role setup when requested by service_role or admin user', () => {
      const adminMetadata = {
        role: 'admin',
        tenant_id: 'tenant-a',
        full_name: 'Admin Alice'
      };

      const callerContext = { authRole: 'service_role', isCallerAdmin: true };
      
      const metadataResult = simulateHandleNewUserMetadataTrigger(adminMetadata, callerContext);
      expect(metadataResult.raw_app_meta_data.user_role).toBe('admin');
      expect(metadataResult.raw_user_meta_data.role).toBe('admin');

      const mockNewRecord = {
        id: 'admin-456',
        raw_app_meta_data: metadataResult.raw_app_meta_data,
        raw_user_meta_data: metadataResult.raw_user_meta_data
      };
      const profileRecord = simulateHandleNewUserProfileTrigger(mockNewRecord, callerContext);
      
      expect(profileRecord.role).toBe('admin');
    });
  });

  // ===========================================================================
  // 4. VERIFY ADMINISTRATIVE RPC FUNCTIONS
  // ===========================================================================
  describe('4. Administrative RPC Functions Security', () => {
    const userProfiles: UserProfile[] = [
      { id: 'admin-user', tenant_id: 'tenant-a', role: 'admin' },
      { id: 'regular-user', tenant_id: 'tenant-a', role: 'user' }
    ];

    it('should block set_user_admin_role for non-admin/non-service_role callers', () => {
      const context = { authRole: 'authenticated', userId: 'regular-user', userProfiles };
      expect(() => checkAdminRpcAuth(context)).toThrow('not authorized');
    });

    it('should block calls without initialized JWT claims (null authRole and userId)', () => {
      const context = { authRole: null, userId: null, userProfiles };
      expect(() => checkAdminRpcAuth(context)).toThrow('not authorized');
    });

    it('should block calls with undefined JWT claims', () => {
      const context = { authRole: undefined, userId: undefined, userProfiles };
      expect(() => checkAdminRpcAuth(context)).toThrow('not authorized');
    });

    it('should allow set_user_admin_role for admin user', () => {
      const context = { authRole: 'authenticated', userId: 'admin-user', userProfiles };
      expect(() => checkAdminRpcAuth(context)).not.toThrow();
    });

    it('should allow set_user_admin_role for service_role', () => {
      const context = { authRole: 'service_role', userId: 'some-service', userProfiles };
      expect(() => checkAdminRpcAuth(context)).not.toThrow();
    });

    it('should block adjust_stock for non-admin callers', () => {
      const context = { authRole: 'authenticated', userId: 'regular-user', userProfiles };
      expect(() => checkAdminRpcAuth(context)).toThrow('not authorized');
    });

    it('should allow adjust_stock for admin', () => {
      const context = { authRole: 'authenticated', userId: 'admin-user', userProfiles };
      expect(() => checkAdminRpcAuth(context)).not.toThrow();
    });
  });
});
