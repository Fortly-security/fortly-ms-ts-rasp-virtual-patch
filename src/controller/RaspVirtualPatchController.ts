import { IRaspVirtualPatchBL } from "../domain/IRaspVirtualPatchBL";
import { ResponseWriter } from "../core/common/ResponseWriter";
import { logger } from "../core/utils/logger";

export class RaspVirtualPatchController {
  private bl: IRaspVirtualPatchBL;

  constructor(bl: IRaspVirtualPatchBL) {
    this.bl = bl;
  }

  async handle(event: any) {
    const method = event.httpMethod;

    if (method === "OPTIONS") {
      return ResponseWriter.success({});
    }

    try {
      switch (method) {
        case "POST":
          return await this.handleCreate(event);
        case "GET":
          return await this.handleList(event);
        case "DELETE":
          return await this.handleDelete(event);
        default:
          return ResponseWriter.error("Method not allowed", 405);
      }
    } catch (error: any) {
      logger.error("Controller error", { error: error.message });
      return ResponseWriter.error(error.message, 400);
    }
  }

  private async handleCreate(event: any) {
    if (!event.body) {
      return ResponseWriter.badRequest("Request body is required");
    }

    const body = JSON.parse(event.body);
    const result = await this.bl.create(body);
    return ResponseWriter.created(result as any);
  }

  private async handleList(event: any) {
    const orgId = event.queryStringParameters?.orgId;
    if (!orgId) {
      return ResponseWriter.badRequest("orgId query parameter is required");
    }

    const patches = await this.bl.listActive(orgId);
    return ResponseWriter.success({ patches } as any);
  }

  private async handleDelete(event: any) {
    const id = event.pathParameters?.id;
    if (!id) {
      return ResponseWriter.badRequest("id path parameter is required");
    }

    const result = await this.bl.deactivate(id);
    return ResponseWriter.success(result as any);
  }
}
