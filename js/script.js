'use strict';

const palete = document.querySelector('#palete');
const transparent = document.querySelector('#transparent');
const spectrume = document.querySelector('#spectrume');
const colorBlock = document.querySelector('#info-color');

let globalHue = 360;
let globalSaturation = 100;
let globalLightness = 50;
let globalTransparent = 100;

// Инициализируем palete
updatePalete();

let paleteDraggable = palete.querySelector('.palete-draggable');

// paleteDraggable.style.left =
//   ((palete.offsetWidth - paleteDraggable.offsetWidth / 2) /
//     palete.offsetWidth) *
//     100 +
//   '%';
// paleteDraggable.style.top =
//   (-paleteDraggable.offsetHeight / 2 / palete.offsetHeight) * 100 + '%';

paleteDraggable.style.left =
  (((globalSaturation * palete.offsetWidth) / 100 -
    paleteDraggable.offsetWidth / 2) /
    palete.offsetWidth) *
    100 +
  '%';

paleteDraggable.style.top =
  ((palete.offsetHeight *
    (1 -
      globalLightness /
        (100 *
          (1 -
            (globalSaturation * palete.offsetWidth) /
              100 /
              palete.offsetWidth /
              2))) -
    paleteDraggable.offsetHeight / 2) /
    palete.offsetHeight) *
    100 +
  '%';

// Инициализируем transparent
let transparentDraggable = transparent.querySelector('.palete-draggable');

document.querySelector('#info-opacity').textContent = globalTransparent + '%';

transparentDraggable.style.left =
  (((globalTransparent / 100) *
    (transparent.offsetWidth - transparentDraggable.offsetWidth)) /
    transparent.offsetWidth) *
    100 +
  '%';

updateTransparent();

// Инициализируем spectrume
let spectrumeDraggable = spectrume.querySelector('.palete-draggable');

spectrumeDraggable.style.top =
  (((spectrume.offsetHeight - spectrumeDraggable.offsetHeight) *
    (1 - globalHue / 360)) /
    spectrume.offsetHeight) *
    100 +
  '%';

// Инициализируем colorBlock
updateColorBlock();

// Инициализируем коды
updateInfoCodes();

// Drag'n'Drop
document.addEventListener('pointerdown', function (event) {
  const target = event.target;

  if (target.closest('#palete, #transparent, #spectrume')) {
    const draggable = target
      .closest('#palete, #transparent, #spectrume')
      .querySelector('.palete-draggable');

    let moveDraggableTo;
    let draggableMove;

    if (target.closest('#palete')) {
      // palete
      moveDraggableTo = function (clientX, clientY) {
        const x = clientX - palete.getBoundingClientRect().left;
        const y = clientY - palete.getBoundingClientRect().top;
        let left;
        let top;

        if (x < 0) {
          left = 0;
        } else if (x > palete.offsetWidth) {
          left = palete.offsetWidth;
        } else {
          left = x;
        }

        if (y < 0) {
          top = 0;
        } else if (y > palete.offsetHeight) {
          top = palete.offsetHeight;
        } else {
          top = y;
        }

        draggable.style.left =
          ((left - draggable.offsetWidth / 2) / palete.offsetWidth) * 100 + '%';
        draggable.style.top =
          ((top - draggable.offsetHeight / 2) / palete.offsetHeight) * 100 +
          '%';

        return [left, top];
      };

      draggableMove = function (event) {
        const coords = moveDraggableTo(event.clientX, event.clientY);
        changeSAndL(...coords);
        updatePalete();
        updateTransparent();
        updateColorBlock();
        updateInfoCodes();
      };
    } else if (target.closest('#transparent')) {
      // transparent
      const shiftX = target.closest('.palete-draggable')
        ? event.clientX - draggable.getBoundingClientRect().left
        : 0;

      moveDraggableTo = function (clientX) {
        const x = clientX - transparent.getBoundingClientRect().left;
        let left;

        if (x < 0) {
          left = 0;
        } else if (
          x - shiftX >
          transparent.offsetWidth - draggable.offsetWidth
        ) {
          left = transparent.offsetWidth - draggable.offsetWidth;
        } else {
          left = x - shiftX;
        }

        draggable.style.left = (left / transparent.offsetWidth) * 100 + '%';

        return left;
      };

      draggableMove = function (event) {
        const coordX = moveDraggableTo(event.clientX);
        changeTransparent(coordX, draggable);
        updatePalete();
        updateColorBlock();
        updateInfoCodes();
      };
    } else {
      // spectrume
      const shiftY = target.closest('.palete-draggable')
        ? event.clientY - draggable.getBoundingClientRect().top
        : 0;

      moveDraggableTo = function (clientY) {
        const y = clientY - spectrume.getBoundingClientRect().top;
        let top;

        if (y < 0) {
          top = 0;
        } else if (
          y - shiftY >
          spectrume.offsetHeight - draggable.offsetHeight
        ) {
          top = spectrume.offsetHeight - draggable.offsetHeight;
        } else {
          top = y - shiftY;
        }

        draggable.style.top = (top / spectrume.offsetHeight) * 100 + '%';

        return top;
      };
      draggableMove = function (event) {
        const coordY = moveDraggableTo(event.clientY);
        changeHue(coordY, draggable);
        updatePalete();
        updateTransparent();
        updateColorBlock();
        updateInfoCodes();
      };
    }

    // Начало переноса
    draggableMove(event);

    draggable.setPointerCapture(event.pointerId);

    draggable.onpointermove = draggableMove;

    draggable.onlostpointercapture = function () {
      draggable.onpointermove = null;
    };

    draggable.parentElement.ondragstart = () => false;
    draggable.ondragstart = () => false;
  }
});

// Копирование значения кодов при нажатии
document.addEventListener('click', function (event) {
  if (event.target.closest('.code__value')) {
    const textToCopy = event.target.closest('.code__value').value;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert('Текст скопирован в буфер обмена: ' + textToCopy);
      })
      .catch(err => {
        console.error('Ошибка копирования текста: ', err);
        alert('Произошла ошибка при копировании текста');
      });
  }
});

//<Functions>==============================================================================

function changeSAndL(x, y) {
  // Saturation
  if (y == 0 && x !== 0) {
    globalSaturation = 100;
  } else if (y == palete.offsetHeight) {
    globalSaturation = 0;
  } else {
    globalSaturation = (x / palete.offsetWidth) * 100;
  }

  // Lightness
  let max = 100 - (x / palete.offsetWidth / 2) * 100;
  max /= 100;
  globalLightness = 100 * max - (y / palete.offsetHeight) * max * 100;
}

function updatePalete() {
  const defaultGradient =
    'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%)';
  const computedGradient = `linear-gradient(to right, #fff 0%, hsl(${globalHue}, 100%, 50%) 100%)`;

  palete.style.backgroundImage = defaultGradient + ',' + computedGradient;
  palete.style.boxShadow = `40px 55px 100px 20px hsla(${globalHue}, ${globalSaturation}%, ${globalLightness}%, ${
    globalTransparent / 100 / 2
  })`;
}

function changeTransparent(x, draggable) {
  globalTransparent = Math.round(
    (x / (transparent.offsetWidth - draggable.offsetWidth)) * 100,
  );
  globalTransparent = globalTransparent <= 0 ? 0 : globalTransparent;

  document.querySelector('#info-opacity').textContent = globalTransparent + '%';
}

function updateTransparent() {
  const defaultBg = `url('./img/transparent.png') 0 0 / 180px repeat`;
  const computedGradient = `
    linear-gradient(
      to right,
      hsla(
        ${globalHue},
        ${globalSaturation}%,
        ${globalLightness}%, 0
      ) 0%,
      hsl(
        ${globalHue},
        ${globalSaturation}%,
        ${globalLightness}%
      ) 100%
    )
  `;
  transparent.style.background = computedGradient + ',' + defaultBg;
}

function updateColorBlock() {
  const defaultBg = `url('./img/transparent.png') center / cover no-repeat`;
  const computedGradient = `
    linear-gradient(
      to top,
      hsla(
        ${globalHue},
        ${globalSaturation}%,
        ${globalLightness}%,
        ${globalTransparent / 100}
      ) 0%,
      hsla(
        ${globalHue},
        ${globalSaturation}%,
        ${globalLightness}%,
        ${globalTransparent / 100}
      ) 100%
    )
  `;
  colorBlock.style.background = computedGradient + ',' + defaultBg;
}

function changeHue(y, draggable) {
  globalHue = Math.round(
    360 - (y / (spectrume.offsetHeight - draggable.offsetHeight)) * 360,
  );
  globalHue = globalHue <= 0 ? 0 : globalHue;
}

function updateInfoCodes() {
  const hslInfo = document.querySelector('#hsl');
  const hexInfo = document.querySelector('#hex');
  const rgbInfo = document.querySelector('#rgb');

  // HSL
  hslInfo.value = `hsla(${globalHue}, ${Math.round(
    globalSaturation,
  )}%, ${Math.round(globalLightness)}%, ${globalTransparent / 100})`;

  // HEX
  let h = globalHue / 360;
  let s = globalSaturation / 100;
  let l = globalLightness / 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // оттенок серого
  } else {
    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  hexInfo.value = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  // RGB
  rgbInfo.value = `rgba(${Math.round(r * 255)}, ${Math.round(
    g * 255,
  )}, ${Math.round(b * 255)}, ${globalTransparent / 100})`;
}

//</Functions>==============================================================================
