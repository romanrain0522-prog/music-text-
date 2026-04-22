// 游戏常量
const CANVAS_SIZE = 480;
const GRID_SIZE = 8;
// 计算棋盘区域
const BOARD_RATIO = 1750 / 2048; // 棋盘在背景图中的比例
const BOARD_SIZE = Math.floor(CANVAS_SIZE * BOARD_RATIO);
const BOARD_OFFSET = Math.floor((CANVAS_SIZE - BOARD_SIZE) / 2);
const GEM_SIZE = BOARD_SIZE / GRID_SIZE;

// 棋子类型（5种水果）
const GEM_TYPES = 5;

// 特殊棋子类型
const SPECIAL_GEMS = {
    NONE: null,
    STAR: 'star',    // 红色星星
    SUN: 'sun',      // 太阳
    SCYTHE: 'scythe' // 镰刀
};

// 游戏状态
let board = [];
let score = 0;
let highestScore = 0;
let moves = 30;
let selectedGem = null;
let isAnimating = false;
let isGameOver = false;

// 消除文字效果
let comboText = null;
let comboTextTimer = null;

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highestScoreElement = document.getElementById('highest-score');
const movesElement = document.getElementById('moves');
const newGameBtn = document.getElementById('newGameBtn');
const hintBtn = document.getElementById('hintBtn');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('final-score');
const newRecordElement = document.getElementById('new-record');
const restartBtn = document.getElementById('restartBtn');

// 颜色定义
const COLORS = [
    '#FF5252', // 红色（草莓）
    '#FF9800', // 橙色（苹果）
    '#9C27B0', // 紫色（葡萄）
    '#4CAF50', // 绿色（西瓜）
    '#FFEB3B'  // 黄色（爆炸）
];

// 初始化游戏
function initGame() {
    // 加载最高分
    highestScore = parseInt(localStorage.getItem('gem_match_highest_score')) || 0;
    highestScoreElement.textContent = highestScore;
    
    // 重置游戏状态
    score = 0;
    moves = 30;
    selectedGem = null;
    isAnimating = false;
    isGameOver = false;
    comboText = null;
    
    // 更新UI
    scoreElement.textContent = score;
    movesElement.textContent = moves;
    gameOverElement.style.display = 'none';
    
    // 生成初始棋盘
    generateBoard();
}

// 生成初始棋盘
function generateBoard() {
    board = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        board[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            board[y][x] = {
                type: Math.floor(Math.random() * GEM_TYPES),
                special: SPECIAL_GEMS.NONE
            };
        }
    }
    
    // 确保没有初始匹配
    while (getMatches().length > 0) {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                board[y][x] = {
                    type: Math.floor(Math.random() * GEM_TYPES),
                    special: SPECIAL_GEMS.NONE
                };
            }
        }
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 绘制宝石
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            drawGem(x, y, board[y][x]);
        }
    }
    
    // 绘制选中效果
    if (selectedGem) {
        drawSelectedEffect(selectedGem.x, selectedGem.y);
    }
    
    // 绘制消除文字效果
    if (comboText) {
        drawComboText();
    }
}

// 绘制消除文字效果
function drawComboText() {
    if (!comboText) return;
    
    ctx.save();
    ctx.font = '32px Arial';
    ctx.fillStyle = '#FFEB3B';
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    
    // 绘制文字
    ctx.strokeText(comboText.text, comboText.x, comboText.y);
    ctx.fillText(comboText.text, comboText.x, comboText.y);
    
    // 更新文字位置（向上移动）
    comboText.y -= 2;
    
    ctx.restore();
}

// 显示消除文字效果
function showComboText(text, x, y) {
    // 清除之前的文字效果
    if (comboTextTimer) {
        clearTimeout(comboTextTimer);
    }
    
    // 设置新的文字效果
    comboText = {
        text: text,
        x: BOARD_OFFSET + x * GEM_SIZE + GEM_SIZE / 2,
        y: BOARD_OFFSET + y * GEM_SIZE + GEM_SIZE / 2
    };
    
    // 3秒后清除文字效果
    comboTextTimer = setTimeout(() => {
        comboText = null;
    }, 1000);
}

// 绘制棋子
function drawGem(x, y, gem) {
    const xPos = BOARD_OFFSET + x * GEM_SIZE;
    const yPos = BOARD_OFFSET + y * GEM_SIZE;
    
    ctx.save();
    ctx.translate(xPos + GEM_SIZE / 2, yPos + GEM_SIZE / 2);
    
    // 绘制棋子底座（阴影效果）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 绘制特殊棋子
    if (gem.special === SPECIAL_GEMS.STAR) {
        ctx.fillStyle = '#FF5252';
        drawStar(0, 0, GEM_SIZE / 2 - 6, 5, 0.5);
        // 添加高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        drawStar(0, 0, GEM_SIZE / 4 - 3, 5, 0.5);
    } else if (gem.special === SPECIAL_GEMS.SUN) {
        ctx.fillStyle = '#FFEB3B';
        drawSun(0, 0, GEM_SIZE / 2 - 6);
        // 添加高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        drawCircle(0, 0, GEM_SIZE / 6);
    } else if (gem.special === SPECIAL_GEMS.SCYTHE) {
        ctx.fillStyle = '#9C27B0';
        drawScythe(0, 0, GEM_SIZE / 2 - 6);
        // 添加高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, GEM_SIZE / 4 - 2, Math.PI / 2, Math.PI * 3 / 2);
        ctx.lineTo(-(GEM_SIZE / 4 - 2), GEM_SIZE / 4 - 2);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
    } else {
        // 绘制普通水果棋子
        switch (gem.type) {
            case 0: // 草莓
                drawStrawberry(0, 0, GEM_SIZE / 2 - 6);
                break;
            case 1: // 苹果
                drawApple(0, 0, GEM_SIZE / 2 - 6);
                break;
            case 2: // 葡萄
                drawGrapes(0, 0, GEM_SIZE / 2 - 6);
                break;
            case 3: // 西瓜
                drawWatermelon(0, 0, GEM_SIZE / 2 - 6);
                break;
            case 4: // 爆炸
                drawBomb(0, 0, GEM_SIZE / 2 - 6);
                break;
        }
    }
    
    // 清除阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.restore();
}

// 绘制草莓
function drawStrawberry(x, y, size) {
    // 绘制草莓主体
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制草莓种子
    ctx.fillStyle = 'white';
    const seedCount = 8;
    for (let i = 0; i < seedCount; i++) {
        const angle = (Math.PI * 2 / seedCount) * i;
        const seedX = x + Math.cos(angle) * size * 0.6;
        const seedY = y + Math.sin(angle) * size * 0.6;
        ctx.beginPath();
        ctx.arc(seedX, seedY, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制草莓叶子
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.4, y - size * 0.7);
    ctx.lineTo(x - size * 0.2, y - size * 0.5);
    ctx.lineTo(x, y - size * 0.8);
    ctx.lineTo(x + size * 0.2, y - size * 0.5);
    ctx.lineTo(x + size * 0.4, y - size * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // 添加高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制苹果
function drawApple(x, y, size) {
    // 绘制苹果主体
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制苹果梗
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.2, y - size * 1.1);
    ctx.lineTo(x + size * 0.2, y - size * 1.1);
    ctx.closePath();
    ctx.fill();
    
    // 绘制苹果叶子
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x - size * 0.3, y - size * 1.2, x - size * 0.1, y - size * 1.1);
    ctx.quadraticCurveTo(x, y - size * 1.3, x + size * 0.1, y - size * 1.1);
    ctx.quadraticCurveTo(x + size * 0.3, y - size * 1.2, x, y - size);
    ctx.closePath();
    ctx.fill();
    
    // 添加高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制葡萄
function drawGrapes(x, y, size) {
    // 绘制葡萄串
    ctx.fillStyle = '#9C27B0';
    const grapeCount = 5;
    const grapeSize = size * 0.4;
    
    for (let i = 0; i < grapeCount; i++) {
        const angle = (Math.PI * 2 / grapeCount) * i;
        const grapeX = x + Math.cos(angle) * size * 0.5;
        const grapeY = y + Math.sin(angle) * size * 0.5;
        ctx.beginPath();
        ctx.arc(grapeX, grapeY, grapeSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制葡萄梗
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.2, y - size * 0.8);
    ctx.lineTo(x + size * 0.2, y - size * 0.8);
    ctx.closePath();
    ctx.fill();
    
    // 添加高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制西瓜
function drawWatermelon(x, y, size) {
    // 绘制西瓜外皮
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制西瓜果肉
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制西瓜籽
    ctx.fillStyle = 'black';
    const seedCount = 6;
    for (let i = 0; i < seedCount; i++) {
        const angle = (Math.PI * 2 / seedCount) * i;
        const seedX = x + Math.cos(angle) * size * 0.5;
        const seedY = y + Math.sin(angle) * size * 0.5;
        ctx.beginPath();
        ctx.ellipse(seedX, seedY, size * 0.1, size * 0.05, angle, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 添加高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制爆炸
function drawBomb(x, y, size) {
    // 绘制爆炸主体
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制爆炸图案
    ctx.fillStyle = '#FF9800';
    drawStar(x, y, size * 0.7, 8, 0.4);
    
    // 添加高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制圆形
function drawCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制三角形
function drawTriangle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x - size, y + size);
    ctx.closePath();
    ctx.fill();
}

// 绘制方形
function drawSquare(x, y, size) {
    ctx.fillRect(-size / 2, -size / 2, size, size);
}

// 绘制五角星
function drawStar(x, y, outerRadius, points, innerRadiusRatio) {
    const innerRadius = outerRadius * innerRadiusRatio;
    const angle = Math.PI / points;
    
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const currentAngle = angle * i - Math.PI / 2;
        const px = x + Math.cos(currentAngle) * radius;
        const py = y + Math.sin(currentAngle) * radius;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
}

// 绘制六边形
function drawHexagon(x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
}

// 绘制太阳
function drawSun(x, y, radius) {
    // 绘制中心圆
    drawCircle(x, y, radius);
    
    // 绘制太阳光芒
    ctx.strokeStyle = '#FFEB3B';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const startX = x + Math.cos(angle) * (radius + 2);
        const startY = y + Math.sin(angle) * (radius + 2);
        const endX = x + Math.cos(angle) * (radius + 10);
        const endY = y + Math.sin(angle) * (radius + 10);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

// 绘制镰刀
function drawScythe(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, Math.PI / 2, Math.PI * 3 / 2);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
}

// 绘制选中效果
function drawSelectedEffect(x, y) {
    const xPos = BOARD_OFFSET + x * GEM_SIZE;
    const yPos = BOARD_OFFSET + y * GEM_SIZE;
    
    ctx.save();
    ctx.strokeStyle = '#FFEB3B';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#FFEB3B';
    ctx.shadowBlur = 10;
    ctx.strokeRect(xPos + 2, yPos + 2, GEM_SIZE - 4, GEM_SIZE - 4);
    ctx.restore();
}

// 获取匹配的宝石
function getMatches() {
    const matches = [];
    
    // 检查横向匹配
    for (let y = 0; y < GRID_SIZE; y++) {
        let currentType = board[y][0].type;
        let currentSpecial = board[y][0].special;
        let matchStart = 0;
        
        for (let x = 1; x < GRID_SIZE; x++) {
            const gem = board[y][x];
            
            // 特殊宝石不参与普通匹配
            if (gem.special !== SPECIAL_GEMS.NONE || currentSpecial !== SPECIAL_GEMS.NONE) {
                if (x - matchStart >= 3) {
                    for (let i = matchStart; i < x; i++) {
                        matches.push({ x: i, y: y });
                    }
                }
                currentType = gem.type;
                currentSpecial = gem.special;
                matchStart = x;
            } else if (gem.type !== currentType) {
                if (x - matchStart >= 3) {
                    for (let i = matchStart; i < x; i++) {
                        matches.push({ x: i, y: y });
                    }
                }
                currentType = gem.type;
                matchStart = x;
            }
        }
        
        // 检查最后一组
        if (GRID_SIZE - matchStart >= 3) {
            for (let i = matchStart; i < GRID_SIZE; i++) {
                matches.push({ x: i, y: y });
            }
        }
    }
    
    // 检查竖向匹配
    for (let x = 0; x < GRID_SIZE; x++) {
        let currentType = board[0][x].type;
        let currentSpecial = board[0][x].special;
        let matchStart = 0;
        
        for (let y = 1; y < GRID_SIZE; y++) {
            const gem = board[y][x];
            
            // 特殊宝石不参与普通匹配
            if (gem.special !== SPECIAL_GEMS.NONE || currentSpecial !== SPECIAL_GEMS.NONE) {
                if (y - matchStart >= 3) {
                    for (let i = matchStart; i < y; i++) {
                        matches.push({ x: x, y: i });
                    }
                }
                currentType = gem.type;
                currentSpecial = gem.special;
                matchStart = y;
            } else if (gem.type !== currentType) {
                if (y - matchStart >= 3) {
                    for (let i = matchStart; i < y; i++) {
                        matches.push({ x: x, y: i });
                    }
                }
                currentType = gem.type;
                matchStart = y;
            }
        }
        
        // 检查最后一组
        if (GRID_SIZE - matchStart >= 3) {
            for (let i = matchStart; i < GRID_SIZE; i++) {
                matches.push({ x: x, y: i });
            }
        }
    }
    
    return matches;
}

// 检查特殊宝石组合
function checkSpecialGemCombinations() {
    const specialMatches = [];
    
    // 检查横向特殊宝石组合
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x <= GRID_SIZE - 3; x++) {
            const gem1 = board[y][x];
            const gem2 = board[y][x + 1];
            const gem3 = board[y][x + 2];
            
            if (gem1.special && gem1.special === gem2.special && gem1.special === gem3.special) {
                specialMatches.push({ x, y, type: gem1.special, direction: 'horizontal' });
            }
        }
    }
    
    // 检查竖向特殊宝石组合
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y <= GRID_SIZE - 3; y++) {
            const gem1 = board[y][x];
            const gem2 = board[y + 1][x];
            const gem3 = board[y + 2][x];
            
            if (gem1.special && gem1.special === gem2.special && gem1.special === gem3.special) {
                specialMatches.push({ x, y, type: gem1.special, direction: 'vertical' });
            }
        }
    }
    
    return specialMatches;
}

// 处理特殊宝石组合
function handleSpecialGemCombinations() {
    const combinations = checkSpecialGemCombinations();
    
    if (combinations.length > 0) {
        for (const combo of combinations) {
            if (combo.type === SPECIAL_GEMS.STAR) {
                // 三个星星清屏
                clearBoard();
                score += 1000;
                scoreElement.textContent = score;
            } else if (combo.type === SPECIAL_GEMS.SCYTHE) {
                // 三个镰刀清屏
                clearBoard();
            }
        }
        
        // 处理重力掉落和填充
        handleGravity();
        // 再次检查匹配
        setTimeout(checkAndProcessMatches, 300);
    }
}

// 清除整个棋盘
function clearBoard() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            board[y][x] = {
                type: Math.floor(Math.random() * GEM_TYPES),
                special: SPECIAL_GEMS.NONE
            };
        }
    }
}

// 处理匹配
function checkAndProcessMatches() {
    let matches = getMatches();
    let comboMultiplier = 1;
    
    while (matches.length > 0) {
        // 计算得分
        calculateScore(matches.length, comboMultiplier);
        
        // 根据匹配数量显示不同的文字
        if (matches.length >= 3) {
            const firstMatch = matches[0];
            if (matches.length === 3) {
                showComboText('good', firstMatch.x, firstMatch.y);
            } else if (matches.length === 4) {
                showComboText('nice', firstMatch.x, firstMatch.y);
            } else if (matches.length >= 5) {
                showComboText('真棒', firstMatch.x, firstMatch.y);
            }
        }
        
        // 标记要消除的宝石
        const toRemove = new Set();
        for (const match of matches) {
            toRemove.add(`${match.x},${match.y}`);
        }
        
        // 检查是否生成特殊宝石
        generateSpecialGems();
        
        // 移除匹配的宝石
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (toRemove.has(`${x},${y}`) && board[y][x].special === SPECIAL_GEMS.NONE) {
                    board[y][x] = null;
                }
            }
        }
        
        // 处理重力掉落
        handleGravity();
        
        // 再次检查匹配
        matches = getMatches();
        comboMultiplier = updateComboMultiplier(comboMultiplier);
    }
    
    // 检查特殊宝石组合
    handleSpecialGemCombinations();
    
    // 检查游戏是否结束
    if (moves === 0) {
        endGame();
    }
}

// 生成特殊宝石
function generateSpecialGems() {
    // 检查横向匹配长度
    for (let y = 0; y < GRID_SIZE; y++) {
        let currentType = board[y][0].type;
        let currentSpecial = board[y][0].special;
        let matchStart = 0;
        
        for (let x = 1; x < GRID_SIZE; x++) {
            const gem = board[y][x];
            
            if (gem.special !== SPECIAL_GEMS.NONE || currentSpecial !== SPECIAL_GEMS.NONE) {
                checkMatchLength(y, matchStart, x, currentType);
                currentType = gem.type;
                currentSpecial = gem.special;
                matchStart = x;
            } else if (gem.type !== currentType) {
                checkMatchLength(y, matchStart, x, currentType);
                currentType = gem.type;
                matchStart = x;
            }
        }
        
        checkMatchLength(y, matchStart, GRID_SIZE, currentType);
    }
    
    // 检查竖向匹配长度
    for (let x = 0; x < GRID_SIZE; x++) {
        let currentType = board[0][x].type;
        let currentSpecial = board[0][x].special;
        let matchStart = 0;
        
        for (let y = 1; y < GRID_SIZE; y++) {
            const gem = board[y][x];
            
            if (gem.special !== SPECIAL_GEMS.NONE || currentSpecial !== SPECIAL_GEMS.NONE) {
                checkMatchLengthVertical(x, matchStart, y, currentType);
                currentType = gem.type;
                currentSpecial = gem.special;
                matchStart = y;
            } else if (gem.type !== currentType) {
                checkMatchLengthVertical(x, matchStart, y, currentType);
                currentType = gem.type;
                matchStart = y;
            }
        }
        
        checkMatchLengthVertical(x, matchStart, GRID_SIZE, currentType);
    }
    
    // 检查十字消除（镰刀生成条件）
    checkScytheGeneration();
}

// 检查横向匹配长度并生成特殊宝石
function checkMatchLength(y, start, end, type) {
    const length = end - start;
    if (length >= 4) {
        const centerX = Math.floor((start + end) / 2);
        if (board[y][centerX].special === SPECIAL_GEMS.NONE) {
            if (length >= 5) {
                board[y][centerX].special = SPECIAL_GEMS.SUN;
            } else {
                board[y][centerX].special = SPECIAL_GEMS.STAR;
            }
        }
    }
}

// 检查竖向匹配长度并生成特殊宝石
function checkMatchLengthVertical(x, start, end, type) {
    const length = end - start;
    if (length >= 4) {
        const centerY = Math.floor((start + end) / 2);
        if (board[centerY][x].special === SPECIAL_GEMS.NONE) {
            if (length >= 5) {
                board[centerY][x].special = SPECIAL_GEMS.SUN;
            } else {
                board[centerY][x].special = SPECIAL_GEMS.STAR;
            }
        }
    }
}

// 检查镰刀生成条件
function checkScytheGeneration() {
    // 简单实现：检查是否有十字形匹配
    for (let y = 1; y < GRID_SIZE - 1; y++) {
        for (let x = 1; x < GRID_SIZE - 1; x++) {
            const center = board[y][x];
            if (center.special !== SPECIAL_GEMS.NONE) continue;
            
            // 检查横向匹配
            const left = board[y][x - 1];
            const right = board[y][x + 1];
            const horizontalMatch = left.type === center.type && right.type === center.type;
            
            // 检查竖向匹配
            const top = board[y - 1][x];
            const bottom = board[y + 1][x];
            const verticalMatch = top.type === center.type && bottom.type === center.type;
            
            // 如果同时有横向和竖向匹配，生成镰刀
            if (horizontalMatch && verticalMatch) {
                board[y][x].special = SPECIAL_GEMS.SCYTHE;
            }
        }
    }
}

// 处理重力掉落
function handleGravity() {
    // 逐列处理
    for (let x = 0; x < GRID_SIZE; x++) {
        let emptySlots = 0;
        
        // 从下往上检查
        for (let y = GRID_SIZE - 1; y >= 0; y--) {
            if (board[y][x] === null) {
                emptySlots++;
            } else if (emptySlots > 0) {
                // 向下移动宝石
                board[y + emptySlots][x] = board[y][x];
                board[y][x] = null;
            }
        }
        
        // 顶部填充新宝石
        for (let y = 0; y < emptySlots; y++) {
            board[y][x] = {
                type: Math.floor(Math.random() * GEM_TYPES),
                special: SPECIAL_GEMS.NONE
            };
        }
    }
}

// 计算得分
function calculateScore(matchCount, multiplier) {
    let baseScore = 0;
    
    if (matchCount === 3) {
        baseScore = 30;
    } else if (matchCount === 4) {
        baseScore = 60;
    } else if (matchCount === 5) {
        baseScore = 100;
    } else if (matchCount >= 6) {
        baseScore = 150 + (matchCount - 5) * 20;
    }
    
    score += Math.floor(baseScore * multiplier);
    scoreElement.textContent = score;
}

// 更新连击倍率
function updateComboMultiplier(current) {
    if (current === 1) return 1.2;
    if (current === 1.2) return 1.5;
    return 2;
}

// 处理特殊宝石点击
function handleSpecialGemClick(x, y) {
    const gem = board[y][x];
    
    if (gem.special === SPECIAL_GEMS.STAR) {
        // 消除十字形
        let count = 0;
        for (let i = 0; i < GRID_SIZE; i++) {
            if (board[y][i].special === SPECIAL_GEMS.NONE) {
                board[y][i] = null;
                count++;
            }
            if (board[i][x].special === SPECIAL_GEMS.NONE) {
                board[i][x] = null;
                count++;
            }
        }
        // 减去重复计算的中心宝石
        count--;
        score += count * 10;
        scoreElement.textContent = score;
    } else if (gem.special === SPECIAL_GEMS.SUN) {
        // 消除全屏
        let count = 0;
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (board[i][j].special === SPECIAL_GEMS.NONE) {
                    board[i][j] = null;
                    count++;
                }
            }
        }
        score += count * 5;
        scoreElement.textContent = score;
    } else if (gem.special === SPECIAL_GEMS.SCYTHE) {
        // 消除整列
        let count = 0;
        for (let i = 0; i < GRID_SIZE; i++) {
            if (board[i][x].special === SPECIAL_GEMS.NONE) {
                board[i][x] = null;
                count++;
            }
        }
        score += count * 8;
        scoreElement.textContent = score;
    }
    
    // 消耗步数
    moves--;
    movesElement.textContent = moves;
    
    // 处理重力掉落
    handleGravity();
    
    // 检查匹配
    setTimeout(checkAndProcessMatches, 300);
}

// 检查两个宝石是否相邻
function areAdjacent(gem1, gem2) {
    const dx = Math.abs(gem1.x - gem2.x);
    const dy = Math.abs(gem1.y - gem2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

// 交换宝石
function swapGems(gem1, gem2) {
    const temp = board[gem1.y][gem1.x];
    board[gem1.y][gem1.x] = board[gem2.y][gem2.x];
    board[gem2.y][gem2.x] = temp;
}

// 处理点击事件
function handleCanvasClick(e) {
    if (isAnimating || isGameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // 检查点击是否在棋盘区域内
    if (clickX < BOARD_OFFSET || clickX >= BOARD_OFFSET + BOARD_SIZE || clickY < BOARD_OFFSET || clickY >= BOARD_OFFSET + BOARD_SIZE) {
        selectedGem = null;
        return;
    }
    
    // 计算棋子坐标
    const x = Math.floor((clickX - BOARD_OFFSET) / GEM_SIZE);
    const y = Math.floor((clickY - BOARD_OFFSET) / GEM_SIZE);
    
    // 检查坐标是否在网格内
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        selectedGem = null;
        return;
    }
    
    const clickedGem = { x, y };
    
    // 如果点击的是特殊宝石，直接使用
    if (board[y][x].special !== SPECIAL_GEMS.NONE) {
        handleSpecialGemClick(x, y);
        return;
    }
    
    // 如果没有选中宝石，选中当前宝石
    if (!selectedGem) {
        selectedGem = clickedGem;
    } 
    // 如果点击的是已选中的宝石，取消选中
    else if (selectedGem.x === x && selectedGem.y === y) {
        selectedGem = null;
    } 
    // 如果点击的是相邻宝石，尝试交换
    else if (areAdjacent(selectedGem, clickedGem)) {
        // 交换宝石
        swapGems(selectedGem, clickedGem);
        
        // 检查交换后是否有匹配
        const matches = getMatches();
        
        if (matches.length > 0) {
            // 有匹配，消耗步数
            moves--;
            movesElement.textContent = moves;
            
            // 处理匹配
            selectedGem = null;
            checkAndProcessMatches();
        } else {
            // 无匹配，交换回来
            swapGems(selectedGem, clickedGem);
            selectedGem = null;
        }
    } else {
        // 点击了非相邻宝石，重新选中
        selectedGem = clickedGem;
    }
}

// 寻找提示
function findHint() {
    // 简单实现：尝试所有可能的交换，找到能产生匹配的
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            // 尝试向右交换
            if (x < GRID_SIZE - 1) {
                swapGems({ x, y }, { x: x + 1, y });
                if (getMatches().length > 0) {
                    swapGems({ x, y }, { x: x + 1, y });
                    return { x1: x, y1: y, x2: x + 1, y2: y };
                }
                swapGems({ x, y }, { x: x + 1, y });
            }
            
            // 尝试向下交换
            if (y < GRID_SIZE - 1) {
                swapGems({ x, y }, { x, y: y + 1 });
                if (getMatches().length > 0) {
                    swapGems({ x, y }, { x, y: y + 1 });
                    return { x1: x, y1: y, x2: x, y2: y + 1 };
                }
                swapGems({ x, y }, { x, y: y + 1 });
            }
        }
    }
    return null;
}

// 显示提示
function showHint() {
    const hint = findHint();
    if (hint) {
        // 绘制提示效果
        // 绘制第一个宝石的提示
        ctx.save();
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.strokeRect(BOARD_OFFSET + hint.x1 * GEM_SIZE + 2, BOARD_OFFSET + hint.y1 * GEM_SIZE + 2, GEM_SIZE - 4, GEM_SIZE - 4);
        
        // 绘制第二个宝石的提示
        ctx.strokeRect(BOARD_OFFSET + hint.x2 * GEM_SIZE + 2, BOARD_OFFSET + hint.y2 * GEM_SIZE + 2, GEM_SIZE - 4, GEM_SIZE - 4);
        ctx.restore();
    }
}

// 游戏结束
function endGame() {
    isGameOver = true;
    
    // 更新最高分
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('gem_match_highest_score', highestScore);
        highestScoreElement.textContent = highestScore;
        newRecordElement.textContent = '新纪录！';
    } else {
        newRecordElement.textContent = '';
    }
    
    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'flex';
}

// 动画循环
function animate() {
    drawGame();
    requestAnimationFrame(animate);
}

// 事件监听器
canvas.addEventListener('click', handleCanvasClick);
newGameBtn.addEventListener('click', initGame);
hintBtn.addEventListener('click', showHint);
restartBtn.addEventListener('click', initGame);

// 初始化游戏
initGame();

// 启动动画循环
animate();