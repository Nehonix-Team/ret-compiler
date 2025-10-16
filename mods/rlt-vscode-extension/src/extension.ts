import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

let diagnosticCollection: vscode.DiagnosticCollection;
let compilerPath: string;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('rel');
    outputChannel = vscode.window.createOutputChannel('ReT Compiler');

    // Get compiler path from settings or use bundled
    compilerPath = getCompilerPath(context);

    // Register language features
    registerLanguageFeatures(context);

    // Register commands
    registerCommands(context);

    // Set up real-time validation
    setupRealTimeValidation(context);

    outputChannel.appendLine('ReT VSCode Extension activated');
}

function getCompilerPath(context: vscode.ExtensionContext): string {
    const configPath = vscode.workspace.getConfiguration('rel').get('compilerPath') as string;
    if (configPath) {
        return configPath;
    }

    // Use bundled compiler
    const bundledPath = path.join(context.extensionPath, 'bin', 'rel-compiler');
    if (process.platform === 'win32') {
        return bundledPath + '.exe';
    }
    return bundledPath;
}

function registerLanguageFeatures(context: vscode.ExtensionContext) {
    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'rel',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return getCompletionItems(document, position);
            }
        }
    );

    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider(
        'rel',
        {
            provideHover(document: vscode.TextDocument, position: vscode.Position) {
                return getHoverInfo(document, position);
            }
        }
    );

    context.subscriptions.push(completionProvider, hoverProvider);
}

function registerCommands(context: vscode.ExtensionContext) {
    // Validate command
    const validateCommand = vscode.commands.registerCommand('rel.validate', async () => {
        const document = vscode.window.activeTextEditor?.document;
        if (document && document.languageId === 'rel') {
            await validateDocument(document);
        }
    });

    // Compile command
    const compileCommand = vscode.commands.registerCommand('rel.compile', async () => {
        const document = vscode.window.activeTextEditor?.document;
        if (document && document.languageId === 'rel') {
            await compileDocument(document);
        }
    });

    // Watch command
    const watchCommand = vscode.commands.registerCommand('rel.watch', () => {
        startWatchMode();
    });

    // Create schema command
    const createSchemaCommand = vscode.commands.registerCommand('rel.createSchema', async (uri: vscode.Uri) => {
        await createNewSchema(uri);
    });

    context.subscriptions.push(validateCommand, compileCommand, watchCommand, createSchemaCommand);
}

function setupRealTimeValidation(context: vscode.ExtensionContext) {
    const enableValidation = vscode.workspace.getConfiguration('rel').get('enableRealTimeValidation') as boolean;

    if (enableValidation) {
        // Validate on document open
        vscode.workspace.onDidOpenTextDocument(document => {
            if (document.languageId === 'rel') {
                validateDocument(document);
            }
        });

        // Validate on document change
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'rel') {
                // Debounce validation
                clearTimeout(validationTimeout);
                validationTimeout = setTimeout(() => {
                    validateDocument(event.document);
                }, 500);
            }
        });

        // Validate on save
        vscode.workspace.onDidSaveTextDocument(document => {
            if (document.languageId === 'rel') {
                validateDocument(document);
            }
        });
    }
}

let validationTimeout: NodeJS.Timeout;

async function validateDocument(document: vscode.TextDocument): Promise<void> {
    const filePath = document.uri.fsPath;
    const diagnostics: vscode.Diagnostic[] = [];

    try {
        // Run compiler in validation mode
        const result = await runCompiler(['validate', '--input', filePath]);

        if (result.stderr) {
            // Parse errors from stderr
            const errors = parseCompilerErrors(result.stderr);
            diagnostics.push(...errors);
        }
    } catch (error) {
        outputChannel.appendLine(`Validation error: ${error}`);
        const errorDiagnostic = new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, 1),
            `Validation failed: ${error}`,
            vscode.DiagnosticSeverity.Error
        );
        diagnostics.push(errorDiagnostic);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

async function compileDocument(document: vscode.TextDocument): Promise<void> {
    const filePath = document.uri.fsPath;
    const outputDir = vscode.workspace.getConfiguration('rel').get('outputDirectory') as string;

    try {
        const result = await runCompiler(['build', '--input', filePath, '--output', outputDir]);
        outputChannel.appendLine(result.stdout);

        if (result.stderr) {
            outputChannel.appendLine(`Warnings: ${result.stderr}`);
        }

        vscode.window.showInformationMessage('ReT compilation completed successfully');
    } catch (error) {
        outputChannel.appendLine(`Compilation error: ${error}`);
        vscode.window.showErrorMessage(`Compilation failed: ${error}`);
    }
}

function startWatchMode(): void {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const watcher = vscode.workspace.createFileSystemWatcher('**/*.rel', false, false, false);

    watcher.onDidChange(uri => {
        const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
        if (document) {
            validateDocument(document);
        }
    });

    watcher.onDidCreate(uri => {
        const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
        if (document) {
            validateDocument(document);
        }
    });

    vscode.window.showInformationMessage('ReT watch mode started');
}

async function createNewSchema(uri: vscode.Uri): Promise<void> {
    const schemaName = await vscode.window.showInputBox({
        prompt: 'Enter schema name',
        placeHolder: 'MySchema'
    });

    if (!schemaName) {
        return;
    }

    const folderUri = uri || vscode.workspace.workspaceFolders?.[0].uri;
    if (!folderUri) {
        return;
    }

    const fileName = `${schemaName}.rel`;
    const fileUri = vscode.Uri.joinPath(folderUri, fileName);

    const template = `define ${schemaName} {
  id: number
  name: string
  createdAt: date
}`;

    try {
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(template, 'utf8'));
        const document = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(document);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create schema: ${error}`);
    }
}

function getCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
    const line = document.lineAt(position).text.substring(0, position.character);
    const items: vscode.CompletionItem[] = [];

    // Keywords
    const keywords = ['define', 'when', 'else', 'validate', 'let', 'enum', 'type', 'mixin', 'extends', 'with', 'from', 'import', 'export'];
    keywords.forEach(keyword => {
        if (keyword.startsWith(line.trim())) {
            const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
            item.detail = `ReT keyword: ${keyword}`;
            items.push(item);
        }
    });

    // Types
    const types = ['string', 'number', 'boolean', 'date', 'email', 'url', 'record', 'array'];
    types.forEach(type => {
        if (type.startsWith(line.trim())) {
            const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.TypeParameter);
            item.detail = `ReT type: ${type}`;
            items.push(item);
        }
    });

    // Constraints
    const constraints = ['min', 'max', 'matches', 'positive', 'negative', 'integer', 'float', 'minLength', 'maxLength', 'hasUppercase', 'hasLowercase', 'hasNumber', 'hasSpecialChar'];
    constraints.forEach(constraint => {
        if (constraint.startsWith(line.trim())) {
            const item = new vscode.CompletionItem(constraint, vscode.CompletionItemKind.Function);
            item.detail = `ReT constraint: ${constraint}`;
            items.push(item);
        }
    });

    return items;
}

function getHoverInfo(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
        return null;
    }

    const word = document.getText(wordRange);

    const hoverMap: { [key: string]: string } = {
        'define': 'Define a new schema with fields and validation rules',
        'when': 'Conditional field definition based on other field values',
        'validate': 'Add custom validation rules to the schema',
        'let': 'Define reusable constants and variables',
        'string': 'Text data type',
        'number': 'Numeric data type',
        'boolean': 'True/false data type',
        'date': 'Date and time data type',
        'email': 'Email address with built-in validation',
        'url': 'URL with built-in validation',
        'min': 'Minimum value constraint',
        'max': 'Maximum value constraint',
        'matches': 'Regular expression pattern matching',
        'positive': 'Positive number constraint',
        'negative': 'Negative number constraint',
        'integer': 'Integer number constraint',
        'float': 'Floating point number constraint',
        'minLength': 'Minimum length constraint',
        'maxLength': 'Maximum length constraint',
        'hasUppercase': 'At least one uppercase letter constraint',
        'hasLowercase': 'At least one lowercase letter constraint',
        'hasNumber': 'At least one number constraint',
        'hasSpecialChar': 'At least one special character constraint'
    };

    const info = hoverMap[word];
    if (info) {
        return new vscode.Hover(info);
    }

    return null;
}

async function runCompiler(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const compiler = spawn(compilerPath, args, {
            cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
        });

        let stdout = '';
        let stderr = '';

        compiler.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        compiler.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        compiler.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`Compiler exited with code ${code}: ${stderr}`));
            }
        });

        compiler.on('error', (error) => {
            reject(error);
        });
    });
}

function parseCompilerErrors(stderr: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const lines = stderr.split('\n');

    for (const line of lines) {
        // Parse error format: "file.rel:line:col: error: message"
        const match = line.match(/^(.+):(\d+):(\d+):\s*(error|warning):\s*(.+)$/);
        if (match) {
            const [, file, lineNum, colNum, severity, message] = match;
            const lineNumber = parseInt(lineNum) - 1;
            const colNumber = parseInt(colNum) - 1;

            const diagnosticSeverity = severity === 'error'
                ? vscode.DiagnosticSeverity.Error
                : vscode.DiagnosticSeverity.Warning;

            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(lineNumber, colNumber, lineNumber, colNumber + 1),
                message,
                diagnosticSeverity
            );

            diagnostics.push(diagnostic);
        }
    }

    return diagnostics;
}

export function deactivate() {
    diagnosticCollection.dispose();
    outputChannel.dispose();
}