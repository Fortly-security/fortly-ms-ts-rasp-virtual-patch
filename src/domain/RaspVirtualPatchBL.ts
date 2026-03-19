import { IRaspVirtualPatchBL } from "./IRaspVirtualPatchBL";
import { IRaspVirtualPatchRepository, VirtualPatch, CreateVirtualPatchInput } from "../repositories/IRaspVirtualPatchRepository";

export class RaspVirtualPatchBL implements IRaspVirtualPatchBL {
  private repository: IRaspVirtualPatchRepository;

  constructor(repository: IRaspVirtualPatchRepository) {
    this.repository = repository;
  }

  async create(input: CreateVirtualPatchInput): Promise<VirtualPatch> {
    if (!input.orgId || input.orgId.trim() === "") {
      throw new Error("orgId is required");
    }
    if (!input.vulnId || input.vulnId.trim() === "") {
      throw new Error("vulnId is required");
    }
    if (!input.method || input.method.trim() === "") {
      throw new Error("method is required");
    }
    if (!input.pathPattern || input.pathPattern.trim() === "") {
      throw new Error("pathPattern is required");
    }
    if (!input.blockPattern || input.blockPattern.trim() === "") {
      throw new Error("blockPattern is required");
    }

    const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    if (!validMethods.includes(input.method.toUpperCase())) {
      throw new Error(`method must be one of: ${validMethods.join(", ")}`);
    }

    const patch: VirtualPatch = {
      id: crypto.randomUUID(),
      orgId: input.orgId,
      vulnId: input.vulnId,
      method: input.method.toUpperCase(),
      pathPattern: input.pathPattern,
      paramName: input.paramName || null,
      blockPattern: input.blockPattern,
      prId: input.prId || null,
      active: true,
      expiresAt: input.expiresAt || null,
      createdAt: new Date().toISOString(),
    };

    return this.repository.create(patch);
  }

  async listActive(orgId: string): Promise<VirtualPatch[]> {
    if (!orgId || orgId.trim() === "") {
      throw new Error("orgId is required");
    }
    return this.repository.listActive(orgId);
  }

  async deactivate(id: string): Promise<{ success: boolean }> {
    if (!id || id.trim() === "") {
      throw new Error("id is required");
    }
    const result = await this.repository.deactivate(id);
    if (!result) {
      throw new Error("Virtual patch not found");
    }
    return { success: true };
  }
}
