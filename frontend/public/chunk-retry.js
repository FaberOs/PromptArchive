(function () {
  try {
    var key = "__studio_suite_chunk_retry__";
    var chunkError = /ChunkLoadError|Failed to load chunk|Loading chunk .* failed/i;
    var reloadOnce = function (reason) {
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
        console.warn("[chunk-retry] Reloading once after chunk error:", reason);
        location.reload();
      } catch {}
    };
    window.addEventListener("error", function (event) {
      var message = (event && event.message) || "";
      if (chunkError.test(message)) reloadOnce(message);
    });
    window.addEventListener("unhandledrejection", function (event) {
      var reason = event && event.reason;
      var message = "";
      if (typeof reason === "string") message = reason;
      else if (reason && typeof reason.message === "string") message = reason.message;
      if (chunkError.test(message)) reloadOnce(message);
    });
  } catch {}
})();
