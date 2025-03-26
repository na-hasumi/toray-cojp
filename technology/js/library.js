document.addEventListener('DOMContentLoaded', async () => {
    try {
        // URLパラメータからファイル名を取得
        const urlParams = new URLSearchParams(window.location.search);
        const fileParam = urlParams.get('file');

        let prefix, currentYear;
        
        if (fileParam) {
            // *_nowの場合の処理
            if (fileParam.endsWith('_now')) {
                prefix = fileParam.split('_')[0]; // article または commendation
                const availableYears = await findAvailableYears(prefix);
                if (availableYears.length === 0) {
                    throw new Error('利用可能な年度が見つかりません');
                }
                currentYear = availableYears[0];
            } else {
                [prefix, currentYear] = fileParam.split('_');
            }
        } else {
            prefix = 'article';
            // 利用可能な最新年度を取得
            const availableYears = await findAvailableYears('article');
            if (availableYears.length === 0) {
                throw new Error('利用可能な年度が見つかりません');
            }
            currentYear = availableYears[0];
        }

        // タブの初期化と設定
        initializeTabs(prefix);
        
        // データの読み込みと表示
        await loadAndDisplayData(prefix, currentYear);
        
    } catch (error) {
        console.error('エラー:', error);
        // エラーメッセージをユーザーに表示
        const tableContainer = document.getElementById('article-table');
        tableContainer.innerHTML = `<div class="error-message">エラー: ${error.message}</div>`;
    }
});

async function readCSV(filename) {
    try {
        const response = await fetch(`/technology/library/csv/${filename}`);
        if (!response.ok) {
            throw new Error(`CSVファイルの取得に失敗しました (${response.status})`);
        }
        const csvText = await response.text();
        
        // CSVテキストを行に分割（改行を考慮）
        const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
        
        // 引用符で囲まれた改行を含むフィールドを結合
        const processedLines = [];
        let currentLine = '';
        let insideQuotes = false;
        
        for (const line of lines) {
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    insideQuotes = !insideQuotes;
                }
            }
            
            if (currentLine) {
                currentLine += '\n' + line;
            } else {
                currentLine = line;
            }
            
            if (!insideQuotes) {
                processedLines.push(currentLine);
                currentLine = '';
            }
        }
        
        // ヘッダー行を取得
        const headers = parseCSVLine(processedLines[0]);
        
        // データ行を処理
        const results = processedLines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        return results;
    } catch (error) {
        console.error('CSVの読み込みに失敗しました:', error);
        throw error;
    }
}

function parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                // エスケープされた引用符
                currentValue += '"';
                i++;
            } else {
                // 引用符の開始または終了
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // 値の区切り
            values.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    
    // 最後の値を追加
    values.push(currentValue.trim());
    
    // 引用符を除去
    return values.map(value => {
        if (value.startsWith('"') && value.endsWith('"')) {
            return value.slice(1, -1);
        }
        return value;
    });
}

function createTable(data) {
    const table = document.createElement('table');
    table.classList.add('article-table');

    // テーブルヘッダーの作成
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        // deleteカラムをスキップ
        if (key !== 'delete') {
            const th = document.createElement('th');
            th.textContent = key;
            if (key === '月') {
                th.classList.add('month');
            }
            headerRow.appendChild(th);
        }
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // テーブルボディの作成
    const tbody = document.createElement('tbody');
    let currentMonth = null;
    let monthCell = null;
    let rowspanCount = 0;
    let previousTr = null;  // 前の行を保持する変数を追加

    // 表示する行を先にフィルタリングし、逆順にする
    const visibleRows = data.filter(row => row.delete !== '1').reverse();

    visibleRows.forEach((row, index) => {
        const tr = document.createElement('tr');
        let isFirstColumn = true;

        Object.entries(row).forEach(([key, value]) => {
            if (key === 'delete') return;

            if (isFirstColumn && key === '月') {
                isFirstColumn = false;
                
                // 新しい月が始まる場合
                if (value !== currentMonth) {
                    // 前の月の最後の行にend_trクラスを追加
                    if (previousTr) {
                        previousTr.classList.add('end_tr');
                    }
                    
                    // 前の月のrowspanを設定
                    if (monthCell) {
                        monthCell.rowSpan = rowspanCount;
                    }
                    
                    currentMonth = value;
                    monthCell = document.createElement('td');
                    monthCell.innerHTML = `${value}<span class="_spShow">月</span>`;
                    monthCell.classList.add('month');
                    tr.appendChild(monthCell);
                    rowspanCount = 1;
                } else {
                    rowspanCount++;
                }
            } else {
                const td = document.createElement('td');
                td.innerHTML = value.replace(/\n/g, '<br>');
                tr.appendChild(td);
            }
        });

        tbody.appendChild(tr);
        previousTr = tr;  // 現在の行を保存
    });

    // 最後の月の処理
    if (monthCell) {
        monthCell.rowSpan = rowspanCount;
    }
    // 最後の行にもend_trクラスを追加
    if (previousTr) {
        previousTr.classList.add('end_tr');
    }

    table.appendChild(tbody);
    return table;
}

// 利用可能な年度一覧を動的に取得する関数
async function findAvailableYears(prefix) {
    const currentYear = new Date().getFullYear();
    const years = [];
    const startYear = 2005; // 2005年から検索開始

    for (let year = currentYear; year >= startYear; year--) {
        const fileName = `${prefix}_${year}.csv`;
        try {
            const response = await fetch(`/technology/library/csv/${fileName}`, { method: 'HEAD' });
            if (response.ok) {
                years.push(year.toString());
            }
        } catch (error) {
            console.log(`${year}年のファイルは存在しません`);
        }
    }
    
    return years;
}

// 年度選択セレクトボックスを作成する関数
function createYearSelect(prefix, availableYears, currentYear) {
    const select = document.createElement('select');
    select.classList.add('year-select');
    
    // 年度ごとのオプションを作成
    availableYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年度`;
        if (year === currentYear) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    return select;
}

// タブの初期化
function initializeTabs(currentPrefix) {
    const tabs = document.querySelectorAll('.bl_tab_item');
    const container = document.querySelector('.ly_container');
    
    // ページ読み込み時のクラス設定
    container.classList.remove('is_article', 'is_commendation');
    container.classList.add(`is_${currentPrefix}`);
    
    // ページ読み込み時のアクティブタブ設定
    tabs.forEach(tab => {
        if (tab.dataset.type === currentPrefix) {
            tab.classList.add('is_active');
        }
    });
    
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            try {
                showLoading(); // ローディング開始

                // アクティブクラスの切り替え
                tabs.forEach(t => t.classList.remove('is_active'));
                tab.classList.add('is_active');
                
                const newPrefix = tab.dataset.type;
                // コンテナのクラスを切り替え
                container.classList.remove('is_article', 'is_commendation');
                container.classList.add(`is_${newPrefix}`);
                
                // 新しいプレフィックスで最新年度のデータを読み込む
                const availableYears = await findAvailableYears(newPrefix);
                const latestYear = availableYears[0];
                
                // URLパラメータを更新
                const url = new URL(window.location);
                url.searchParams.set('file', `${newPrefix}_${latestYear}`);
                window.history.pushState({}, '', url);
                
                // データを動的に更新
                await loadAndDisplayData(newPrefix, latestYear);
            } catch (error) {
                console.error('エラー:', error);
            } finally {
                hideLoading(); // ローディング終了
            }
        });
    });
}

// ローディング表示の制御関数を追加
function showLoading() {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';
    // 表示後にクラスを追加してフェードイン
    setTimeout(() => {
        loading.classList.add('is-visible');
    }, 10);
}

function hideLoading() {
    const loading = document.getElementById('loading');
    loading.classList.remove('is-visible');
    // フェードアウト完了後に非表示
    setTimeout(() => {
        loading.style.display = 'none';
    }, 300); // CSSのtransitionと同じ時間（0.3s = 300ms）
}

// データの読み込みと表示
async function loadAndDisplayData(prefix, currentYear) {
    try {
        showLoading(); // ローディング開始
        
        // 利用可能な年度一覧を取得
        const availableYears = await findAvailableYears(prefix);
        if (availableYears.length === 0) {
            throw new Error('利用可能な年度一覧が見つかりません');
        }

        // 最新の年度かどうかをチェック
        const isLatest = currentYear === availableYears[0];
        // タイトルの更新
        updateTitle(prefix, currentYear, isLatest);

        // 年度選択セレクトボックスの作成
        const selectContainer = document.getElementById('select-container');
        selectContainer.innerHTML = ''; // 既存のセレクトボックスをクリア
        const yearSelect = createYearSelect(prefix, availableYears, currentYear);
        
        // CSVデータの読み込みとテーブル表示
        const csvData = await readCSV(`${prefix}_${currentYear}.csv`);
        const tableContainer = document.getElementById('article-table');
        tableContainer.innerHTML = ''; // 既存のテーブルをクリア
        const table = createTable(csvData);
        tableContainer.appendChild(table);

        // 年度選択イベントリスナーを追加
        yearSelect.addEventListener('change', async (event) => {
            try {
                showLoading(); // ローディング開始
                const selectedYear = event.target.value;
                const isLatest = selectedYear === availableYears[0];
                updateTitle(prefix, selectedYear, isLatest);
                
                // URLパラメータを更新
                const url = new URL(window.location);
                url.searchParams.set('file', `${prefix}_${selectedYear}`);
                window.history.pushState({}, '', url);
                
                // 選択された年度のデータを読み込んで表示
                const csvData = await readCSV(`${prefix}_${selectedYear}.csv`);
                const tableContainer = document.getElementById('article-table');
                tableContainer.innerHTML = '';
                const table = createTable(csvData);
                tableContainer.appendChild(table);
            } catch (error) {
                console.error('エラー:', error);
                const tableContainer = document.getElementById('article-table');
                tableContainer.innerHTML = `<div class="error-message">エラー: ${error.message}</div>`;
            } finally {
                hideLoading(); // ローディング終了
            }
        });
        
        selectContainer.appendChild(yearSelect); // 1回だけ追加
    } catch (error) {
        console.error('エラー:', error);
        const tableContainer = document.getElementById('article-table');
        tableContainer.innerHTML = `<div class="error-message">エラー: ${error.message}</div>`;
    } finally {
        hideLoading(); // ローディング終了
    }
}

// タイトルの更新
function updateTitle(prefix, year, isLatest) {
    const heading = document.querySelector('.bl_content_ttl');
    const baseText = prefix === 'article' ? '主要論文' : '受賞歴';
    const latestText = isLatest ? ' 最新' : '';
    heading.textContent = `${year}年度${latestText}`;
}
