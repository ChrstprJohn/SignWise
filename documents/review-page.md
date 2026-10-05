# Review flow and results page

The user-requested flow now has two distinct routes: /review/ for upload and /review/results/ for the completed report. Successful analysis navigates automatically to results. Vite builds a separate HTML entry for each route; the native production server serves both.

Results reading order is Red flags, Good terms, then Follow-up questions. High-priority concerns come first. Each finding has a concise explanation and an optional View clause disclosure for the exact excerpt/location. Follow-up questions identify Missing detail or Unclear wording and explain the specific gap. The AI instructions prohibit generic questions, reconfirming clearly stated terms, invented currencies/examples, and padded finding lists.

A compact section navigation lets readers jump between the three groups. The optional Document overview disclosure contains the factual summary, key terms, and genuine review limits. A single short AI/legal note closes the page. Save review exports the same content order to plain text.

The 850px workspace retains the established ivory/navy/serif design. Results have ruled finding rows, restrained priority labels, 44px controls, clear heading levels, and wrapped mobile text. Keyboard focus moves to the active page heading. Only the visible page owns the main skip-link target.

The upload component remains in memory while results are shown, so Back to upload and browser back/forward preserve the selected file and optional context. Replacing/removing a file, editing context, or starting a new analysis invalidates the old report. No localStorage or sessionStorage is used. A refresh, full-page navigation, or a results link opened in a new tab cannot recover the report; the results page shows a clear upload action instead.

Upload format/size checks, explicit sending, cancel/retry, server-only credentials, extraction, origin restrictions, timeouts, and result validation remain. The user's Gemini key and model settings are preserved. Synthetic documents have verified the live connection; personal documents were not used for QA.

The upload interface uses a centered heading, upload instructions, matched file/photo controls, and disclosure, with consistent 24px group spacing. Its dashed border marks the drop zone. The optional note stays collapsed in one full-width row. Analyze document appears below the disclosure after selecting a file. The disclosure names Google Gemini as the recipient of documents/photos when analysis starts; selecting a file alone does not send it. Selected-file details stay left aligned, and names wrap on narrow screens. The landing FAQ uses the same action names and current results order. Desktop and 375px mobile checks verified alignment, equal control heights, keyboard disclosure access, and no horizontal overflow.
