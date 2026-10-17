function showErr(msg) {
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:0;right:0;top:60px;z-index:99999;background:#400;color:#fff;font:13px monospace;padding:12px;white-space:pre-wrap;word-break:break-all;direction:ltr;text-align:left';
  d.textContent = 'ERROR: ' + msg;
  document.body.appendChild(d);
}
window.addEventListener('error', function (e) {
  showErr(e.message + '\n' + (e.filename || '') + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', function (e) {
  showErr(String(e.reason));
});
