"use strict";

const fn = {};
window.fn = fn;
fn.stopwatch = stopwatch;

function stopwatch (selector) {
    const $wrap = document.querySelector(selector);
    if ($wrap === null) return false;

    let initTime = 0;
    let addictiveTime = 0;
    let time = 0;
    let lapsArray = [];
    let status = 'stop';

    const $stopwatch = document.createElement('div');
    $stopwatch.classList.add('stopwatch');

    const $stopwatchValue = document.createElement('div');
    $stopwatchValue.classList.add('stopwatch-value');
    $stopwatchValue.innerHTML = ('00:00.00');


    const $stopwatchControls = document.createElement('div');
    $stopwatchControls.classList.add('stopwatch-controls', 'mt-3', 'btn-group');

    const $lapsTable = document.createElement('table');
    const defaultLapsHtml = `
        <tr>
            <td colspan="4"><p>Вы пока еще не добавили ни одного круга</p></td>
        </tr>
    `;
    $lapsTable.classList.add('table', 'table-striped', 'mt-4');

    const $lapsContainer = document.createElement('tbody');
    $lapsContainer.classList.add('laps-container');
    $lapsContainer.innerHTML =  defaultLapsHtml;

    $lapsTable.innerHTML  = `
        <thead>
            <tr>
                <th>Круг</th>
                <th>Время круга</th>
                <th>Общее время</th>
                <th></th>
            </tr>
        </thead>
    `;
    $lapsTable.insertAdjacentElement('beforeend', $lapsContainer);
    $stopwatch.insertAdjacentElement('beforeend', $stopwatchValue );
    $stopwatch.insertAdjacentElement('beforeend', $stopwatchControls );
    $stopwatch.insertAdjacentElement('beforeend', $lapsTable);

    const btnStartHtml = `
<button type="button" class="btn btn-outline-secondary stopwatch-control"
 data-action="start">Старт</button>
`;

    const btnStopHtml = `
<button type="button" class="btn btn-outline-secondary stopwatch-control"
 data-action="stop">Стоп</button>
`;

    const btnPauseHtml = `
<button type="button" class="btn btn-outline-secondary stopwatch-control"
 data-action="pause">Пауза</button>
`;

    const btnLapHtml = `
<button type="button" class="btn btn-outline-secondary stopwatch-control"
 data-action="lap">Круг</button>
`;

    const formatNum = function (value) {
        if (value < 10) {
            return `0${value}`;
        }
        return value;
    };

    const getHoursFormat = function (time) {
        return parseInt(time / 3600000);
    };
    const getMinutesFormat = function (time) {
        return parseInt((time / 60000 ) % 60);
    };
    const getSecondsFormat = function (time) {
        return parseInt((time / 1000) % 60);
    };
    const getMSecondsFormat = function (time) {
        return parseInt((time % 1000) / 10);
    };

    const getTimeFormatString = function (timeObj = {
        h:0,
        m:0,
        s:0,
        ms:0
    }) {
        const {h, m, s, ms} = timeObj;
        const hoursString = h === 0 ? '' : `${formatNum(h)}:`;
        return `${hoursString}${formatNum(m)}:${formatNum(s)}.${formatNum(ms)}`
    };

    const getTimeFormatHtml = function (time) {
        const h = getHoursFormat(time);
        const m = getMinutesFormat(time);
        const s = getSecondsFormat(time);
        const ms = getMSecondsFormat(time);
        return `${getTimeFormatString({h,m,s,ms})}`;
    };

    const doCount = function () {
        const setTime = setInterval(function () {
                if (status !== 'start') {
                    clearInterval(setTime);
                }
                const currentTime = + new Date;
                time = currentTime - initTime + addictiveTime;
                if (status === 'start') {
                    $stopwatchValue.innerHTML = getTimeFormatHtml(time);
                }
            }, 50
        );
    };

    const outputLaps = function () {
        let rows = '';
        const reverseLapsArray = [...lapsArray].reverse();
        const reverseLapsLength = reverseLapsArray.length;

        reverseLapsArray.forEach(function (value, idx, array) {
            let timeLap = idx === reverseLapsLength - 1 ? value : value - array[idx + 1];

            rows += `
            <tr>
                <td>${reverseLapsLength - idx}</td>
                <td>+ ${getTimeFormatHtml(timeLap)}</td>
                <td>${getTimeFormatHtml(value)}</td>
                <td><button type="button" class="btn btn-outline-danger stopwatch-control" data-action="remove-lap" data-id="${reverseLapsLength - 1 - idx}">Удалить</button></td>
            </tr>
        `;
        });

        $lapsContainer.innerHTML = rows;
    };

    const removeLap = function (idx) {
        const copyArray = [... lapsArray];
        const filterArray = copyArray.filter(function (_, i) {
            return i !== idx;
        });
        lapsArray = [... filterArray];

        outputLaps();
    };

    const addControls = function (... controls) {
        let controlsGroupHtml = '';
        controls.forEach(function (control) {
            controlsGroupHtml += control;
        });
        $stopwatchControls.innerHTML = controlsGroupHtml;
    };

    const init = function () {
        $wrap.insertAdjacentElement('beforeend', $stopwatch);
        addControls(btnStartHtml);
    };

    const start = function () {
        addControls(btnLapHtml, btnPauseHtml);
        status = 'start';
        initTime = +new Date();
        doCount();
    };

    const pause = function () {
        addControls(btnStartHtml, btnStopHtml);
        status = 'pause';
        addictiveTime = time;
    };


    const lap = function () {
        lapsArray.push(time);
        outputLaps();
    };


    const stop = function () {
        status = 'stop';
        $stopwatchValue.innerHTML = '00:00.00';
        $lapsContainer.innerHTML = `
        <tr>
            <td colspan="4"><p>Вы пока еще не добавили ни одного круга</p></td>
        </tr>
    `;
        initTime = 0;
        addictiveTime = 0;
        time = 0;
        lapsArray = [];
    };

    $stopwatchControls.addEventListener('click', function (evt) {
        const $stopwatchControl = evt.target.closest('.stopwatch-control');
        if ($stopwatchControl === null) {
            return false;
        }
        const action = $stopwatchControl.dataset.action;

        switch (action) {
            case 'start' :
                start();
                break;
            case 'stop' :
                stop()
                break;
            case 'pause' :
                pause()
                break;
            case 'lap' :
                lap()
                break;
        }
    });

    $lapsContainer.addEventListener('click', function (evt) {
        const evtTarget = evt.target.closest('.stopwatch-control');
        if (evtTarget === null) return false;
        const action = evtTarget.dataset.action;
        if (action === 'remove-lap') {
            const idx = +evtTarget.dataset.id;
            removeLap(idx);
        }
    });

    return {
        init,
        start,
        stop,
        pause,
        lap
    };
}

