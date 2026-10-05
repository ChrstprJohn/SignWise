export function fileProperties(file) {
  const extension = file?.name?.split('.').pop().toLowerCase();
  const format = extension === 'jpg' ? 'jpeg' : extension;
  return {
    file_type: ['pdf', 'docx', 'txt', 'jpeg', 'png', 'webp'].includes(format) ? format : 'other',
    file_size_bytes: Number.isFinite(file?.size) && file.size >= 0 ? file.size : 0,
  };
}

export function reviewCounts(review) {
  return {
    red_flag_count: Array.isArray(review?.redFlags) ? review.redFlags.length : 0,
    good_term_count: Array.isArray(review?.goodTerms) ? review.goodTerms.length : 0,
    question_count: Array.isArray(review?.questions) ? review.questions.length : 0,
  };
}
