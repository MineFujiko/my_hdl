import { Diagnostic, DiagnosticSeverity, Range, Position } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode';
import { Uri, workspace } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import { VCSCompiler } from '../compiling/VCSCompiler';
import { getPathFromUri } from '../utils/common';

const testFolderLocation = '../../src/test/test-files/VCSCompiler.test';
const filePathPlaceholder = 'FILEPATH_PLACEHOLDER';

let diagnosticCollection: Map<string, Diagnostic[]>;
const documentCompiler = new VCSCompiler(undefined, undefined, undefined, undefined, undefined);

suite('VCSCompiler Tests', () => {
    test('test #1: Diagnostics from %Error', async () => {
        diagnosticCollection = new Map();

        const filePath = path.join(__dirname, testFolderLocation, 'foo.sv');

        const uriDoc = Uri.file(filePath);
        const documentWorkspace = await workspace.openTextDocument(uriDoc);

        const document: TextDocument = castTextDocument(documentWorkspace);

        const compiledFilePath = getPathFromUri(document.uri, __dirname);

        const stderrFile = path.join(__dirname, testFolderLocation, 'foo.stdout.txt');

        let stdout = fs.readFileSync(stderrFile).toString();
        stdout = stderrSetUp(stdout, compiledFilePath);

        documentCompiler.parseDiagnostics(undefined, stdout, undefined, document, compiledFilePath, diagnosticCollection); // prettier-ignore

        const collection = diagnosticCollection.get(document.uri);
        assert.strictEqual(collection.length, 4);

        // Check that every diagnostic is an Error
        collection.forEach((diagnostic: Diagnostic) => {
            if (diagnostic.severity !== DiagnosticSeverity.Error) {
                assert.fail();
            }
        });
    });

    test('test #2: Diagnostics for empty stdout', async () => {
        diagnosticCollection = new Map();

        const uriDoc = Uri.file(path.join(__dirname, testFolderLocation, 'baz.sv'));

        const documentWorkspace = await workspace.openTextDocument(uriDoc);

        const document: TextDocument = castTextDocument(documentWorkspace);

        const compiledFilePath = getPathFromUri(document.uri, __dirname);

        documentCompiler.parseDiagnostics(undefined, '', undefined, document, compiledFilePath, diagnosticCollection);

        const collection = diagnosticCollection.get(document.uri);

        if (collection && collection.length > 0) {
            assert.fail();
        }
    });
});

function stderrSetUp(stdout, rootPath) {
    // Replace file_path_holder in stdout
    const regex = new RegExp(filePathPlaceholder, 'g');
    return stdout.replace(regex, rootPath);
}

/**
 * Converts a given `document` from vscode.TextDocument to vscode-languageserver.TextDocument
 *
 * @param document the document to convert
 * @returns a converted document
 */
function castTextDocument(document: vscode.TextDocument): TextDocument {
    return {
        uri: document.uri.fsPath,
        languageId: document.languageId,
        version: document.version,
        getText(range?: Range): string {
            return document.getText(castRange(range));
        },
        lineCount: document.lineCount,
        positionAt(offset: number): Position {
            const position = document.positionAt(offset);
            return {
                line: position.line,
                character: position.character
            };
        },
        offsetAt(position: Position) {
            return document.offsetAt(castPosition(position));
        }
    };
}

/**
 * Converts a given `range` from vscode-languageserver.Range to vscode.Range
 *
 * @param document the range to convert
 * @returns a converted range
 */
function castRange(range: Range) {
    const startOld = range.start;
    const endOld = range.end;

    const start = new vscode.Position(startOld.line, startOld.character);
    const end = new vscode.Position(endOld.line, endOld.character);

    return new vscode.Range(start, end);
}
/**
 * Converts a given `position` from vscode-languageserver.Position to vscode.Position
 *
 * @param document the position to convert
 * @returns a converted position
 */
function castPosition(position: Position) {
    return new vscode.Position(position.line, position.character);
}
