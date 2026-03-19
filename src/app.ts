import { RaspVirtualPatchController } from "./controller/RaspVirtualPatchController";
import { RaspVirtualPatchBL } from "./domain/RaspVirtualPatchBL";
import { RaspVirtualPatchD1 } from "./repositories/RaspVirtualPatchD1";
import { logger } from "./core/utils/logger";

export const index = async (event: any, env?: any) => {
  const repository = new RaspVirtualPatchD1(env!.DB_VIRTUAL_PATCHES);
  const bl = new RaspVirtualPatchBL(repository);
  const controller = new RaspVirtualPatchController(bl);

  logger.info("Incoming request", { path: event.path, method: event.httpMethod });
  return controller.handle(event);
};
