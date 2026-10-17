"use client";

import { useAuthSession } from "@/app/components/_ui/auth/AuthProvider";
import { AclAction, canPerform, canPerformAny } from "@/app/lib/acl";

export function useAcl() {
  const session = useAuthSession();
  const permission = session.permission;

  return {
    ready: true,
    session,
    permission,
    can: (action: AclAction) => canPerform(permission, action),
    canAny: (actions: AclAction[]) => canPerformAny(permission, actions),
  };
}
