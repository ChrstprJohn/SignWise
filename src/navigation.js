const NAVIGATION_EVENT = 'signwise:navigate';

export function getPath() {
  return window.location.pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
}

export function subscribeToPath(listener) {
  window.addEventListener('popstate', listener);
  window.addEventListener(NAVIGATION_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(NAVIGATION_EVENT, listener);
  };
}

export function navigateTo(path, event) {
  if (event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
  event?.preventDefault();
  if (window.location.pathname !== path) window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
