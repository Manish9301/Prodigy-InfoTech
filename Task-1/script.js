(function() {
  'use strict';

  var nav = document.querySelector('.site-nav');
  var menu = document.getElementById('primary-menu');
  var toggle = document.querySelector('.site-nav__toggle');
  var dropdownParents = Array.prototype.slice.call(document.querySelectorAll('.has-dropdown'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav__menu a, .site-nav__dropdown a'));

  function updateNavOnScroll() {
    if (!nav) return;
    var shouldApply = window.scrollY > 10;
    nav.classList.toggle('site-nav--scrolled', shouldApply);
  }

  // Mobile menu toggle
  function toggleMenu() {
    if (!nav || !toggle) return;
    var isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  }

  // Smooth scroll with offset for internal anchors
  function handleAnchorClick(event) {
    var href = this.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return; // external
    var target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();

    var navHeight = nav ? nav.offsetHeight : 0;
    var targetTop = target.getBoundingClientRect().top + window.pageYOffset - (navHeight + 12);

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // Close mobile menu after navigation
    if (nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Dropdowns: hover via CSS on desktop; on mobile, toggle submenu on click of parent link
  function setupDropdowns() {
    dropdownParents.forEach(function(parent) {
      var trigger = parent.querySelector('.site-nav__link--dropdown');
      if (!trigger) return;
      trigger.addEventListener('click', function(e) {
        // Only intercept on small screens
        if (window.matchMedia('(max-width: 768px)').matches) {
          e.preventDefault();
          var expanded = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', String(!expanded));
          parent.classList.toggle('is-submenu-open', !expanded);
        }
      });
    });
  }

  // Active link highlighting using IntersectionObserver
  function setupActiveSectionHighlighting() {
    var sectionIds = links
      .map(function(a) { return a.getAttribute('href'); })
      .filter(function(href) { return href && href.startsWith('#') && href.length > 1; })
      .map(function(href) { return href.slice(1); });

    // De-dupe ids
    sectionIds = Array.from(new Set(sectionIds));

    var idToLink = {};
    links.forEach(function(a) {
      var href = a.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        idToLink[href.slice(1)] = a;
      }
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var id = entry.target.id;
        var link = idToLink[id];
        if (!link) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          links.forEach(function(a) { a.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { root: null, threshold: [0.5], rootMargin: '-10% 0px -40% 0px' });

    sectionIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // Footer year
  function updateYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  // Init
  window.addEventListener('scroll', updateNavOnScroll, { passive: true });
  window.addEventListener('load', function() {
    updateNavOnScroll();
    updateYear();
  });
  document.addEventListener('DOMContentLoaded', function() {
    updateNavOnScroll();
    if (toggle) toggle.addEventListener('click', toggleMenu);
    setupDropdowns();
    links.forEach(function(a) { a.addEventListener('click', handleAnchorClick); });
    setupActiveSectionHighlighting();
  });
})(); 
