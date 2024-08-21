export function parseSequenceDiagram(
  sequenceDiagram: string,
  committeeLabel: string
) {
  const lines = sequenceDiagram.split('\n');
  const events: { note: string | null; action: string; time: string | null }[] =
    [];
  let currentNote: string | null = null;

  lines.forEach((line) => {
    line = line.trim();

    if (line.startsWith('Note')) {
      const noteMatch = line.match(/Note.*?\s+(\p{L}.*)/u);
      if (noteMatch) {
        currentNote = noteMatch[1].trim();
        const timeMatch = currentNote.match(
          new RegExp(
            `(before|after)\\s+(\\d+)d\\s+${committeeLabel}|${committeeLabel}\\s+(\\d{4}-\\d{2}-\\d{2})`
          )
        );
        const time = timeMatch ? timeMatch[2] || timeMatch[3] : null;
        events.push({ note: currentNote, action: '', time });
      }
    } else if (line.includes('->>') || line.includes('-->>')) {
      const actionMatch =
        line.match(/(\p{L}+)->>(\p{L}+):\s+(.+)/u) ||
        line.match(/(\p{L}+)-->>(\p{L}+):\s+(.+)/u);
      if (actionMatch) {
        const action = actionMatch[3].trim();
        if (currentNote) {
          const time = events[events.length - 1]?.time || null;
          events[events.length - 1] = { note: currentNote, action, time };
          currentNote = null;
        } else {
          events.push({ note: null, action, time: null });
        }
      }
    }
  });

  return events;
}
