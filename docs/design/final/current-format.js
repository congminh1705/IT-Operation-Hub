/* Theme selection depends on the actual screen, never on capture/QA flags. */
(() => {
  function apply() {
    const login = !!document.querySelector('.access-page,#access-root');
    document.body.classList.toggle('format-v12', !login);
    if (login) document.body.dataset.surface='graphite';
    if (!login) { document.body.dataset.surface='mac-teal'; document.querySelector('meta[name="color-scheme"]')?.setAttribute('content','light'); }
  }
  new MutationObserver(apply).observe(document.querySelector('#root') || document.body,{childList:true,subtree:true});
  addEventListener('hashchange',apply); apply(); window.currentFormatReady=true;
  document.fonts.ready.then(()=>{document.documentElement.dataset.ready='true';});
})();
