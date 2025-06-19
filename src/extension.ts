import * as vscode from "vscode";
import { TranslationService } from "./translationService";
import { HoverProvider } from "./hoverProvider";

export function activate(context: vscode.ExtensionContext) {
  const translationService = new TranslationService();
  // 확장 프로그램 시작시 캐시 초기화
  translationService.clearCache();

  const hoverProvider = new HoverProvider(translationService);

  // 1. 호버 프로바이더 등록 (주석에 마우스 올리면 번역)
  const hoverDisposable = vscode.languages.registerHoverProvider(
    { scheme: "file", language: "*" },
    hoverProvider
  );

  // 2. 단축키 명령어 등록 (변수명 번역) - 인라인 힌트 스타일
  const translateCommand = vscode.commands.registerCommand(
    "korean-translator.translateSelection",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      let wordRange: vscode.Range;
      let targetText: string;

      if (!text) {
        // 선택된 텍스트가 없으면 커서 위치의 단어 선택
        const wordRangeAtPosition = editor.document.getWordRangeAtPosition(
          selection.start
        );
        if (!wordRangeAtPosition) {
          return;
        }
        wordRange = wordRangeAtPosition;
        targetText = editor.document.getText(wordRange);
      } else {
        wordRange = new vscode.Range(selection.start, selection.end);
        targetText = text;
      }

      // 번역 수행
      const translation = await translationService.translate(targetText);

      // 인라인 힌트로 번역 결과 표시
      await showInlineTranslation(editor, wordRange, targetText, translation);
    }
  );

  // 3. 자동 번역 토글 명령어
  const toggleCommand = vscode.commands.registerCommand(
    "korean-translator.toggle",
    () => {
      const config = vscode.workspace.getConfiguration("korean-translator");
      const enabled = config.get("enabled", true);
      config.update("enabled", !enabled, true);

      vscode.window.showInformationMessage(
        `Korean Translator: ${!enabled ? "Enabled" : "Disabled"}`
      );
    }
  );

  // 4. 개발용 캐시 상태 확인 명령어
  const cacheStatusCommand = vscode.commands.registerCommand(
    "korean-translator.cacheStatus",
    () => {
      translationService.logCacheStatus();
      vscode.window.showInformationMessage("Cache status logged to console");
    }
  );

  // 5. 개발용 캐시 수동 초기화 명령어
  const clearCacheCommand = vscode.commands.registerCommand(
    "korean-translator.clearCache",
    () => {
      translationService.clearCache();
      vscode.window.showInformationMessage("Translation cache cleared!");
    }
  );

  context.subscriptions.push(
    hoverDisposable,
    translateCommand,
    toggleCommand,
    cacheStatusCommand,
    clearCacheCommand
  );
}

// 인라인 번역 표시 함수
async function showInlineTranslation(
  editor: vscode.TextEditor,
  range: vscode.Range,
  originalText: string,
  translation: string
) {
  // 데코레이션 타입 생성 (인라인 텍스트)
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: ` → ${translation}`,
      color: "#00ff00", // 초록색
      fontStyle: "italic",
      fontWeight: "bold",
      margin: "0 0 0 10px",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  });

  // 데코레이션 적용
  editor.setDecorations(decorationType, [range]);

  // 3초 후 데코레이션 제거
  setTimeout(() => {
    decorationType.dispose();
  }, 3000);

  // 추가: 상태표시줄에도 메시지 표시
  const statusMessage = vscode.window.setStatusBarMessage(
    `🇰🇷 ${originalText} → ${translation}`,
    3000
  );
}

export function deactivate() {}
