export const KEY_CODES = {
  ENTER: 13,
  ARROW_DOWN: 40,
  ARROW_UP: 38,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  PLUS: 107,
  MINUS: 109,
  SPACE: 32
};

export const bindKey = (keyCode, callback) => {
  return event => {
    let isCode = event.which === keyCode;
    let hasCode = keyCode.length && keyCode.indexOf(event.which) !== -1;
    if (!isCode && !hasCode) {
      return
    }
    event.preventDefault();
    callback(event);
  }
};

export const bindEnterKey = (callback => {
  return bindKey(KEY_CODES.ENTER, callback);
});