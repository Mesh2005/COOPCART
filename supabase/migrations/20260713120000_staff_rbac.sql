-- ===========================================================================
-- Staff RBAC
-- Managers (not only admins) may change staff roles from the console — except
-- the admin role itself, which stays admin-only to prevent privilege
-- escalation. This relaxes guard_profile_role, which previously allowed role
-- changes for admins only.
--
-- The application already gates the Staff & roles page + its actions to
-- admin/manager (see src/lib/rbac.ts); this keeps the database in agreement.
-- ===========================================================================

create or replace function guard_profile_role() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role then
    if not has_role(array['admin', 'manager']::user_role[]) then
      raise exception 'Only managers and admins can change a user role';
    end if;
    -- Only an admin may assign, change, or remove the admin role.
    if (new.role = 'admin' or old.role = 'admin') and not is_admin() then
      raise exception 'Only an admin can assign or remove the admin role';
    end if;
  end if;
  return new;
end;
$$;

-- The trigger profiles_guard_role already calls guard_profile_role(); replacing
-- the function above updates its behaviour in place.
