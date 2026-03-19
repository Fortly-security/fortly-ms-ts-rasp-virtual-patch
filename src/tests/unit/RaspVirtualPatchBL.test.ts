import { RaspVirtualPatchBL } from "../../domain/RaspVirtualPatchBL";
import { IRaspVirtualPatchRepository, VirtualPatch, CreateVirtualPatchInput } from "../../repositories/IRaspVirtualPatchRepository";

// Mock crypto.randomUUID
const mockUUID = "test-uuid-5678";
(global as any).crypto = {
  randomUUID: jest.fn(() => mockUUID),
};

const mockRepository: jest.Mocked<IRaspVirtualPatchRepository> = {
  create: jest.fn(),
  listActive: jest.fn(),
  deactivate: jest.fn(),
};

describe("RaspVirtualPatchBL", () => {
  let bl: RaspVirtualPatchBL;

  beforeEach(() => {
    bl = new RaspVirtualPatchBL(mockRepository);
    jest.clearAllMocks();
  });

  const validInput: CreateVirtualPatchInput = {
    orgId: "org-123",
    vulnId: "CVE-2024-001",
    method: "POST",
    pathPattern: "/api/users",
    paramName: "email",
    blockPattern: ".*<script>.*",
    prId: "PR-42",
    expiresAt: "2025-12-31T23:59:59Z",
  };

  describe("create", () => {
    it("should create a virtual patch with all fields", async () => {
      mockRepository.create.mockImplementation(async (p) => p);

      const result = await bl.create(validInput);

      expect(result.id).toBe(mockUUID);
      expect(result.orgId).toBe("org-123");
      expect(result.vulnId).toBe("CVE-2024-001");
      expect(result.method).toBe("POST");
      expect(result.pathPattern).toBe("/api/users");
      expect(result.paramName).toBe("email");
      expect(result.blockPattern).toBe(".*<script>.*");
      expect(result.prId).toBe("PR-42");
      expect(result.active).toBe(true);
      expect(result.expiresAt).toBe("2025-12-31T23:59:59Z");
    });

    it("should create a patch with optional fields as null", async () => {
      mockRepository.create.mockImplementation(async (p) => p);
      const minimalInput: CreateVirtualPatchInput = {
        orgId: "org-123",
        vulnId: "CVE-2024-002",
        method: "GET",
        pathPattern: "/api/admin",
        blockPattern: ".*UNION.*",
      };

      const result = await bl.create(minimalInput);

      expect(result.paramName).toBeNull();
      expect(result.prId).toBeNull();
      expect(result.expiresAt).toBeNull();
    });

    it("should uppercase the HTTP method", async () => {
      mockRepository.create.mockImplementation(async (p) => p);

      const result = await bl.create({ ...validInput, method: "post" });

      expect(result.method).toBe("POST");
    });

    it("should throw error when orgId is missing", async () => {
      await expect(bl.create({ ...validInput, orgId: "" })).rejects.toThrow("orgId is required");
    });

    it("should throw error when vulnId is missing", async () => {
      await expect(bl.create({ ...validInput, vulnId: "" })).rejects.toThrow("vulnId is required");
    });

    it("should throw error when method is missing", async () => {
      await expect(bl.create({ ...validInput, method: "" })).rejects.toThrow("method is required");
    });

    it("should throw error when pathPattern is missing", async () => {
      await expect(bl.create({ ...validInput, pathPattern: "" })).rejects.toThrow("pathPattern is required");
    });

    it("should throw error when blockPattern is missing", async () => {
      await expect(bl.create({ ...validInput, blockPattern: "" })).rejects.toThrow("blockPattern is required");
    });

    it("should throw error for invalid HTTP method", async () => {
      await expect(bl.create({ ...validInput, method: "INVALID" })).rejects.toThrow(
        "method must be one of: GET, POST, PUT, PATCH, DELETE"
      );
    });
  });

  describe("listActive", () => {
    it("should return active patches for orgId", async () => {
      const patches: VirtualPatch[] = [
        {
          id: "vp1",
          orgId: "org-123",
          vulnId: "CVE-2024-001",
          method: "POST",
          pathPattern: "/api/users",
          paramName: "email",
          blockPattern: ".*<script>.*",
          prId: null,
          active: true,
          expiresAt: null,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ];
      mockRepository.listActive.mockResolvedValue(patches);

      const result = await bl.listActive("org-123");

      expect(result).toHaveLength(1);
      expect(result[0].orgId).toBe("org-123");
      expect(mockRepository.listActive).toHaveBeenCalledWith("org-123");
    });

    it("should throw error when orgId is empty", async () => {
      await expect(bl.listActive("")).rejects.toThrow("orgId is required");
    });

    it("should return empty array when no active patches", async () => {
      mockRepository.listActive.mockResolvedValue([]);

      const result = await bl.listActive("org-123");

      expect(result).toHaveLength(0);
    });
  });

  describe("deactivate", () => {
    it("should deactivate a patch successfully", async () => {
      mockRepository.deactivate.mockResolvedValue(true);

      const result = await bl.deactivate("vp1");

      expect(result).toEqual({ success: true });
      expect(mockRepository.deactivate).toHaveBeenCalledWith("vp1");
    });

    it("should throw error when id is empty", async () => {
      await expect(bl.deactivate("")).rejects.toThrow("id is required");
    });

    it("should throw error when patch not found", async () => {
      mockRepository.deactivate.mockResolvedValue(false);

      await expect(bl.deactivate("nonexistent")).rejects.toThrow("Virtual patch not found");
    });
  });
});
