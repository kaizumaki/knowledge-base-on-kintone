import { marked } from 'marked';
import mermaid from 'mermaid';
import { generateTaskList } from './utils/taskGenerator';

(() => {
  'use strict';

  mermaid.initialize({ startOnLoad: false });

  marked.setOptions({
    breaks: true,
  });

  // レコード追加・編集画面表示後イベント
  kintone.events.on(['app.record.detail.show'], async (event) => {
    const record = event.record;

    // シーケンス図の表示
    const sequenceText = record.sequence_input_field.value;
    const spaceElementForSequence =
      kintone.app.record.getSpaceElement('sequence-display');
    if (!!sequenceText) {
      spaceElementForSequence.innerHTML = `<pre class="mermaid">${sequenceText}</pre>`;
    }

    // ガントチャートの表示
    const ganttText = record.gantt_input_field.value;
    const spaceElementForGantt =
      kintone.app.record.getSpaceElement('gantt-display');
    if (!!ganttText) {
      spaceElementForGantt.innerHTML = `<pre class="mermaid">${ganttText}</pre>`;
    }

    // 補足事項の表示
    const additionalInformationText =
      record.additional_information_input_field.value;
    const spaceElementForAdditionalInformation =
      kintone.app.record.getSpaceElement('additional-information-display');
    spaceElementForAdditionalInformation.classList.add('markdown-body');
    if (!!additionalInformationText) {
      spaceElementForAdditionalInformation.innerHTML = marked.parse(
        additionalInformationText
      );
    }

    const spaceElementForTaskList =
      kintone.app.record.getSpaceElement('task-list-display');
    if (!!sequenceText) {
      // タスクリストを生成
      const taskListMarkdown: string = generateTaskList(sequenceText);
      // タスクリストの表示
      spaceElementForTaskList.innerHTML = marked.parse(taskListMarkdown);
    }

    mermaid.run({
      querySelector: '.mermaid',
    });

    return event;
  });
})();
