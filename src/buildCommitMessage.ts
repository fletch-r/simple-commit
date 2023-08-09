import { WorkspaceConfiguration } from 'vscode';
import getIssueNumber from "./getIssueNumber";
import bodyInputBox from "./steps/body/bodyInputBox";
import descriptionInputBox from "./steps/description/descriptionInputBox";
import emojiQuickPick from "./steps/emoji/emojiQuickPick";
import footerInputBox from "./steps/footer/footerInputBox";
import numberInputBox from "./steps/issue_number/numberInputBox";
import chosenScope from "./steps/scope/chosenScope";
import typeQuickPick from "./steps/type/typeQuickPick";
import { Repositories } from './types/git';

export default async function buildCommitMessage(
    step_order: string[],
    workspace_config: WorkspaceConfiguration,
    repo: Repositories,
) {
    const workspace_issue_regex = workspace_config.get('issueRegex') as string;
    const workspace_disable_emoji = workspace_config.get('disableEmoji') as boolean;

    let message_values = {
        type: '',
        scope: '',
        emoji: '',
        ticket_number: '',
        description: '',
        body: '',
        footer: ''
    };

    // === RUN PROMPT'S ===
    for (let current_step = 0; current_step < step_order.length;) {
        const step = step_order[current_step];
        switch (step) {
            case '<type>':
                await typeQuickPick(message_values.type)
                    .then((value: string) => {
                        message_values.type = value;
                        current_step++;
                    });
                break;
            case '<scope>':
                await chosenScope(workspace_config, message_values.scope)
                    .then((value: string) => {
                        message_values.scope = value;
                        current_step++;
                    })
                    .catch(() => current_step--);
                break;
            case '<emoji>':
                if (!workspace_disable_emoji) {
                    await emojiQuickPick(message_values.emoji)
                        .then((value) => {
                            message_values.emoji = value;
                            current_step++;
                        })
                        .catch(() => current_step--);
                } else {
                    message_values.emoji = '';
                    current_step++;
                }
                break;
            case '<number>':
                const head = repo.state.HEAD;
                const issue_number = getIssueNumber(workspace_issue_regex, head);
                await numberInputBox(issue_number, message_values.ticket_number)
                    .then((value: string) => {
                        message_values.ticket_number = value;
                        current_step++;
                    })
                    .catch(() => current_step--);
                break;
            case '<description>':
                await descriptionInputBox(message_values.description)
                    .then((value: string) => {
                        message_values.description = value;
                        current_step++;
                    })
                    .catch(() => current_step--);
                break;
            case '<body>':
                await bodyInputBox(message_values.body)
                    .then((value: string) => {
                        message_values.body = value;
                        current_step++;
                    })
                    .catch(() => current_step--);
                break;
            case '<footer>':
                await footerInputBox(message_values.footer)
                    .then((value: string) => {
                        message_values.footer = value;
                        current_step++;
                    })
                    .catch(() => current_step--);
                break;
            default:
                break;
        }
    }

    return message_values;
}