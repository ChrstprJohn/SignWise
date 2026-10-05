export function formatReviewText({ review, filename }) {
  return [review.title, `Document: ${filename}`, '', 'RED FLAGS',
    ...review.redFlags.map(item => `${item.title} (${item.severity} priority)\n${item.explanation}${item.quote ? `\nClause: ${item.quote}` : ''}${item.location ? `\nSource: ${item.location}` : ''}\n`),
    '', 'GOOD TERMS', ...review.goodTerms.map(item => `${item.title}\n${item.explanation}${item.quote ? `\nClause: ${item.quote}` : ''}${item.location ? `\nSource: ${item.location}` : ''}\n`),
    '', 'FOLLOW-UP QUESTIONS', ...review.questions.map(item => `${item.kind === 'missing' ? 'Missing detail' : 'Unclear wording'}: ${item.question}\n${item.why}\n`),
    '', 'DOCUMENT OVERVIEW', review.summary, ...review.keyTerms.map(term => `${term.name}: ${term.value}${term.source ? ` (${term.source})` : ''}`),
    '', 'REVIEW LIMITS', ...review.limitations, '', 'AI can miss details. Check the original; this is not legal advice.',
  ].join('\n');
}
