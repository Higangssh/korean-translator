import { ITranslationStrategy } from "./ITranslationStrategy";
import OpenAI from "openai";
import * as vscode from "vscode";

export class GPTTranslationStrategy implements ITranslationStrategy {
  public readonly name = "GPT Translation";
  public readonly priority = 1; // 로컬 사전 다음 우선순위

  private openai: OpenAI | null = null;
  private model: string = "gpt-4o-mini";

  constructor() {
    this.initializeOpenAI();
    this.setupConfigurationListener();
  }

  /**
   * OpenAI 클라이언트 초기화
   */
  private initializeOpenAI(): void {
    const config = vscode.workspace.getConfiguration("korean-translator");
    const apiKey = config.get<string>("openaiApiKey");
    this.model = config.get<string>("gptModel", "gpt-4o-mini");

    if (apiKey && apiKey.trim() !== "") {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey.trim(),
        });
        console.log("GPT Translation Strategy initialized successfully");
      } catch (error) {
        console.error("Failed to initialize OpenAI client:", error);
        this.openai = null;
      }
    } else {
      this.openai = null;
      console.log("GPT Translation Strategy: No API key provided");
    }
  }

  /**
   * 설정 변경 감지 리스너 설정
   */
  private setupConfigurationListener(): void {
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("korean-translator.openaiApiKey") ||
        event.affectsConfiguration("korean-translator.gptModel")
      ) {
        this.initializeOpenAI();
      }
    });
  }

  public canHandle(text: string): boolean {
    // API 키가 설정되어 있고, OpenAI 클라이언트가 초기화된 경우에만 처리 가능
    if (!this.openai) {
      return false;
    }

    // 빈 문자열이나 너무 짧은 텍스트는 처리하지 않음
    const trimmedText = text.trim();
    if (trimmedText.length < 2) {
      return false;
    }

    // 이미 한국어인 경우 처리하지 않음 (한국어 문자 포함 확인)
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    if (koreanRegex.test(trimmedText)) {
      return false;
    }

    return true;
  }

  public async translate(text: string): Promise<string> {
    if (!this.openai) {
      console.log("GPT Translation: OpenAI client not initialized");
      return text;
    }

    try {
      const prompt = this.createTranslationPrompt(text);

      const response = await this.openai.chat.completions.create(
        {
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "당신은 프로그래밍 용어와 주석을 한국어로 번역하는 전문가입니다. 컨텍스트에 맞는 자연스러운 한국어로 번역해주세요.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.1,
        },
        {
          timeout: 10000, // 10초 타임아웃
        }
      );

      const translatedText = response.choices[0]?.message?.content?.trim();

      if (translatedText && translatedText !== text) {
        console.log(`GPT translation success: "${text}" → "${translatedText}"`);
        return translatedText;
      } else {
        console.log(
          `GPT translation: No valid translation returned for "${text}"`
        );
        return text;
      }
    } catch (error: any) {
      // 사용자 친화적인 오류 메시지 출력
      if (
        error?.status === 429 ||
        error?.code === "rate_limit_exceeded" ||
        error?.code === "insufficient_quota"
      ) {
        console.log(
          `GPT Translation: 할당량 초과 - "${text}". 다음 전략으로 진행합니다.`
        );
        console.log(
          "💡 OpenAI 할당량을 확인하세요: https://platform.openai.com/account/billing/overview"
        );
      } else if (error?.status === 401 || error?.code === "invalid_api_key") {
        console.log(
          "GPT Translation: 잘못된 API 키입니다. GPT 전략을 비활성화합니다."
        );
        this.openai = null;
      } else {
        console.log(`GPT Translation 오류 (${text}):`, error?.message || error);
      }

      // 오류 발생 시 원본 텍스트 반환하여 다음 전략이 시도되도록 함
      return text;
    }
  }

  /**
   * 번역 프롬프트 생성
   */
  private createTranslationPrompt(text: string): string {
    // 주석인지 확인
    const isComment =
      text.includes("//") || text.includes("/*") || text.includes("*");

    if (isComment) {
      return `다음 프로그래밍 주석을 한국어로 자연스럽게 번역해주세요. 주석 기호는 유지하고 내용만 번역하세요:

"${text}"

번역된 결과만 출력해주세요.`;
    } else {
      return `다음 영어 단어나 구문을 프로그래밍 컨텍스트에 맞는 한국어로 번역해주세요:

"${text}"

번역된 결과만 출력해주세요.`;
    }
  }

  /**
   * API 키 설정 상태 확인
   */
  public isConfigured(): boolean {
    return this.openai !== null;
  }

  /**
   * 현재 모델 정보 반환
   */
  public getModelInfo(): string {
    return this.model;
  }
}
