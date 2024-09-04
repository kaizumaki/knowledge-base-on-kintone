import { marked } from 'marked';
import mermaid from 'mermaid';

(() => {
  'use strict';

  mermaid.initialize({ startOnLoad: false });

  marked.setOptions({
    breaks: true,
  });

  // 「業務フローインスタンス」アプリのID
  const APP_ID = 2647;

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

    mermaid.run({
      querySelector: '.mermaid',
    });

    return event;
  });

  // レコード編集の保存成功後イベント
  kintone.events.on(
    ['app.record.edit.submit.success', 'app.record.index.edit.submit.success'],
    async (event) => {
      const record = event.record;

      const params = {
        app: APP_ID,
        query: `workflow_id = ${record.$id.value}`,
      };

      try {
        const resp = await kintone.api(
          kintone.api.url('/k/v1/records.json', true),
          'GET',
          params
        );
        // レコードの更新データを用意する
        const updatedWorkflowMasterAppRecords = resp.records.map((record) => {
          return {
            id: record.$id.value,
            record: {
              workflow_id: {
                value: record.workflow_id.value,
              },
            },
          };
        });

        const paramPut = {
          app: APP_ID,
          records: updatedWorkflowMasterAppRecords,
        };
        // ルックアップの更新を行う
        await kintone.api(
          kintone.api.url('/k/v1/records.json', true),
          'PUT',
          paramPut
        );
        // 処理成功のメッセージを表示する
        window.alert('業務フローインスタンスへの参照の更新が完了しました!');
        return event;
      } catch (error) {
        // エラーを表示する
        window.alert(
          '業務フローインスタンスへの参照の更新でエラーが発生しました。\n' +
            error.message
        );
        return event;
      }
    }
  );
})();
