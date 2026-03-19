import { IRaspVirtualPatchRepository, VirtualPatch } from "./IRaspVirtualPatchRepository";

export class RaspVirtualPatchD1 implements IRaspVirtualPatchRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async create(patch: VirtualPatch): Promise<VirtualPatch> {
    await this.db
      .prepare(
        `INSERT INTO virtual_patches (id, org_id, vuln_id, method, path_pattern, param_name, block_pattern, pr_id, active, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .bind(
        patch.id,
        patch.orgId,
        patch.vulnId,
        patch.method,
        patch.pathPattern,
        patch.paramName,
        patch.blockPattern,
        patch.prId,
        patch.active ? 1 : 0,
        patch.expiresAt
      )
      .run();

    return patch;
  }

  async listActive(orgId: string): Promise<VirtualPatch[]> {
    const result = await this.db
      .prepare(
        `SELECT id, org_id as orgId, vuln_id as vulnId, method, path_pattern as pathPattern,
                param_name as paramName, block_pattern as blockPattern, pr_id as prId,
                active, expires_at as expiresAt, created_at as createdAt
         FROM virtual_patches
         WHERE org_id = ? AND active = 1`
      )
      .bind(orgId)
      .all();

    return (result?.results ?? []).map((r: any) => ({
      ...r,
      active: r.active === 1,
    }));
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.db
      .prepare(`UPDATE virtual_patches SET active = 0 WHERE id = ?`)
      .bind(id)
      .run();

    return result?.meta?.changes > 0;
  }
}
