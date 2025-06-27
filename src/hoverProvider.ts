import * as vscode from "vscode";
import { TranslationService } from "./translationService";

export class HoverProvider implements vscode.HoverProvider {
  private lastHoverTime = 0;
  private lastHoverText = "";

  constructor(private translationService: TranslationService) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    // 설정 확인
    const config = vscode.workspace.getConfiguration("korean-translator");
    const enabled = config.get("enabled", true);

    if (!enabled) {
      return null;
    }

    const line = document.lineAt(position);
    const lineText = line.text;

    // 주석 감지
    const commentMatch = this.detectComment(lineText, position.character);
    if (commentMatch) {
      const englishText = this.translationService.extractEnglishFromComment(
        commentMatch.text
      );
      if (englishText) {
        // 디바운싱 체크
        if (!this.shouldTranslate(englishText)) {
          return null;
        }

        const translation = await this.translationService.translate(
          englishText
        );
        return this.createHoverMarkdown(englishText, translation, "주석");
      }
    }

    // 변수명/함수명 감지
    const wordRange = document.getWordRangeAtPosition(position);
    if (wordRange) {
      const word = document.getText(wordRange);

      // 영어 단어인지 확인 (최소 3글자 이상의 영어)
      if (this.isEnglishWord(word) && word.length >= 3) {
        // 디바운싱 체크
        if (!this.shouldTranslate(word)) {
          return null;
        }

        const translation = await this.translationService.translate(word);
        if (translation !== word) {
          return this.createHoverMarkdown(word, translation, "변수/함수명");
        }
      }
    }

    return null;
  }

  // 디바운싱 체크 함수
  private shouldTranslate(text: string): boolean {
    const now = Date.now();
    const config = vscode.workspace.getConfiguration("korean-translator");
    const debounceDelay = config.get("debounceDelay", 300);

    // 같은 텍스트이고 설정된 시간 이내라면 번역하지 않음
    if (
      this.lastHoverText === text &&
      now - this.lastHoverTime < debounceDelay
    ) {
      return false;
    }

    // 디바운싱 정보 업데이트
    this.lastHoverTime = now;
    this.lastHoverText = text;

    return true;
  }

  private detectComment(
    lineText: string,
    characterPosition: number
  ): { text: string; start: number; end: number } | null {
    // 한줄 주석 (//) 감지
    const singleLineCommentIndex = lineText.indexOf("//");
    if (
      singleLineCommentIndex !== -1 &&
      characterPosition >= singleLineCommentIndex
    ) {
      return {
        text: lineText.substring(singleLineCommentIndex),
        start: singleLineCommentIndex,
        end: lineText.length,
      };
    }

    // 파이썬 주석 (#) 감지
    const pythonCommentIndex = lineText.indexOf("#");
    if (pythonCommentIndex !== -1 && characterPosition >= pythonCommentIndex) {
      return {
        text: lineText.substring(pythonCommentIndex),
        start: pythonCommentIndex,
        end: lineText.length,
      };
    }

    // 블록 주석 (/* */) 감지
    const blockCommentStart = lineText.indexOf("/*");
    const blockCommentEnd = lineText.indexOf("*/");

    if (
      blockCommentStart !== -1 &&
      characterPosition >= blockCommentStart &&
      (blockCommentEnd === -1 || characterPosition <= blockCommentEnd + 2)
    ) {
      const endPos =
        blockCommentEnd !== -1 ? blockCommentEnd + 2 : lineText.length;
      return {
        text: lineText.substring(blockCommentStart, endPos),
        start: blockCommentStart,
        end: endPos,
      };
    }

    return null;
  }

  private isEnglishWord(word: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9]*$/.test(word);
  }

  private createHoverMarkdown(
    original: string,
    translation: string,
    type: string
  ): vscode.Hover {
    const markdown = new vscode.MarkdownString();

    markdown.appendMarkdown(`**🇰🇷 한국어 번역 (${type})**\n\n`);
    markdown.appendMarkdown(`**원문:** ${original}\n\n`);
    markdown.appendMarkdown(`**번역:** \`${translation}\`\n\n`);
    markdown.appendMarkdown(`---\n`);
    markdown.appendMarkdown(`*Korean Translator Extension*`);

    // 마크다운에서 HTML 사용 허용
    markdown.isTrusted = true;

    return new vscode.Hover(markdown);
  }
}
