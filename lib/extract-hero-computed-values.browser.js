/** Runs inside Puppeteer page context — keep plain JS (no TypeScript). */

function extractHeroComputedValuesInBrowser(patterns) {
  const get = (selector) => document.querySelector(selector);
  const style = (el) => (el ? getComputedStyle(el) : null);
  const gap = (a, b) => {
    if (!a || !b) return null;
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    return Math.round(rectB.top - rectA.bottom);
  };

  const isLegalBoilerplate = (text) =>
    patterns.legalPatternSources.some((source) => new RegExp(source, "i").test(text));

  const isNavLikeCta = (text) => {
    const normalized = text.trim();
    if (!normalized || normalized.length > 48) return true;
    return new RegExp(patterns.navLikePatternSource, "i").test(normalized);
  };

  const isVisibleElement = (el, maxTop = window.innerHeight * 0.9) => {
    const nodeStyle = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const text = (el.innerText || "").trim();
    return (
      text.length > 0 &&
      nodeStyle.display !== "none" &&
      nodeStyle.visibility !== "hidden" &&
      nodeStyle.opacity !== "0" &&
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.top < maxTop
    );
  };

  const hero = get('section:first-of-type, [class*="hero"], main > div:first-child, header + div');
  const heroStyle = style(hero);

  const h1 = get("h1");
  const h1Style = style(h1);

  function findSubheadline() {
    if (!h1) return null;

    const candidates = [];
    const pushCandidate = (el) => {
      if (!el || candidates.includes(el)) return;
      candidates.push(el);
    };

    pushCandidate(h1.nextElementSibling);
    let sibling = h1.nextElementSibling;
    for (let i = 0; i < 4 && sibling; i += 1) {
      pushCandidate(sibling);
      sibling = sibling.nextElementSibling;
    }

    for (const el of Array.from(
      document.querySelectorAll('[class*="sub"], [class*="description"], h1 + p, h1 + h2')
    )) {
      pushCandidate(el);
    }

    for (const el of candidates) {
      const text = (el.innerText || "").trim();
      if (!text || isLegalBoilerplate(text) || text.length < 12) continue;
      if (!isVisibleElement(el)) continue;
      if (Math.abs(el.getBoundingClientRect().top - h1.getBoundingClientRect().bottom) > 320) {
        continue;
      }
      return el;
    }

    return null;
  }

  const sub = findSubheadline();
  const subStyle = style(sub);

  function scoreCta(el) {
    const text = (el.innerText || "").trim();
    if (!text || isNavLikeCta(text)) return -1;
    if (!isVisibleElement(el)) return -1;

    const rect = el.getBoundingClientRect();
    const h1Rect = h1 ? h1.getBoundingClientRect() : null;
    let score = 0;

    if (el.tagName === "BUTTON") score += 12;
    if (/free|trial|start|get started|sign up|try|demo|join|register|book/i.test(text)) {
      score += 18;
    }

    const heroContainer =
      (h1 && h1.closest('section, [class*="hero"], main')) ||
      document.querySelector('[class*="hero"], section:first-of-type, main');

    if (heroContainer && heroContainer.contains(el)) score += 28;

    if (h1Rect) {
      const verticalGap = Math.max(0, rect.top - h1Rect.bottom);
      if (verticalGap <= 360) score += Math.max(0, 24 - Math.floor(verticalGap / 20));
    }

    const inNav = Boolean(el.closest('nav, [role="navigation"]'));
    const inHeader = Boolean(el.closest("header"));
    if (inNav && heroContainer && !heroContainer.contains(el)) score -= 40;
    if (inHeader && heroContainer && !heroContainer.contains(el) && rect.top < 96) score -= 24;

    const className = String(el.className || "").toLowerCase();
    if (/primary|cta|button/.test(className)) score += 10;

    return score;
  }

  function collectCtaCandidates() {
    const selectors = [
      '[class*="hero"] button, [class*="hero"] a[href]',
      'section:first-of-type button, section:first-of-type a[href]',
      'main button, main a[href]',
      'h1 ~ button, h1 ~ a[href]',
      'button[class*="primary"], a[class*="primary"], button[class*="cta"], a[class*="cta"]',
      'header button:not([aria-label*="menu" i])',
      "nav a.btn, nav button",
    ];

    const seen = new Set();
    const candidates = [];
    for (const selector of selectors) {
      for (const el of Array.from(document.querySelectorAll(selector))) {
        if (seen.has(el)) continue;
        seen.add(el);
        candidates.push(el);
      }
    }
    return candidates;
  }

  const rankedCta = collectCtaCandidates()
    .map((el) => ({ el, score: scoreCta(el) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);
  const cta = rankedCta.length > 0 ? rankedCta[0].el : null;
  const ctaStyle = style(cta);

  const nav = get(
    'nav, header nav, [role="navigation"], ' +
      'header ul, header > div > ul, ' +
      '[class*="nav"]:not([class*="icon"]):not([class*="arrow"]), ' +
      '[class*="menu"]:not([class*="hamburger"]):not([class*="mobile"])'
  );

  function isVisibleNavLink(a, maxTop) {
    const s = getComputedStyle(a);
    const rect = a.getBoundingClientRect();
    return (
      s.display !== "none" &&
      s.visibility !== "hidden" &&
      s.opacity !== "0" &&
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.top < maxTop
    );
  }

  let rawNavLinks = nav
    ? Array.from(nav.querySelectorAll("a")).filter((a) =>
        isVisibleNavLink(a, window.innerHeight * 0.3)
      )
    : [];

  if (rawNavLinks.length < 3) {
    const header = document.querySelector("header");
    if (header) {
      const headerLinks = Array.from(header.querySelectorAll("a")).filter((a) =>
        isVisibleNavLink(a, window.innerHeight)
      );
      if (headerLinks.length >= 3) {
        rawNavLinks = headerLinks;
      }
    }
  }

  const uniqueNavLinks = [...new Map(rawNavLinks.map((a) => [a.href, a])).values()];

  const viewportHeight = window.innerHeight;

  const proofSelector =
    '[class*="logo"i], [class*="trust"i], [class*="social"i], ' +
    '[class*="testimonial"i], [class*="review"i], [class*="badge"i], ' +
    '[class*="customer"i], [class*="partner"i], [class*="rating"i], ' +
    '[class*="star"i], [class*="g2"i], [class*="trustpilot"i], ' +
    '[class*="award"i], [class*="press"i], [class*="featured"i], ' +
    '[class*="client"i], img[alt*="logo" i]';

  const proofElements = Array.from(document.querySelectorAll(proofSelector));
  const proofAboveFold = proofElements.some((el) => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.top < viewportHeight * 1.5 && rect.width > 0;
  });
  const socialProofFound = proofElements.length > 0;

  const textFrom = (el) => (el && el.innerText ? el.innerText.trim().slice(0, 120) : null);

  return {
    hero_bg: heroStyle ? heroStyle.backgroundColor : null,
    hero_padding_top: heroStyle ? parseInt(heroStyle.paddingTop, 10) || null : null,
    hero_h1_to_sub_gap: gap(h1, sub),
    hero_sub_to_cta_gap: gap(sub, cta),
    h1_text: textFrom(h1),
    h1_font_size: h1Style ? h1Style.fontSize : null,
    h1_font_weight: h1Style ? h1Style.fontWeight : null,
    h1_color: h1Style ? h1Style.color : null,
    sub_text: textFrom(sub),
    sub_font_size: subStyle ? subStyle.fontSize : null,
    sub_font_weight: subStyle ? subStyle.fontWeight : null,
    sub_color: subStyle ? subStyle.color : null,
    cta_text: cta && cta.innerText ? cta.innerText.trim() : null,
    cta_bg: ctaStyle ? ctaStyle.backgroundColor : null,
    cta_color: ctaStyle ? ctaStyle.color : null,
    cta_border_radius: ctaStyle ? ctaStyle.borderRadius : null,
    cta_font_weight: ctaStyle ? ctaStyle.fontWeight : null,
    nav_link_count: uniqueNavLinks.length,
    nav_link_labels: uniqueNavLinks
      .map((a) => a.innerText.trim())
      .filter(Boolean)
      .slice(0, 10),
    nav_has_sticky: (() => {
      const stickyEl = nav || document.querySelector("header");
      return stickyEl
        ? ["sticky", "fixed"].includes(getComputedStyle(stickyEl).position)
        : false;
    })(),
    social_proof_found: socialProofFound,
    social_proof_above_fold: proofAboveFold,
    card_border_radius: (() => {
      const card = get('[class*="card"], [class*="feature"], section > div > div');
      return card ? getComputedStyle(card).borderRadius : null;
    })(),
    viewport_width: window.innerWidth,
    viewport_height: viewportHeight,
  };
}
