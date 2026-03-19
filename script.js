const container = document.getElementById('array-container');
const sortBtn = document.getElementById('sortBtn');
const resetBtn = document.getElementById('resetBtn');
const sortTypeSelect = document.getElementById('sortType');

const numBars = 30; 
const imageUrl = './sortimage.png'; // 画像のパス

let containerWidth = 0;
let containerHeight = 0;
let barWidth = 0;
let array = [];

const img = new Image();

img.onload = () => {
    // ① 画像の元のサイズを取得
    let originalWidth = img.naturalWidth;
    let originalHeight = img.naturalHeight;

    // ② 画面に収まるようにサイズを調整（最大幅を800pxにする）
    const MAX_WIDTH = 900;
    let scale = 1;
    if (originalWidth > MAX_WIDTH) {
        scale = MAX_WIDTH / originalWidth;
    }

    // 縮小（またはそのまま）のサイズを決定
    containerWidth = originalWidth * scale;
    containerHeight = originalHeight * scale;
    barWidth = containerWidth / numBars;

    // コンテナのサイズを適用
    container.style.width = `${containerWidth}px`;
    container.style.height = `${containerHeight}px`;

    generateArray();
};

img.onerror = () => {
    alert("画像の読み込みに失敗しました。");
};

img.src = imageUrl;

function generateArray() {
    container.innerHTML = '';
    array = [];
    
    let randomValues = [];
    while (randomValues.length < numBars) {
        let val = Math.floor(Math.random() * 1000);
        if (!randomValues.includes(val)) randomValues.push(val);
    }
    randomValues.sort((a, b) => a - b);
    
    let orderedArray = [];
    for (let i = 0; i < numBars; i++) {
        orderedArray.push({
            value: randomValues[i], 
            imgIndex: i             
        });
    }
    
    array = [...orderedArray];
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    
    for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        
        // ★追加：CSSに任せず、JSから直接幅と高さをガッチリ固定する
        bar.style.width = `${barWidth}px`;
        bar.style.height = `${containerHeight}px`;
        
        bar.style.backgroundImage = `url('${imageUrl}')`;
        bar.style.backgroundSize = `${containerWidth}px ${containerHeight}px`;
        bar.style.backgroundPosition = `${-array[i].imgIndex * barWidth}px 0`;
        
        container.appendChild(bar);
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- バブルソート ---
async function bubbleSort() {
    let bars = document.getElementsByClassName('bar');
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            bars[j].classList.add('active');
            bars[j + 1].classList.add('active');
            await sleep(20);

            if (array[j].value > array[j + 1].value) {
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
                
                bars[j].style.backgroundPosition = `${-array[j].imgIndex * barWidth}px 0`;
                bars[j + 1].style.backgroundPosition = `${-array[j + 1].imgIndex * barWidth}px 0`;
            }

            bars[j].classList.remove('active');
            bars[j + 1].classList.remove('active');
        }
        bars[array.length - i - 1].classList.add('sorted');
    }
    bars[0].classList.add('sorted');
}

// --- 選択ソート ---
async function selectionSort() {
    let bars = document.getElementsByClassName('bar');
    for (let i = 0; i < array.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < array.length; j++) {
            bars[minIdx].classList.add('active');
            bars[j].classList.add('active');
            await sleep(20);

            if (array[j].value < array[minIdx].value) {
                bars[minIdx].classList.remove('active');
                minIdx = j;
            } else {
                bars[j].classList.remove('active');
            }
        }
        
        if (minIdx !== i) {
            let temp = array[i];
            array[i] = array[minIdx];
            array[minIdx] = temp;
            
            bars[i].style.backgroundPosition = `${-array[i].imgIndex * barWidth}px 0`;
            bars[minIdx].style.backgroundPosition = `${-array[minIdx].imgIndex * barWidth}px 0`;
        }
        bars[minIdx].classList.remove('active');
        bars[i].classList.add('sorted');
    }
}

// --- 挿入ソート ---
async function insertionSort() {
    let bars = document.getElementsByClassName('bar');
    bars[0].classList.add('sorted');
    for (let i = 1; i < array.length; i++) {
        let keyItem = array[i];
        let j = i - 1;
        
        bars[i].classList.add('active');
        await sleep(20);

        while (j >= 0 && array[j].value > keyItem.value) {
            bars[j].classList.add('active');
            
            array[j + 1] = array[j];
            bars[j + 1].style.backgroundPosition = `${-array[j].imgIndex * barWidth}px 0`;
            
            await sleep(20);
            bars[j].classList.remove('active');
            j--;
        }
        array[j + 1] = keyItem;
        bars[j + 1].style.backgroundPosition = `${-keyItem.imgIndex * barWidth}px 0`;
        bars[i].classList.remove('active');
        
        for(let k = 0; k <= i; k++){
             bars[k].classList.add('sorted');
        }
    }
}

// --- 実行管理 ---
async function startSort() {
    sortBtn.disabled = true;
    resetBtn.disabled = true;
    sortTypeSelect.disabled = true;

    let bars = document.getElementsByClassName('bar');
    if (bars[0].classList.contains('sorted')) {
        generateArray();
        await sleep(100);
    }

    const type = sortTypeSelect.value;
    if (type === 'bubble') {
        await bubbleSort();
    } else if (type === 'selection') {
        await selectionSort();
    } else if (type === 'insertion') {
        await insertionSort();
    }

    sortBtn.disabled = false;
    resetBtn.disabled = false;
    sortTypeSelect.disabled = false;
}

sortBtn.addEventListener('click', startSort);
resetBtn.addEventListener('click', generateArray);