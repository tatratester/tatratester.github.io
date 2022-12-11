function renderNumber(element) {
  if (!element) {
    return;
  }

  const timeMs = Number(element.dataset.counterTime);
  const startNumericValue = Number(element.dataset.counterStart);
  const endNumericValue = Number(element.dataset.counterEnd);
  const type = element.dataset.counterType || 'number';

  if (startNumericValue === endNumericValue) {
    setValue(endNumericValue);
    return;
  }

  let started = null;
  let ended = false;
  let value = startNumericValue;
  let progress = null;
  let updateValueFreq = 1000 / 30;
  const dividerStep = 1000;
  const sign = endNumericValue >= startNumericValue ? 1 : -1;

  function getRadixesArray(target) {
    const res = [];

    let divider = 1000;
    let currentNumber = target;
    let continueDivide = true;
    let subtractedFromPrev = false;
    let increment = 0;

    while (continueDivide) {
      if (subtractedFromPrev) {
        currentNumber = currentNumber - 1;
        subtractedFromPrev = false;
      }

      const remainder = currentNumber % divider;

      if (remainder === 0) {
        subtractedFromPrev = true;
        increment = divider - 1;
      } else {
        increment = remainder;
      }

      res.unshift(increment);
      currentNumber = currentNumber - increment;
      divider = divider * dividerStep;

      if (currentNumber <= 0) {
        continueDivide = false;
      }
    }

    return res;
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function setValue(value) {
    element.innerHTML = formatValue(value);
  }

  function setValuePercentage(value) {
    element.innerHTML = formatValuePercentage(value);
  }

  function formatValue(value) {
    return numberWithCommas(Math.round(value));
  }

  function formatValuePercentage(value) {
    return `${value.toFixed(2)} %`;
  }

  function getRadixesDeltaArray(start, end) {
    return getRadixesArray(end - start);
  }

  function getApproxNumberOfCalls(time, freq) {
    return time / freq;
  }

  function getIncrementsArray(radixesDelta, radixes, timeIntervalMs) {
    let res = [];
    const approxNumberOfCalls = getApproxNumberOfCalls(
      timeIntervalMs,
      updateValueFreq
    );

    if (radixes.length === 0) {
      return res;
    }

    return radixes.map((radix, i) => {
      return i === 0
        ? (radixesDelta[0] / approxNumberOfCalls) * sign
        : (radix / approxNumberOfCalls) * sign;
    });
  }

  function getBase(initialData, radixIndex) {
    if (radixIndex === 0) {
      return startNumericValue;
    }

    if (sign > 0) {
      return initialData.radixes.reduce((acc, curr, i) => {
        if (i >= radixIndex) {
          return acc;
        }

        return acc + curr;
      });
    }

    return null;
  }

  function getInitialData(startNumber, targetNumber) {
    let radixes, radixesDelta;
    if (targetNumber < startNumber) {
      radixes = getRadixesArray(startNumber);
      radixesDelta = getRadixesDeltaArray(targetNumber, startNumber);
    } else {
      radixes = getRadixesArray(targetNumber);
      radixesDelta = getRadixesDeltaArray(startNumber, targetNumber);
    }

    const timeIntervalMs =
      radixes.length > 0 ? timeMs / radixes.length : 0;
    const increments = getIncrementsArray(
      radixesDelta,
      radixes,
      timeIntervalMs,
      startNumber,
      targetNumber
    );

    return {
      radixes,
      radixesDelta,
      increments,
      timeIntervalMs,
    };
  }

  const isEndEarly = (increment, end) => {
    if (sign > 0) {
      return false;
    }

    return value + increment < end;
  };

  const isEndEarlyPercentage = (increment, end) => {
    if (sign > 0) return value + increment > end;

    return value + increment < end;
  };

  function count(start, end) {
    const initialData = getInitialData(start, end);
    const radixChain = Promise.resolve();

    initialData.radixes.forEach((radix, i) => {
      return radixChain.then(() => {
        return new Promise((resolveRadix) => {
          let resolved = false;

          setTimeout(() => {
            if (!resolved) {
              resolveRadix(true);
              resolved = true;
            }
          }, initialData.timeIntervalMs * (i + 1));

          const timeout = () => {
            setTimeout(() => {
              if (!resolved) {
                const increment = initialData.increments[i];

                if (isEndEarly(increment, end)) {
                  resolveRadix(true);
                  resolved = true;
                  return;
                }

                value = value + increment;
                timeout();
              }
            }, updateValueFreq);
          };

          timeout();
        }).then(() => {
          if (i === initialData.radixes.length - 1) {
            value = endNumericValue;
            ended = true;
          } else {
            value = getBase(initialData, i + 1, end - start) || value;
          }
        });
      });
    });

    return radixChain;
  }

  function countPercentage(start, end) {
    const interval = timeMs;
    const callsNumber = getApproxNumberOfCalls(
      interval,
      updateValueFreq
    );
    const increment = (end - start) / callsNumber;

    const timeout = () => {
      setTimeout(() => {
        if (isEndEarlyPercentage(increment, end)) {
          ended = true;
          return;
        }

        value = value + increment;
        timeout();
      }, updateValueFreq);
    };

    timeout();

    setTimeout(() => {
      setValuePercentage(end);
    }, interval);
  }

  function step(timestamp) {
    if (started === null) {
      started = timestamp;

      if (type === 'number') {
        count(startNumericValue, endNumericValue).then();
      } else {
        countPercentage(startNumericValue, endNumericValue);
      }
    }

    progress = timestamp - started;
    if (type === 'number') {
      setValue(value);
    } else {
      setValuePercentage(value);
    }

    if (!ended) {
      window.requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('[data-counter-id]')
    .forEach((element) => {
      renderNumber(element);
    });
});
