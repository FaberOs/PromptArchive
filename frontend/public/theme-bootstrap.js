(function () {
  try {
    var d = document.documentElement;
    var m = window.matchMedia("(prefers-color-scheme: dark)");
    var apply = function () {
      var stored = null;
      try {
        stored = localStorage.getItem("theme");
      } catch {}
      var dark = stored === "dark" || (!stored && m.matches);
      d.classList.toggle("dark", dark);
      d.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    if (m.addEventListener) m.addEventListener("change", apply);
    else if (m.addListener) m.addListener(apply);
  } catch {}
})();
