export interface VirtualPatch {
  id: string;
  orgId: string;
  vulnId: string;
  method: string;
  pathPattern: string;
  paramName: string | null;
  blockPattern: string;
  prId: string | null;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateVirtualPatchInput {
  orgId: string;
  vulnId: string;
  method: string;
  pathPattern: string;
  paramName?: string;
  blockPattern: string;
  prId?: string;
  expiresAt?: string;
}

export interface IRaspVirtualPatchRepository {
  create(patch: VirtualPatch): Promise<VirtualPatch>;
  listActive(orgId: string): Promise<VirtualPatch[]>;
  deactivate(id: string): Promise<boolean>;
}
