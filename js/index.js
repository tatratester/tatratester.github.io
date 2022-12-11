document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const table = document.querySelector('.table');
  const tableRows = document.querySelectorAll('.table__row');
  const tableToTop = document.querySelector('.table__row-top');
  const themeTriggers = document.querySelectorAll('.theme-trigger');
  const modalTriigers = document.querySelectorAll('.modal__trigger');
  const modalContainers = document.querySelectorAll(
    '.modal__container'
  );
  const overlay = document.querySelector('.overlay');
  const bottomBarItems = document.querySelectorAll(
    '.bottom-bar__item'
  );

  function rowHandler(event) {
    const target = event.target;
    const link = target.closest('a');
    const expand = target.closest('.expand');
    const rowTrigger = this.querySelector('.table__trigger-input');
    const labelTrigger = this.querySelector('.table__trigger');
    const isChecked = rowTrigger.checked;

    if (link || expand) {
      return;
    }

    if (!isChecked) {
      const rowTriggerNextState = !rowTrigger.checked;
      rowTrigger.checked = rowTriggerNextState;
      return;
    }

    if (
      target === labelTrigger ||
      target.closest('.table__trigger')
    ) {
      event.preventDefault();
      event.stopPropagation();
      rowTrigger.checked = false;
    }
  }

  function toTopTable() {
    const offset =
      table.getBoundingClientRect().top + window.pageYOffset - 85;

    window.scrollTo({
      top: offset,
      behavior: 'smooth',
    });
  }

  function hiddenHeader() {
    const scrollY = window.scrollY;
    const action = scrollY >= 60 ? 'add' : 'remove';

    header.classList[action]('header_hidden');
  }

  const setLightTheme = () => {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
    localStorage.setItem('pancake-ui', 'theme-light');
    initTheme();
  };

  const setDarkTheme = () => {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
    localStorage.setItem('pancake-ui', 'theme-dark');
    initTheme();
  };

  function switchTheme() {
    const triggerState = this.checked;

    triggerState ? setDarkTheme() : setLightTheme();
  }

  function initTheme(init = false) {
    let triggerState = true;
    const savedTheme = localStorage.getItem('pancake-ui');

    if (
      init &&
      savedTheme &&
      (savedTheme === 'theme-dark' || savedTheme === 'theme-light')
    ) {
      triggerState = savedTheme === 'theme-dark';

      triggerState ? setDarkTheme() : setLightTheme();
    } else {
      triggerState = document.body.classList.contains('theme-dark');
    }

    themeTriggers.forEach((trigger) => {
      trigger.checked = triggerState;
    });
  }

  function modalHandler() {
    const state = this.checked;

    const actionBody = state ? 'add' : 'remove';
    document.body.classList[actionBody]('fixed');
  }

  function hideModals() {
    modalTriigers.forEach((trigger) => {
      trigger.checked = false;
    });
    document.body.classList.remove('fixed');
  }

  function handleOutsideModal(event) {
    const target = event.target;
    const modal = this.querySelector('.modal');

    if (modal.contains(target)) {
      return;
    } else {
      hideModals();
    }
  }

  function bottomItemsHoverHandler(event) {
    const action = event.type === 'mouseover' ? 'add' : 'remove';

    overlay.classList[action]('overlay_active');
  }

  bottomBarItems.forEach((item) => {
    const isHasDropdown = item.querySelector('.bottom-bar__nav-menu');

    if (isHasDropdown) {
      item.addEventListener('mouseover', bottomItemsHoverHandler);
      item.addEventListener('mouseout', bottomItemsHoverHandler);
    }
  });

  tableRows.forEach((row) => {
    row.addEventListener('click', rowHandler, false);
  });

  overlay.addEventListener('click', hideModals);

  themeTriggers.forEach((trigger) => {
    trigger.addEventListener('change', switchTheme);
  });

  modalTriigers.forEach((trigger) => {
    trigger.addEventListener('change', modalHandler);
  });

  modalContainers.forEach((container) => {
    container.addEventListener('click', handleOutsideModal);
  });

  tableToTop.addEventListener('click', toTopTable);

  window.addEventListener('scroll', hiddenHeader);

  initTheme(true);
});
