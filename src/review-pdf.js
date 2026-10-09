import { jsPDF } from 'jspdf';

// Embed a local Unicode font; review contents never leave the browser for export.
export async function createReviewPdf(report, fontData) {
  if (!fontData) {
    const response = await fetch('/fonts/NotoSans-Regular.ttf');
    if (!response.ok) throw new Error('PDF font unavailable');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    fontData = btoa(binary);
  }
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pdf.addFileToVFS('NotoSans.ttf', fontData);
  pdf.addFont('NotoSans.ttf', 'NotoSans', 'normal');
  pdf.setFont('NotoSans');
  pdf.setProperties({ title: 'SignWise document review', creator: 'SignWise' });
  let y = 24;
  const newPage = () => { pdf.addPage(); y = 24; };
  function text(value, size = 10, color = '#233244', gap = 4) {
    pdf.setFontSize(size); pdf.setTextColor(color);
    const lines = pdf.splitTextToSize(String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ''), 170);
    const lineHeight = size * 0.3528 * 1.55;
    for (const line of lines) {
      if (y + lineHeight > 275) newPage();
      pdf.text(line, 20, y); y += lineHeight;
    }
    y += gap;
  }
  function heading(label) {
    if (y > 220) newPage();
    y += 5; text(label, 16);
  }
  const { review, filename } = report;
  text('SignWise', 11, '#68665f');
  text('Document review', 24);
  text(filename, 11); text(review.documentType, 10, '#68665f');
  heading('Where to focus');
  text(`${review.redFlags.length} red flags · ${review.goodTerms.length} good terms · ${review.questions.length} questions`);
  const maximum = Math.max(1, review.redFlags.length, review.goodTerms.length, review.questions.length);
  for (const [label, count, color] of [['Red flags', review.redFlags.length, '#97533d'], ['Good terms', review.goodTerms.length, '#233244'], ['Questions', review.questions.length, '#68665f']]) {
    pdf.setFontSize(9); pdf.setTextColor('#233244'); pdf.text(label, 20, y);
    pdf.setFillColor('#e9e5dd'); pdf.rect(55, y - 3, 120, 3, 'F');
    if (count) { pdf.setFillColor(color); pdf.rect(55, y - 3, count / maximum * 120, 3, 'F'); }
    pdf.text(String(count), 185, y); y += 8;
  }
  for (const [label, items] of [['Red flags', review.redFlags], ['Good terms', review.goodTerms]]) {
    heading(label);
    if (!items.length) text('None identified.', 10, '#68665f');
    for (const item of items) {
      if (y > 235) newPage();
      text(item.title, 12);
      if (item.quote) text(`Term: ${item.quote}`, 10);
      text(`Verdict: ${item.explanation}`, 10);
      if (item.location) text(item.location, 9, '#68665f');
      y += 3;
    }
  }
  heading('Questions to ask');
  if (!review.questions.length) text('None identified.', 10, '#68665f');
  review.questions.forEach((item, index) => { text(`${index + 1}. ${item.question}`, 11); text(item.why, 10, '#68665f'); });
  heading('Document overview'); text(review.summary);
  review.keyTerms.forEach(term => { text(`${term.name}: ${term.value}`); if (term.source) text(term.source, 9, '#68665f'); });
  if (review.limitations.length) { heading('Review limits'); review.limitations.forEach(item => text(item)); }
  text('AI can miss details. Check the original. This is not legal advice.', 9, '#68665f');
  const total = pdf.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    pdf.setPage(page); pdf.setFontSize(8); pdf.setTextColor('#68665f');
    pdf.text('SignWise', 20, 288); pdf.text(`${page} / ${total}`, 190, 288, { align: 'right' });
  }
  return pdf;
}
