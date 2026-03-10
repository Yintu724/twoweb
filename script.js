(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const body = document.body;
  const header = $(".header");
  const menuBtn = $(".btn-menu");
  const overlay = $(".menu-overlay");
  const drawer = $(".menu-drawer");

  const ensureAria = () => {
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", String(isMenuOpen()));
      menuBtn.setAttribute("aria-controls", "mobile-menu");
    }
    if (drawer) {
      drawer.id = drawer.id || "mobile-menu";
      drawer.setAttribute("aria-hidden", String(!isMenuOpen()));
    }
    if (overlay) overlay.setAttribute("aria-hidden", String(!isMenuOpen()));
  };

  const isMenuOpen = () => !!(drawer && drawer.classList.contains("open"));

  const openMenu = () => {
    if (!drawer || !overlay) return;
    drawer.classList.add("open");
    overlay.classList.add("visible");
    body.classList.add("menu-open");
    if (menuBtn) menuBtn.classList.add("active");
    ensureAria();
  };

  const closeMenu = () => {
    if (!drawer || !overlay) return;
    drawer.classList.remove("open");
    overlay.classList.remove("visible");
    body.classList.remove("menu-open");
    if (menuBtn) menuBtn.classList.remove("active");
    ensureAria();
  };

  const toggleMenu = () => (isMenuOpen() ? closeMenu() : openMenu());

  const setupHeaderShadow = () => {
    if (!header) return;
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  };

  const setupMenuEvents = () => {
    if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      // 从手机切到桌面时，避免抽屉残留
      if (window.innerWidth > 768) closeMenu();
    });

    if (drawer) {
      // 点击抽屉里的链接后自动关闭
      $$("#mobile-menu a, .menu-drawer a", drawer).forEach((a) => {
        a.addEventListener("click", () => closeMenu());
      });
    }
  };

  const toast = (() => {
    let el = null;
    let t = null;

    const ensure = () => {
      if (el) return el;
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
      return el;
    };

    return (msg, ms = 1800) => {
      const node = ensure();
      node.textContent = msg;
      node.classList.add("show");
      window.clearTimeout(t);
      t = window.setTimeout(() => node.classList.remove("show"), ms);
    };
  })();

  const setupActionHints = () => {
    const loginBtns = $$(".btn-login, .btn-login-drawer");
    loginBtns.forEach((btn) => btn.addEventListener("click", () => toast("登录功能待接入")));

    $$(".play-btn").forEach((btn) => {
      if (btn.closest(".music-card-link")) return;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        toast("示例页面：播放功能待接入");
      });
    });

    $$(".btn-join").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        toast("报名功能待接入");
      });
    });
  };

  const setupSmoothAnchorsOffset = () => {
    // 对于没有 CSS scroll-margin-top 的情况，做一次兜底
    const links = $$('a[href^="#"]').filter((a) => a.getAttribute("href").length > 1);
    links.forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const y = window.scrollY + target.getBoundingClientRect().top - headerH - 10;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      });
    });
  };

  const setupAnimeSplitCards = () => {
    // 动漫卡片：点击遮罩空白处也跳转到“文字页面”
    $$(".anime-card-split .anime-overlay").forEach((ov) => {
      ov.addEventListener("click", (e) => {
        const t = e.target;
        if (t && t.closest && t.closest("a")) return;
        const link = $(".anime-text-link", ov);
        if (!link) return;
        window.location.href = link.getAttribute("href");
      });
    });
  };

  const init = () => {
    ensureAria();
    setupHeaderShadow();
    setupMenuEvents();
    setupActionHints();
    setupSmoothAnchorsOffset();
    setupAnimeSplitCards();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

