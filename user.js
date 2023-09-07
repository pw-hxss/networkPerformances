// ==UserScript==
// @name         网络性能信息
// @namespace    http://yournamespace/
// @version      0.1
// @description  显示当前网站的IP地址，Ping值和FPS
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建可拖动的浮动菜单
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.top = '50px';
    menu.style.left = '50px';
    menu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    menu.style.color = 'white';
    menu.style.padding = '10px';
    menu.style.fontFamily = 'Arial';
    menu.style.fontSize = '14px';
    menu.style.zIndex = '9999';
    menu.style.cursor = 'move';
    menu.style.borderRadius = '5px';

    let isDragging = false;
    let offsetX, offsetY;

    menu.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - menu.getBoundingClientRect().left;
        offsetY = e.clientY - menu.getBoundingClientRect().top;
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.body.appendChild(menu);

    // 在菜单中创建信息显示元素
    const ipDisplay = document.createElement('div');
    const pingDisplay = document.createElement('div');
    const fpsDisplay = document.createElement('div');

    menu.appendChild(ipDisplay);
    menu.appendChild(pingDisplay);
    menu.appendChild(fpsDisplay);

    // 获取IP地址的函数
    async function getIpAddress() {
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    }

    // 测量当前网站的Ping值的函数
    async function measurePing() {
        const startTime = performance.now();
        const response = await fetch(window.location.href, { method: 'HEAD' });
        const endTime = performance.now();
        const ping = endTime - startTime;
        return ping;
    }

    // 计算FPS的函数
    function measureFPS() {
        const frameTimes = [];
        let lastTime = performance.now();

        function loop() {
            const currentTime = performance.now();
            const elapsed = currentTime - lastTime;
            lastTime = currentTime;
            const fps = 1000 / elapsed;
            frameTimes.push(fps);
            if (frameTimes.length > 60) {
                frameTimes.shift();
            }
            const averageFPS = frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length;
            fpsDisplay.textContent = `FPS: ${isFinite(averageFPS) ? averageFPS.toFixed(2) : '60'}`;
            requestAnimationFrame(loop);
        }

        loop();
    }

    // 更新菜单中的信息显示
    async function updateInfoDisplay() {
        const ip = await getIpAddress();
        ipDisplay.textContent = `IP: ${ip}`;

        const ping = await measurePing();
        pingDisplay.textContent = `Ping: ${ping.toFixed(2)} ms`;

        measureFPS();

        setTimeout(updateInfoDisplay, 500);
    }

    // 开始更新信息显示
    updateInfoDisplay();
})();
