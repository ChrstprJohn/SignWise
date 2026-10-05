import { useState } from 'react';
import ReviewPage from './ReviewPage.jsx';
import ResultsPage from './ResultsPage.jsx';
import { navigateTo } from './navigation.js';

export default function ReviewFlow({ showingResults }) {
  // Keep the file and report in memory across these two routes. No browser storage.
  const [report, setReport] = useState(null);
  function finishReview(nextReport) {
    setReport(nextReport);
    navigateTo('/review/results/');
  }
  return <>
    <ReviewPage hidden={showingResults} onComplete={finishReview} onInvalidate={() => setReport(null)} />
    {showingResults && <ResultsPage report={report} />}
  </>;
}
