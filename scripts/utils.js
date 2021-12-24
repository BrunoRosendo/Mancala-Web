const $ = (selector) => document.querySelector(selector);

const destroyChildren = (elem) => {
  while (elem.firstChild)
      elem.removeChild(elem.firstChild);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
