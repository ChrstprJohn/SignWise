# SignWise dashboard setup

Use the shared PostHog project but create a separate dashboard named **SignWise**. Always filter `site_name = signwise` AND `environment = production` as event properties. This prevents Celestial, SchedSnap, and local development from mixing with SignWise traffic. Check both filters on every insight as well as the dashboard. Default to the last 30 days with daily intervals.

## Copy-paste PostHog AI prompt

```text
Create a dashboard named "SignWise" for the document-review app.
Use ONLY events where event property site_name = signwise AND environment = production.
Apply both filters to every insight and to the dashboard. Default to last 30 days, daily intervals.

Create these insights:
1. Total pageviews ($pageview) and unique visitors (unique users of $pageview), as separate number tiles.
2. Daily pageviews and unique visitors as a trend.
3. Top pages by $pathname, referral sources, and device/browser breakdowns using standard PostHog properties. Use approximate country/city enrichment only; no GPS.
4. Ordered 1-hour user conversion funnel: review_upload_viewed -> document_selected -> document_review_started -> document_review_succeeded -> review_results_viewed (report_available = true) -> review_download_started. Show conversion and drop-off. This is a directional visitor funnel, not an exact per-document transaction funnel.
5. CTA-to-upload funnel: review_started -> review_upload_viewed, broken down by review_started.source. Keep this separate because direct upload visitors skip the CTA.
6. Analysis attempts trend with document_review_started, document_review_succeeded, document_review_failed, and document_review_cancelled (total event counts, not unique users).
7. Daily attempt success rate: document_review_succeeded / document_review_started * 100. Label as event-based; attempts crossing date boundaries can affect it. Return zero or no value when denominator is zero.
8. Failure breakdown by error_type and http_status on document_review_failed, and cancellation breakdown by reason on document_review_cancelled.
9. Median and p95 duration_ms for document_review_succeeded; label in milliseconds.
10. File format and selection source breakdowns from document_selected; file size distribution from file_size_bytes. These are metadata only.
11. Selection rejections by reason and source from document_selection_rejected, and blocked analysis actions from document_review_blocked.
12. Results recovery count: review_results_viewed where report_available = false. Do not treat these as successful reviews.
13. Export activity: review_download_requested, review_download_started, and review_download_failed. Call it "Export started", not "File saved".
14. Numeric review-result distributions from document_review_succeeded: red_flag_count, good_term_count, question_count. Never request document/report contents or use these counts as a measure of legal safety.

Use only actual events/properties present in the project. If events have not arrived, create the supported empty insights and list missing events/settings rather than inventing data. If an insight is unsupported by your tools, explain the manual setup needed.
Do not enable session recordings, surveys, exception capture, or location prompts. Do not collect filenames, uploaded text, user notes, AI summaries, clauses, findings, or review contents.
After creating the dashboard, list its insights, verify both site/environment filters, and report any missing production events.
```

## Before interpreting results

- Ensure production events have arrived. Development events are intentionally excluded.
- Pageview unique users are anonymous browser identities, not verified people. Different browsers/devices can count separately; blockers can undercount.
- The primary funnel begins at the upload screen, so direct arrivals are included. Successful results require `report_available = true`.
- Use total events for attempt health. A cancellation or failure followed by retry is multiple attempts, not duplicate instrumentation.
- Timing is browser-observed, not Gemini-only execution time. Export started is not a confirmed file save.
- Geography is approximate IP-based information; do not expect precise location or complete coverage.
- Session replay remains off. The public ingestion token is not authorization for PostHog AI/admin actions; perform dashboard creation within the correct signed-in PostHog project.
