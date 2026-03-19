import { VirtualPatch, CreateVirtualPatchInput } from "../repositories/IRaspVirtualPatchRepository";

export interface IRaspVirtualPatchBL {
  create(input: CreateVirtualPatchInput): Promise<VirtualPatch>;
  listActive(orgId: string): Promise<VirtualPatch[]>;
  deactivate(id: string): Promise<{ success: boolean }>;
}
