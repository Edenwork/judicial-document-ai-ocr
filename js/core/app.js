(function (global) {
  "use strict";

  const App = (global.JudicialApp = {});
  const listPage = document.getElementById("page-ocr-documents");
  const viewerPage = document.getElementById("page-ocr-viewer");
  const sidebar = document.getElementById("sidebar");
  const sidebarLink = sidebar.querySelector("nav a");
  const mobileMenu = document.getElementById("mobileMenu");
  const toastStack = document.getElementById("toastStack");
  const svgNamespace = "http://www.w3.org/2000/svg";

  function setSidebar(open) {
    sidebar.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-label", open ? "關閉導覽" : "開啟導覽");
  }

  App.goToPage = function (pageName, options = {}) {
    const { documentId, skipHistory, replaceHistory } = options;
    const isViewer = pageName === "ocr-viewer";
    const fromList = listPage.classList.contains("active");

    if (!skipHistory) {
      const url = new URL(location.href);
      url.search = "";
      url.hash = "";
      if (isViewer) {
        url.searchParams.set("page", pageName);
        url.searchParams.set("document", documentId);
      }

      const fromDocumentList = isViewer && (fromList || history.state?.fromDocumentList === true);
      const state = { fromDocumentList };
      if (isViewer && fromList && !replaceHistory) {
        history.pushState(state, "", url);
      } else {
        history.replaceState(state, "", url);
      }
    }

    if (isViewer) App.loadOcrDocument(documentId);
    listPage.classList.toggle("active", !isViewer);
    viewerPage.classList.toggle("active", isViewer);
    if (isViewer) sidebarLink.removeAttribute("aria-current");
    else sidebarLink.setAttribute("aria-current", "page");
    setSidebar(false);
    global.scrollTo(0, 0);
  };

  App.syncPageWithUrl = function () {
    const params = new URLSearchParams(location.search);
    App.goToPage(params.get("page"), {
      documentId: params.get("document"),
      skipHistory: true,
    });
    return params.get("page") === "ocr-viewer" ? "ocr-viewer" : "ocr-documents";
  };

  App.showToast = function (message, variant) {
    const warning = variant === "warning";
    const toast = document.createElement("div");
    const icon = document.createElementNS(svgNamespace, "svg");
    const use = document.createElementNS(svgNamespace, "use");
    const text = document.createElement("span");

    toast.className = warning ? "app-toast app-toast--warning" : "app-toast";
    toast.setAttribute("role", warning ? "alert" : "status");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("class", "app-icon");
    use.setAttribute("href", warning ? "#icon-triangle-alert" : "#icon-circle-check-big");
    icon.append(use);
    text.textContent = message;
    toast.append(icon, text);
    toastStack.append(toast);
    global.setTimeout(() => toast.remove(), 3600);
  };

  mobileMenu.addEventListener("click", () => setSidebar(!sidebar.classList.contains("open")));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
      setSidebar(false);
      mobileMenu.focus();
    }
  });
})(window);
