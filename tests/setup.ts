import $ from 'jquery';

Object.assign(globalThis, {$, jQuery: $});
beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('standdeff-organizer-log-level', 'silent');
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/game.php');
});
