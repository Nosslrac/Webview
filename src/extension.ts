import * as vscode from 'vscode';
import {getWebviewOptions, GraphView} from './webView';




export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('graphView.showGraph', () => {
			GraphView.createOrShow(context.extensionUri);
		})
	);


	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(GraphView.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				GraphView.revive(webviewPanel, context.extensionUri);
			}
		});
	}
}


