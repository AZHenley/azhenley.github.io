// Austin Henley, 2026
// with assistance from Claude

(function() {
    const canvas = document.getElementById('ladybug-clock');
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 20;
    const radius = 120;

    // State (0-11, where 0 = 12 o'clock)
    let position = 0;
    let visited = new Set([0]);
    let steps = 0;
    let running = false;
    let animationId = null;
    let lastTick = 0;
    let completedRuns = 0;
    let targetRuns = 100;
    let totalSteps = 0;
    let endCounts = {};
    for (let i = 1; i <= 11; i++) endCounts[i] = 0;

    // DOM
    const speedSlider = document.getElementById('ladybug-speed');
    const speedDisplay = document.getElementById('ladybug-speedDisplay');
    const totalRunsInput = document.getElementById('ladybug-totalRuns');
    const startBtn = document.getElementById('ladybug-startBtn');
    const stopBtn = document.getElementById('ladybug-stopBtn');
    const resetBtn = document.getElementById('ladybug-resetBtn');
    const stepsEl = document.getElementById('ladybug-steps');
    const visitedEl = document.getElementById('ladybug-visited');
    const runCountEl = document.getElementById('ladybug-runCount');
    const avgStepsEl = document.getElementById('ladybug-avgSteps');
    const distributionEl = document.getElementById('ladybug-distribution');

    function getTickInterval() {
        return 1000 / parseInt(speedSlider.value);
    }

    speedSlider.addEventListener('input', () => {
        speedDisplay.textContent = `${speedSlider.value} ticks/sec`;
    });

    function getNumberPosition(num) {
        const angle = (num * 30 - 90) * Math.PI / 180;
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    }

    function toDisplay(pos) {
        return pos === 0 ? 12 : pos;
    }

    function drawClock() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Clock face
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 25, 0, Math.PI * 2);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Numbers
        for (let i = 1; i <= 12; i++) {
            const pos = getNumberPosition(i);
            const internal = i === 12 ? 0 : i;
            const isVisited = visited.has(internal);
            const isCurrent = position === internal;
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
            if (isCurrent) {
                ctx.fillStyle = '#c0392b';
            } else if (isVisited) {
                ctx.fillStyle = '#333';
            } else {
                ctx.fillStyle = '#ddd';
            }
            ctx.fill();
            
            ctx.font = '500 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isCurrent || isVisited ? '#fff' : '#000';
            ctx.fillText(i.toString(), pos.x, pos.y);
        }

        // Ladybug
        const bugPos = getNumberPosition(toDisplay(position));
        drawLadybug(bugPos.x, bugPos.y);
    }

    function drawLadybug(x, y) {
        const bx = x;
        const by = y - 38;
        
        // Shadow
        ctx.beginPath();
        ctx.ellipse(bx, by + 16, 8, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fill();
        
        // Legs
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        // Left legs
        ctx.beginPath();
        ctx.moveTo(bx - 6, by - 2);
        ctx.lineTo(bx - 12, by - 6);
        ctx.moveTo(bx - 7, by + 3);
        ctx.lineTo(bx - 13, by + 3);
        ctx.moveTo(bx - 6, by + 8);
        ctx.lineTo(bx - 12, by + 12);
        ctx.stroke();
        // Right legs
        ctx.beginPath();
        ctx.moveTo(bx + 6, by - 2);
        ctx.lineTo(bx + 12, by - 6);
        ctx.moveTo(bx + 7, by + 3);
        ctx.lineTo(bx + 13, by + 3);
        ctx.moveTo(bx + 6, by + 8);
        ctx.lineTo(bx + 12, by + 12);
        ctx.stroke();
        
        // Body (red shell)
        ctx.beginPath();
        ctx.ellipse(bx, by + 4, 11, 13, 0, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(bx - 3, by, 2, bx, by + 4, 14);
        gradient.addColorStop(0, '#e74c3c');
        gradient.addColorStop(1, '#a93226');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#7b241c';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Wing line
        ctx.beginPath();
        ctx.moveTo(bx, by - 8);
        ctx.lineTo(bx, by + 16);
        ctx.strokeStyle = '#5a1a14';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Spots
        ctx.fillStyle = '#1a1a1a';
        [[-5, by - 1], [5, by - 1], [-4, by + 8], [4, by + 8], [-6, by + 4], [6, by + 4]].forEach(([ox, oy]) => {
            ctx.beginPath();
            ctx.arc(bx + ox, oy, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Head
        ctx.beginPath();
        ctx.ellipse(bx, by - 12, 6, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();
        
        // Antennae
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx - 3, by - 15);
        ctx.quadraticCurveTo(bx - 5, by - 18, bx - 4, by - 19);
        ctx.moveTo(bx + 3, by - 15);
        ctx.quadraticCurveTo(bx + 5, by - 18, bx + 4, by - 19);
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bx - 2.5, by - 13, 2, 0, Math.PI * 2);
        ctx.arc(bx + 2.5, by - 13, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(bx - 2.5, by - 13, 1, 0, Math.PI * 2);
        ctx.arc(bx + 2.5, by - 13, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    function updateStats() {
        stepsEl.textContent = steps;
        visitedEl.textContent = `${visited.size}/12`;
        runCountEl.textContent = `${completedRuns}/${targetRuns}`;
        avgStepsEl.textContent = completedRuns > 0 ? (totalSteps / completedRuns).toFixed(1) : '-';
    }

    function updateDistribution() {
        let html = '';
        const maxCount = Math.max(...Object.values(endCounts), 1);
        
        for (let i = 1; i <= 11; i++) {
            const count = endCounts[i];
            const pct = completedRuns > 0 ? (count / completedRuns * 100) : 0;
            const barWidth = completedRuns > 0 ? (count / maxCount * 100) : 0;
            
            html += `
                <div class="result-bar">
                    <span class="result-num">${i}</span>
                    <div class="result-bar-bg">
                        <div class="result-bar-fill" style="width: ${barWidth}%"></div>
                    </div>
                    <span class="result-pct">${pct.toFixed(1)}%</span>
                </div>
            `;
        }
        distributionEl.innerHTML = html;
    }

    function tick() {
        const direction = Math.random() < 0.5 ? -1 : 1;
        position = (position + direction + 12) % 12;
        visited.add(position);
        steps++;
        
        if (visited.size === 12) {
            completedRuns++;
            totalSteps += steps;
            endCounts[position]++;
            updateDistribution();
            
            if (completedRuns >= targetRuns) {
                stopSimulation();
            } else {
                position = 0;
                visited = new Set([0]);
                steps = 0;
            }
        }
        
        updateStats();
        drawClock();
    }

    function gameLoop(timestamp) {
        if (!running) return;
        
        const interval = getTickInterval();
        const elapsed = timestamp - lastTick;
        const ticksToRun = Math.floor(elapsed / interval);
        
        if (ticksToRun > 0) {
            for (let i = 0; i < ticksToRun && running; i++) {
                tick();
            }
            lastTick = timestamp;
        }
        
        animationId = requestAnimationFrame(gameLoop);
    }

    function startSimulation() {
        targetRuns = parseInt(totalRunsInput.value) || 100;
        running = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        totalRunsInput.disabled = true;
        lastTick = performance.now();
        animationId = requestAnimationFrame(gameLoop);
    }

    function stopSimulation() {
        running = false;
        if (animationId) cancelAnimationFrame(animationId);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        totalRunsInput.disabled = false;
    }

    function resetStats() {
        stopSimulation();
        position = 0;
        visited = new Set([0]);
        steps = 0;
        completedRuns = 0;
        totalSteps = 0;
        for (let i = 1; i <= 11; i++) endCounts[i] = 0;
        updateStats();
        updateDistribution();
        drawClock();
    }

    startBtn.addEventListener('click', startSimulation);
    stopBtn.addEventListener('click', stopSimulation);
    resetBtn.addEventListener('click', resetStats);

    updateStats();
    updateDistribution();
    drawClock();
})();
