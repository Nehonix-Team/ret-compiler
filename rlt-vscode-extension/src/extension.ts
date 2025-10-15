import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

let diagnosticCollection: vscode.DiagnosticCollection;
let compilerProcess: any = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('FSC Extension activated');

    // Initialize diagnostic collection for error reporting
    diagnosticCollection = vscode.languages.createDiagnosticCollection('fsc');
    context.subscriptions.push(diagnosticCollection);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('fsc.validate', validateCurrentFile),
        vscode.commands.registerCommand('fsc.compile', compileCurrentFile),
        vscode.commands.registerCommand('fsc.watch', startWatchMode),
        vscode.commands.registerCommand('fsc.createSchema', createNewSchema)
    );

    // Register language features
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('fsc', new FSCHoverProvider()),
        vscode.languages.registerCompletionItemProvider('fsc', new FSCCompletionProvider(), '.', ' ')
    );

    // Set up real-time validation if enabled
    const config = vscode.workspace.getConfiguration('fsc');
    if (config.get('enableRealTimeValidation', true)) {
        setupRealTimeValidation(context);
    }

    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('fsc.enableRealTimeValidation')) {
                const enabled = config.get('enableRealTimeValidation', true);
                if (enabled) {
                    setupRealTimeValidation(context);
                } else {
                    // Stop real-time validation
                    if (compilerProcess) {
                        compilerProcess.kill();
                        compilerProcess = null;
                    }
                }
            }
        })
    );
}

function setupRealTimeValidation(context: vscode.ExtensionContext) {
    // Watch for document changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'fsc') {
                validateDocument(event.document);
            }
        })
    );

    // Watch for document opens
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (document.languageId === 'fsc') {
                validateDocument(document);
            }
        })
    );

    // Validate all open FSC documents
    vscode.workspace.textDocuments.forEach(document => {
        if (document.languageId === 'fsc') {
            validateDocument(document);
        }
    });
}

async function validateCurrentFile() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor || activeEditor.document.languageId !== 'fsc') {
        vscode.window.showErrorMessage('No FSC file is currently open');
        return;
    }

    await validateDocument(activeEditor.document);
    vscode.window.showInformationMessage('FSC validation completed');
}

async function compileCurrentFile() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor || activeEditor.document.languageId !== 'fsc') {
        vscode.window.showErrorMessage('No FSC file is currently open');
        return;
    }

    const document = activeEditor.document;
    const filePath = document.uri.fsPath;
    const outputDir = vscode.workspace.getConfiguration('fsc').get('outputDirectory', './generated');

    try {
        await runCompiler(['build', filePath, '--output', outputDir]);
        vscode.window.showInformationMessage(`FSC compilation completed. Output: ${outputDir}`);
    } catch (error) {
        vscode.window.showErrorMessage(`FSC compilation failed: ${error}`);
    }
}

async function startWatchMode() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const outputDir = vscode.workspace.getConfiguration('fsc').get('outputDirectory', './generated');

    try {
        if (compilerProcess) {
            compilerProcess.kill();
        }

        compilerProcess = spawn(getCompilerPath(), ['watch', workspaceFolder.uri.fsPath, '--output', outputDir], {
            cwd: workspaceFolder.uri.fsPath,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        compilerProcess.stdout.on('data', (data: Buffer) => {
            console.log(`FSC Watch: ${data.toString()}`);
        });

        compilerProcess.stderr.on('data', (data: Buffer) => {
            console.error(`FSC Watch Error: ${data.toString()}`);
        });

        compilerProcess.on('close', (code: number) => {
            console.log(`FSC watch process exited with code ${code}`);
            compilerProcess = null;
        });

        vscode.window.showInformationMessage('FSC watch mode started');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to start FSC watch: ${error}`);
    }
}

async function createNewSchema(uri: vscode.Uri) {
    const schemaName = await vscode.window.showInputBox({
        prompt: 'Enter schema name',
        placeHolder: 'MySchema'
    });

    if (!schemaName) {
        return;
    }

    const fileName = `${schemaName}.fsc`;
    const filePath = uri ? path.join(uri.fsPath, fileName) : path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, fileName);

    const template = `# ${schemaName} Schema
define ${schemaName} {
  id: number
  name: string
  createdAt: date
}

export ${schemaName}
`;

    try {
        await fs.promises.writeFile(filePath, template);
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create schema: ${error}`);
    }
}

async function validateDocument(document: vscode.TextDocument) {
    const diagnostics: vscode.Diagnostic[] = [];

    try {
        const content = document.getText();
        const result = await runCompilerValidation(content);

        // Parse compiler output for errors
        if (result.stderr) {
            const lines = result.stderr.split('\n');
            for (const line of lines) {
                if (line.includes('Error') || line.includes('error')) {
                    const diagnostic = parseErrorLine(line, document);
                    if (diagnostic) {
                        diagnostics.push(diagnostic);
                    }
                }
            }
        }
    } catch (error) {
        // If compiler fails completely, show general error
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, 1),
            `FSC validation failed: ${error}`,
            vscode.DiagnosticSeverity.Error
        );
        diagnostics.push(diagnostic);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

function parseErrorLine(line: string, document: vscode.TextDocument): vscode.Diagnostic | null {
    // Parse error format: "Error at line 5, col 10: message"
    const match = line.match(/Error at line (\d+), col (\d+): (.+)/);
    if (match) {
        const lineNum = parseInt(match[1]) - 1; // Convert to 0-based
        const colNum = parseInt(match[2]) - 1;
        const message = match[3];

        const range = new vscode.Range(lineNum, colNum, lineNum, colNum + 1);
        return new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
    }
    return null;
}

async function runCompiler(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const compilerPath = getCompilerPath();
        const process = spawn(compilerPath, args, { stdio: 'pipe' });

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        process.on('close', (code: number) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(stderr || `Compiler exited with code ${code}`));
            }
        });

        process.on('error', (error) => {
            reject(error);
        });
    });
}

async function runCompilerValidation(content: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const compilerPath = getCompilerPath();
        const process = spawn(compilerPath, ['test-parser'], { stdio: ['pipe', 'pipe', 'pipe'] });

        let stdout = '';
        let stderr = '';

        // Send content to stdin
        process.stdin.write(content);
        process.stdin.end();

        process.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        process.on('close', (code: number) => {
            resolve({ stdout, stderr });
        });

        process.on('error', (error) => {
            reject(error);
        });
    });
}

function getCompilerPath(): string {
    const config = vscode.workspace.getConfiguration('fsc');
    const customPath = config.get('compilerPath', '');

    if (customPath) {
        return customPath;
    }

    // Try to find bundled compiler - use current extension context
    try {
        // Get the current extension from the global extensions API
        const extensions = (vscode as any).extensions;
        if (extensions && extensions.getExtension) {
            const extension = extensions.getExtension('NEHONIX.fsc-vscode-extension');
            if (extension) {
                const bundledPath = path.join(extension.extensionPath, 'bin', 'fsc');
                if (fs.existsSync(bundledPath)) {
                    return bundledPath;
                }
            }
        }
    } catch (error) {
        // Ignore errors and fall back to system PATH
    }

    // Fallback to system PATH
    return 'fsc';
}

class FSCHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return null;
        }

        const word = document.getText(wordRange);

        // Provide hover information for keywords and types
        const hoverInfo: { [key: string]: string } = {
            'define': 'Define a new schema with fields and validation rules',
            'when': 'Conditional field definition based on other field values',
            'validate': 'Add custom validation rules to fields',
            'string': 'String type with optional constraints',
            'number': 'Number type with optional constraints',
            'boolean': 'Boolean type (true/false)',
            'matches': 'Regex pattern matching constraint',
            'minLength': 'Minimum string length constraint',
            'maxLength': 'Maximum string length constraint',
            'min': 'Minimum value constraint',
            'max': 'Maximum value constraint',
            'positive': 'Must be greater than 0',
            'integer': 'Must be a whole number'
        };

        if (hoverInfo[word]) {
            return new vscode.Hover(hoverInfo[word]);
        }

        return null;
    }
}

class FSCCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[]> {
        const line = document.lineAt(position.line).text.substring(0, position.character);
        const completions: vscode.CompletionItem[] = [];

        // Keywords
        const keywords = ['define', 'when', 'else', 'validate', 'export', 'import', 'from', 'as', 'let', 'enum', 'type'];
        for (const keyword of keywords) {
            if (keyword.startsWith(line.trim())) {
                const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                item.detail = `FSC keyword: ${keyword}`;
                completions.push(item);
            }
        }

        // Types
        const types = ['string', 'number', 'boolean', 'object', 'array', 'date', 'email', 'url', 'uuid'];
        for (const type of types) {
            if (type.startsWith(line.trim())) {
                const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.TypeParameter);
                item.detail = `FSC type: ${type}`;
                completions.push(item);
            }
        }

        // Constraints
        const constraints = ['min', 'max', 'minLength', 'maxLength', 'matches', 'contains', 'startsWith', 'endsWith', 'hasUppercase', 'hasLowercase', 'hasNumber', 'hasSpecialChar', 'between', 'positive', 'negative', 'integer', 'float'];
        for (const constraint of constraints) {
            if (constraint.startsWith(line.trim())) {
                const item = new vscode.CompletionItem(constraint, vscode.CompletionItemKind.Function);
                item.detail = `FSC constraint: ${constraint}`;
                completions.push(item);
            }
        }

        return completions;
    }
}

export function deactivate() {
    if (compilerProcess) {
        compilerProcess.kill();
    }
    diagnosticCollection.dispose();
}