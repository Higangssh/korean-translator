import { GPTTranslationStrategy } from "../translation/strategies/GPTTranslationStrategy";
import * as vscode from "vscode";

// OpenAI 모킹
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

describe("GPTTranslationStrategy", () => {
  let strategy: GPTTranslationStrategy;
  let mockGetConfiguration: jest.Mock;

  beforeEach(() => {
    mockGetConfiguration = vscode.workspace.getConfiguration as jest.Mock;
    mockGetConfiguration.mockReturnValue({
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === "openaiApiKey") return "";
        if (key === "gptModel") return "gpt-4o-mini";
        return defaultValue;
      }),
    });

    strategy = new GPTTranslationStrategy();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("canHandle", () => {
    it("API 키가 없으면 false를 반환해야 함", () => {
      const result = strategy.canHandle("test");
      expect(result).toBe(false);
    });

    it("빈 문자열에 대해 false를 반환해야 함", () => {
      const result = strategy.canHandle("");
      expect(result).toBe(false);
    });

    it("짧은 텍스트에 대해 false를 반환해야 함", () => {
      const result = strategy.canHandle("a");
      expect(result).toBe(false);
    });

    it("한국어가 포함된 텍스트에 대해 false를 반환해야 함", () => {
      const result = strategy.canHandle("안녕 world");
      expect(result).toBe(false);
    });
  });

  describe("translate", () => {
    it("OpenAI 클라이언트가 초기화되지 않은 경우 원본 텍스트를 반환해야 함", async () => {
      const result = await strategy.translate("test");
      expect(result).toBe("test");
    });
  });

  describe("우선순위", () => {
    it("우선순위가 1이어야 함", () => {
      expect(strategy.priority).toBe(1);
    });
  });

  describe("이름", () => {
    it('전략 이름이 "GPT Translation"이어야 함', () => {
      expect(strategy.name).toBe("GPT Translation");
    });
  });

  describe("설정 메서드", () => {
    it("isConfigured가 OpenAI 클라이언트 상태를 반환해야 함", () => {
      const result = strategy.isConfigured();
      expect(result).toBe(false); // API 키가 없으므로 false
    });

    it("getModelInfo가 현재 모델 정보를 반환해야 함", () => {
      const result = strategy.getModelInfo();
      expect(result).toBe("gpt-4o-mini");
    });
  });
});
