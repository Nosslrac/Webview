import * as vscode from 'vscode';

const graphs = {
	'Default' : "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
};


export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,
		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
	};
}

/**
 * Manages cat coding webview panels
 */
export class GraphView {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: GraphView | undefined;

	public static readonly viewType = 'graph';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (GraphView.currentPanel) {
			GraphView.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			GraphView.viewType,
			'Graph viewer',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		GraphView.currentPanel = new GraphView(panel, extensionUri);
	}

	//If panel is killed, make a new one
	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		GraphView.currentPanel = new GraphView(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	// Clean up our resources on close
	public dispose() {
		GraphView.currentPanel = undefined;

		this._panel.dispose();

		//Dispose all resources
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}


	//TODO: update to relevant graph element
	private _update() {
		const webview = this._panel.webview;
		// Vary the webview's content based on where it is located in the editor.
		switch (this._panel.viewColumn) {
			case vscode.ViewColumn.One:
			default:
				this._updateForGraph(webview, 'Default');
				return;
		}
	}

	//TODO: get correct graphing instance
	private _updateForGraph(webview: vscode.Webview, graphIdentifier: keyof typeof graphs) {
		this._panel.title = graphIdentifier;
		this._panel.webview.html = this._getHtmlForWebview(webview, graphs[graphIdentifier]);
	}

	private _getHtmlForWebview(webview: vscode.Webview, graphScripPath: string) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'bundle.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		/*
		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'assets', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
		//Html css stuff
		<link href="${stylesResetUri}" rel="stylesheet">
		<link href="${stylesMainUri}" rel="stylesheet">

		*/
		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<title>Cat Coding</title>
			</head>
			<body>
				<img src="${graphScripPath}" width="300" />
				<h1 id="lines-of-code-counter">0</h1>
				<svg id="circle"></svg>

				<script nonce="${nonce}" src="${scriptUri}"></script>

			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}