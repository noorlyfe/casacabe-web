(function () {
  var screens = [
    'dashboard',
    'sales',
    'expenses',
    'invoices',
    'reports',
    'staff',
    'settings'
  ];

  var minWidth = 400;
  var imagesBase = document.body.getAttribute('data-images-base') || 'images/';

  function imagePath(id) {
    return imagesBase + id + '.png';
  }

  function imageOk(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        if (img.naturalWidth >= minWidth) resolve(src);
        else reject();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  function setupTabs(showcase) {
    var tabs = showcase.querySelectorAll('.showcase-tab');
    var imgs = showcase.querySelectorAll('.showcase-img');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var id = tab.getAttribute('data-screen');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        imgs.forEach(function (img) {
          img.classList.toggle('is-active', img.getAttribute('data-screen') === id);
        });
      });
    });
  }

  function reveal(el) {
    if (!el) return;
    el.hidden = false;
    requestAnimationFrame(function () {
      el.classList.add('is-visible');
    });
  }

  function initHeroPreview() {
    var heroPreview = document.getElementById('hero-preview');
    if (!heroPreview) return;

    imageOk(imagePath('dashboard')).then(function () {
      var dashWindow = document.querySelector('.dash-window');
      if (dashWindow) dashWindow.style.visibility = 'hidden';
      heroPreview.hidden = false;
      reveal(heroPreview);
    }).catch(function () {});
  }

  var showcase = document.getElementById('showcase');
  if (showcase) {
    showcase.querySelectorAll('.showcase-img').forEach(function (img) {
      var id = img.getAttribute('data-screen');
      if (id) img.src = imagePath(id);
    });

    screens.forEach(function (id) {
      imageOk(imagePath(id)).catch(function () {
        var tab = showcase.querySelector('.showcase-tab[data-screen="' + id + '"]');
        var img = showcase.querySelector('.showcase-img[data-screen="' + id + '"]');
        if (tab) tab.remove();
        if (img) img.remove();
      });
    });

    setTimeout(function () {
      var section = document.getElementById('product');
      var tabs = showcase.querySelectorAll('.showcase-tab');
      if (!tabs.length) return;

      setupTabs(showcase);
      tabs[0].click();
      reveal(showcase);

      if (section) section.hidden = false;
    }, 120);
  }

  initHeroPreview();
})();
