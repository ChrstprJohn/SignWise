import posthog from 'posthog-js';

const token = import.meta.env?.VITE_POSTHOG_TOKEN;
const siteProperties = { site_name: 'signwise', environment: import.meta.env?.MODE || 'development' };

if (token) {
  try {
    posthog.init(token, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: 'history_change',
      person_profiles: 'identified_only',
      disable_session_recording: true,
      capture_exceptions: false,
      capture_performance: false,
      disable_surveys: true,
      // Contracts and AI findings must not enter automatic interaction payloads.
      mask_all_text: true,
      mask_all_element_attributes: true,
      autocapture: { dom_event_allowlist: ['click'], capture_copied_text: false },
      loaded: (client) => client.register(siteProperties),
      before_send: (event) => {
        if (event) event.properties = { ...event.properties, ...siteProperties };
        return event;
      },
    });
  } catch { /* Tracking availability must not interrupt a document review. */ }
}

export function trackEvent(event, properties = {}) {
  if (!token) return;
  try {
    if (!posthog.has_opted_out_capturing()) posthog.capture(event, { ...properties, ...siteProperties });
  } catch { /* Analytics is best effort in restricted or offline browsers. */ }
}
