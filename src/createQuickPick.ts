import * as vscode from 'vscode';

const TOTAL_STEPS = 6;

export type QuickPickItemsType = {
	label: string;
	description: string;
	detail?: string;
};

type Writeable<T> = { -readonly [K in keyof T]: T[K] };

export default function createQuickPick(
	title: string,
	placeholder: string,
	items: QuickPickItemsType[],
	step: number,
	canSelectMany: boolean,
	existing_value?: string,
): Promise<vscode.QuickPickItem[]> {
	return new Promise((resolve, reject) => {
		let current = 0;

		const quickPick = vscode.window.createQuickPick();
		quickPick.title = title;
		quickPick.placeholder = placeholder;
		if (existing_value) {
			quickPick.value = existing_value;
		}

		quickPick.items = items;
		quickPick.activeItems = [quickPick.items[current]];

		quickPick.step = step;
		quickPick.totalSteps = TOTAL_STEPS;
		quickPick.ignoreFocusOut = true;
		quickPick.canSelectMany = canSelectMany;
		quickPick.matchOnDetail = true;

		quickPick.buttons = [
			...(step > 1 ? [vscode.QuickInputButtons.Back] : [])
		];

		let selected: vscode.QuickPickItem[] = [];

		quickPick.onDidChangeSelection((selection) => {
			selected = selection as Writeable<readonly vscode.QuickPickItem[]>;
		});
		quickPick.onDidTriggerButton((e) => {
			if (e === vscode.QuickInputButtons.Back) {
				reject('');
			}
		});
		quickPick.onDidAccept(() => {
			resolve(selected);
		});


		quickPick.show();
	});
}