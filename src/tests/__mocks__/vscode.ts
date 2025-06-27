export const workspace = {
  getConfiguration: jest.fn().mockReturnValue({
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === "openaiApiKey") return "";
      if (key === "gptModel") return "gpt-4o-mini";
      return defaultValue;
    }),
  }),
  onDidChangeConfiguration: jest.fn(),
};

export const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

export const languages = {
  registerHoverProvider: jest.fn(),
};

export class Disposable {
  dispose() {}
}

export class Range {
  constructor(public start: any, public end: any) {}
}

export class Position {
  constructor(public line: number, public character: number) {}
}

export class Hover {
  constructor(public contents: any, public range?: any) {}
}

export class MarkdownString {
  constructor(public value?: string) {}

  appendText(value: string) {
    this.value += value;
  }

  appendMarkdown(value: string) {
    this.value += value;
  }
}

export const ExtensionContext = {
  subscriptions: [],
};

export default {
  workspace,
  window,
  commands,
  languages,
  Disposable,
  Range,
  Position,
  Hover,
  MarkdownString,
  ExtensionContext,
};
