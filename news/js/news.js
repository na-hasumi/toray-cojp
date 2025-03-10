; (function ($, undefined) {
    'use strict';

    const { createClient } = microcms;

    const FilterComp = function () {
        this.client = createClient({
            serviceDomain: '3kxo8u9nf1',
            apiKey: 'ac14fd9441e74441bf3d27c001e7ddb131fb',//本番用
        })
        this.endpoint = 'toray_news';
        this.queryData = document.location.search;
        this.resData = [];
        this.offsetNum = 0;
        this.limitNum = 10;
        this.totalCountNum = 0;
        this.paramQ = '';
        this.paramYear = '';
        this.paramLanguage = [];
        this.paramRegion = [];
        this.paramNewsCategory = '';
        this.paramNewsTag = '';
        this.parambusinessWebsites = [];
        this.paramContentId = '';
        this.filterValue = '';
        this.flagFirst = true;
        this.flagMore = false;
        this.earliestYear = 2012;
        this.yearlists = '';
        this.newsCategoryCurrentLength = 0;
        this.getQueryCount = 0;
    };

    FilterComp.prototype.init = function () {
        this.selector();
        this.onCreate();
        this.eventSet();
    };

    FilterComp.prototype.selector = function () {
        this.filterType = $('#js_setFilter').data('type');
        this.setFilter = $('#js_setFilter').data();
        this.pageType = $('#js_pageType').data('type');
        this.createType = $('#js_getCreateType').val();
        this.setLimit = parseInt($('#js_limit').val());
        this.loading = document.getElementById('js_newsloading');

        //list
        this.selectYear = $('[name="year"]');
        this.radioCategory = $('[name="newsCategory"]');
        this.inputSearch = $('[name="q"]');
        this.radioLanguage = $('[name="language"]');
        this.checkRegion = $('[name="region"]');
        this.selectNewsTag = $('[name="newsTag"]');
        this.filterItems = $('#filterItems');
        this.filterBoxToggle = $('#filterBoxToggle');
        this.buttonBackFilter = $('#filterBackBtn');
        this.detailLink = $('#js_detailLink');
        this.resultWrap = $('.bl_resultWrap');
        this.formBody = $('#dataFilterForm');
        this.buttonSearch = $('#dataSearchBtn');
        this.inputSearchText = $('#dataSearchInput');
        this.buttonReset = $('#dataFilterReset');
        this.buttonFilter = $('#dataFilterSumbmit');
        this.listBody = $('#dataListBody');
        this.yearElm = $('#js_news_yearList');
        this.tabNewsCategory = $('#js_news_categoryList');
        this.buttonMore = $('#dataMoreList');
        this.buttonCategory = '';
        const dataFilterForm = document.getElementById('dataFilterForm');
        if(dataFilterForm){
            this.tabpanelInput = dataFilterForm.querySelectorAll('[role="tabpanel"] input');
        }

        //article
        this.targetArticle = document.getElementById('dy_article');
        this.elmTitle = document.getElementsByTagName('title')[0];
        this.elmHtml = document.getElementsByTagName('html')[0];
        this.htmlLang = this.elmHtml.getAttribute('lang');
        this.ogTitle = document.getElementById('js_og_title');
        this.ogUrl = document.getElementById('js_og_url');
        this.canonical = document.getElementById('js_canonical');
    };

    // ロードイベント
    FilterComp.prototype.onCreate = function () {
        const self = this;

        self.getQueryString();

        // データリクエスト数セット
        if(self.setLimit){
            self.limitNum = parseInt(self.setLimit);
        }

        switch (self.createType) {
            case 'top':
                self.getTopNewsList();
                break;
            case 'list':
                self.formAccessibility();
                self.tab();
                self.filterToggle();
                self.queryDataCreate();
                break;
            case 'article':
                self.apiRequest('');
                break;
        }

        // 年選択リスト生成
        if(self.selectYear){
            const currentYear = new Date().getFullYear();
            for (var i = currentYear; i >= self.earliestYear; i--) {
                self.yearlists += `<option value="${i}">${i}年</option>`;
            }
            self.selectYear.append(self.yearlists);
        }

        // ニュースカテゴリの初期状態セット
        self.radioCategory.each(function(){
            if($(this).prop('checked')){
                self.newsCategoryCurrentLength++;
                $(this).parents('li').addClass('is_current');
            }
        });
        if(self.newsCategoryCurrentLength === 0){
            const current = self.tabNewsCategory.find('li').eq(0);
            current.find('input').prop('checked', true);
            current.addClass('is_current');
        }
    };

    // 各種イベント
    FilterComp.prototype.eventSet = function () {
        const self = this;

        // ニュースカテゴリ
        self.radioCategory.on('change',function(){
            // current処理
            self.tabNewsCategory.find('li').removeClass('is_current');
            $(this).parents('li').addClass('is_current');
            // 検索処理
            self.filterReset();
            self.queryDataCreate();
        });

        // 絞り込むボタン
        // self.buttonFilter.on('click',function() {
        //     self.filterReset();
        //     self.queryDataCreate();
        // });

        // 検索窓
        self.inputSearchText.on('keypress',function(e){
            if (e.code === 'Enter') {
                e.preventDefault();
                self.filterReset();
                self.queryDataCreate();
            }
        });

        // 検索ボタン
        self.buttonSearch.on('click',function() {
            self.filterReset();
            self.queryDataCreate();
        });

        // 年
        self.selectYear.on('change',function(){
            self.filterReset();
            self.queryDataCreate();
        });

        // ニュースタグ
        self.selectNewsTag.on('change',function(){
            self.filterReset();
            self.queryDataCreate();
        })

        // リセットボタン
        self.buttonReset.on('click',function(){
            // current処理
            self.tabNewsCategory.find('li').removeClass('is_current');
            self.tabNewsCategory.find('li').eq(0).addClass('is_current');
            // 検索処理
            self.filterReset();
            self.formBody.get(0).reset();
            self.queryDataCreate();
        });

        // もっと見るボタン
        self.buttonMore.on('click', function(e) {
            e.preventDefault();
            // offset設定する
            self.offsetNum = parseInt(self.offsetNum + self.limitNum);
            // flagMore
            self.flagMore = true;
            // APIリクエスト用
            self.apiRequest(self.filterValue);
            // クエリパラメータ制御（検索インデックス対応）
            const url = new URL(location);
            let pageNum = Number(url.searchParams.get("page"));
            pageNum++;
            url.searchParams.set("page", pageNum);
            if(url.search.length > 0){
                history.pushState('', '', url.href);
            }
        });

        // 絞り込みパネルへ戻るボタン
        self.buttonBackFilter.on('click', function(){
            self.scrolltoElm(self.tabNewsCategory);
        });

        // カテゴリボタン
        $(document).on('click', '#dataListBody .cat', function(e) {
            // e.preventDefault();
            const buttonVal = $(this).data('id');
            self.radioCategory.each(function(){
                const radioval = $(this).val();
                if(buttonVal === radioval){
                    $(this).prop('checked', true);
                    // current処理
                    self.tabNewsCategory.find('li').removeClass('is_current');
                    $(this).parents('li').addClass('is_current');
                    // 検索処理
                    self.filterReset();
                    self.queryDataCreate();
                }
            })
        });

        // 事業セグメントボタン
        $(document).on('click', '#dataListBody .subcat', function(e) {
            // e.preventDefault();
            const buttonVal = $(this).data('id');
            self.selectNewsTag.find('option').each(function(){
                const optval = $(this).val();
                if(buttonVal === optval){
                    $(this).prop('selected', true);
                    // 検索処理
                    self.filterReset();
                    self.queryDataCreate();
                }
            })
        });

        // SNSシェアボタン
        $(document).on('click', '.bl_snsShare a', function(){
            window.open(this.href, 'snswindow', 'width=550, height=450,personalbar=0,toolbar=0,scrollbars=1,resizable=1'); return false;
        });

        // ブラウザバック
        window.addEventListener('popstate', (event) => {
            // alert('絞り込みパラメータはリセットされます');
            // window.location.href = document.location;
        });
    };

    // クエリパラメータpageをリセット
    FilterComp.prototype.filterReset = function(){
        const self = this;
        const url = new URL(location);
        const page = url.searchParams.get('page');
        const existingInput = $('.addParam');
        url.searchParams.set('page', '1');
        history.pushState('', '', url.search);
        // console.log(`pushState : ${url.search}`);
        self.offsetNum = 0;
        self.flagMore = false;
        self.filterValue = '';
        self.listBody.empty();
        existingInput.remove();
    }

    // クエリパラメータをオブジェクトに変換
    FilterComp.prototype.getQueryString = function () {
        const self = this;
        self.paramLanguage = [];
        self.paramRegion = [];
        self.paramNewsCategory = '';
        self.paramNewsTag = '';
        self.parambusinessWebsites = [];
        // console.log(`getQueryString : ${document.location.search}`);

        if (1 < document.location.search.length) {
            let query = document.location.search.substring(1),
                j = 0, k = 0, l = 0, m = 0, n = 0, o = 0,
                parameters = query.split('&');

            for (let i = 0; i < parameters.length; i++) {
                let element = parameters[i].split('='),
                    paramName = decodeURIComponent(element[0]),
                    paramValue = decodeURIComponent(element[1]);

                self.formBody.find('input:not([type="text"])').each(function(){
                    let val = $(this).val(),
                        name = $(this).attr('name');
                    if(paramName === name && paramValue === val){
                        $(this).prop("checked",true);
                    }
                });

                if (paramName == "contentId") {
                    self.paramContentId = paramValue;
                }
                if (paramName == "q") {
                    self.paramQ = paramValue;
                }
                if (paramName == "year") {
                    self.paramYear = paramValue;
                }
                if (paramName == "language") {
                    self.paramLanguage[k] = paramValue;
                    k++;
                }
                if (paramName == "newsCategory") {
                    self.paramNewsCategory = paramValue;
                }
                if (paramName == "newsTag") {
                    self.paramNewsTag = paramValue;
                }
                if (paramName == "region") {
                    self.paramRegion[l] = paramValue;
                    l++;
                }
                if (paramName == "businessWebsites") {
                    self.parambusinessWebsites[o] = paramValue;
                    o++;
                }
                // result[paramName] = decodeURIComponent(paramValue);
            }
            // return result;
        }

        // ニュースタグ　初期状態セット
        if(self.paramNewsTag && self.getQueryCount === 0){
            self.getQueryCount++;
            self.selectNewsTag.find('option').each(function(){
                const optval = $(this).val();
                if(self.paramNewsTag === optval){
                    $(this).prop('selected', true);
                }
            });
        }
        return null;
    }

    // APIリクエスト用クエリ設定
    FilterComp.prototype.queryDataCreate = function () {
        const self = this;

        // 初期化
        self.filterValue = '';

        // クエリ変換
        const setQueryStr = function(param, name){
            let str = '';
            for(let i = 0; i < param.length; i++){
                str += '[or]'+ name +'[contains]' + param[i];
            }
            if(str.slice(0,4) === '\[or\]'){
                str = str.slice(4);
            }
            self.filterValue += '[and](' + str + ')';
        };

        // pageクエリパラメータ操作
        const url = new URL(location);
        const page = url.searchParams.get('page');
        let query = `?${self.formBody.serialize()}`;
        if(page === null || page <= 1 || page === ''){
            query += '&page=1';
        }else{
            const pageNum = url.searchParams.get('page');
            query += `&page=${pageNum}`;
            self.offsetNum = parseInt(self.limitNum * pageNum - self.limitNum);
        }

        if(query.length > 0){
            // history.pushState('', '', location.pathname + query );
            history.pushState('', '', query );
            // console.log(`pushState : ${query}`);
        }

        // URLクエリから設定
        self.getQueryString();

        // year
        if(self.paramYear.length){
            self.filterValue += 'date[contains]' + self.paramYear;
        }
        // language
        if(self.paramLanguage.length){
            setQueryStr(self.paramLanguage, "language");
        }
        // newsCategory
        if(self.paramNewsCategory.length){
            self.filterValue += `[and](newsCategory[equals]${self.paramNewsCategory})`;
        }
        // region
        if(self.paramRegion.length){
            setQueryStr(self.paramRegion, "region");
        }
        // newsTag
        if(self.paramNewsTag.length){
            self.filterValue += '[and]newsTag[contains]' + self.paramNewsTag;
        }
        // businessWebsites
        if(self.parambusinessWebsites.length){
            setQueryStr(self.parambusinessWebsites, "businessWebsites");
        }

        // value文字列整形
        if(self.filterValue.slice(0,5) === '\[and\]'){
            self.filterValue = self.filterValue.slice(5);
        }

        // console.log(self.filterValue);
        self.apiRequest(self.filterValue);

        // TOPページでクエリパラメータを表示しない
        if(self.filterType === 'index'){
            const url = new URL(window.location.href);
            history.replaceState('', '', url.pathname);
        }

    };

     // APIリクエスト
    FilterComp.prototype.apiRequest = function (filtersValue) {
        const self = this;

        switch(self.createType){
            case 'list':
                // loading表示
                self.loading.classList.add("is_show");

                // API
                self.client.get({
                    endpoint: self.endpoint,
                    queries: {
                        limit: self.limitNum,
                        offset: self.offsetNum,
                        q : self.paramQ,
                        orders: '-date,-publishedAt,-createdAt',
                        fields: 'id,date,language,region,newsCategory,newsTag,businessWebsites,title,directLink,thumbnail',
                        filters: filtersValue
                    }
                })
                .then((res) => {
                    // console.log(res);
                    self.totalCountNum = res.totalCount;
                    self.filterListCreate(res.contents);
                })
                .catch((err) => console.log(err));
                break;

            case 'article':
                //loading表示
                self.loading.classList.add("is_show");
                self.client.get({
                    endpoint: self.endpoint,
                    contentId: self.paramContentId,
                    fields: 'id,date,language,newsCategory,newsTag,title,author,article,importArticle',
                })
                .then((res) => {
                    self.totalCountNum = res.totalCount;
                    self.articleCreate(res);
                })
                .catch((err) => console.log(err));
                break;
        }
    };

    // 検索結果のリスト生成
    FilterComp.prototype.filterListCreate = function(data, category) {
        const self = this;
        let str = '';
        let listData = data;

        // 値が存在しない場合は[aria-hidden="true"]で非表示にする
        let dataBool = (val) => {
            if( val === undefined || val === null){
                return true
            }else{
                return false;
            }
        }

        if (listData.length) {
            for (let i in listData) {
                //id,date,language,region,newsCategory,newsTag,title,directLink,thumbnail
                let itemId = listData[i].id,
                    itemDate = listData[i].date,
                    // itemDatetime = String(listData[i].date.slice(0,10)),
                    itemDatetime = self.dateTimeTransformation(itemDate),
                    itemDateText = self.localTimeTransformation(itemDate),
                    itemLanguage = listData[i].language,
                    itemRegion = listData[i].region,
                    itemNewsCategory = listData[i].newsCategory,
                    itemNewsTag = listData[i].newsTag,
                    itembusinessWebsites = listData[i].businessWebsites,
                    itemTitle = listData[i].title,
                    itemDirectLink = listData[i].directLink,
                    itemThumbnail = listData[i].thumbnail,
                    elmTitle = '',
                    elmThumb = '',
                    elmNewsTag = '',
                    elmCategory = '',
                    newsUrl = `/news/?language=${self.radioLanguage.val()}&region=${self.checkRegion.val()}&q=&page=1`;

                // サムネイル
                if(itemThumbnail == undefined){
                    itemThumbnail = '/shared/images/thumb_noimage.jpg';
                }else{
                    itemThumbnail = String(itemThumbnail.url);
                }

                // ニュースカテゴリ
                if(itemNewsCategory !== undefined && itemNewsCategory !== null){
                    const id = itemNewsCategory.id;
                    let categoryName = '';
                    if(self.htmlLang === 'ja'){
                        categoryName = itemNewsCategory.name_ja;
                    }else{
                        categoryName = itemNewsCategory.name_en;
                    }

                    // トップページからニュースカテゴリボタンで遷移
                    if(self.filterType === 'index'){
                        const url = `${newsUrl}&newsCategory=${id}`;
                        elmCategory = `<a href="${url}" class="cat">${categoryName}</a>`;
                    // ニュース一覧
                    }else{
                        elmCategory = `<a href="javascript:;" class="cat" data-id="${id}">${categoryName}</a>`;
                    }
                }

                // ニュースタグ
                if(itemNewsTag !== undefined && itemNewsTag !== null){
                    itemNewsTag.forEach(el => {
                        const id = el.id;
                        let newsTagName = '';
                        if(self.htmlLang === 'ja'){
                            newsTagName = el.name_ja;
                        }else{
                            newsTagName = el.name_en;
                        }

                        // トップページからニュースカテゴリボタンで遷移
                        if(el.id !== 'other'){
                            if(self.filterType === 'index'){
                                const url = `${newsUrl}&newsTag=${id}`;
                                elmNewsTag = `<a href="${url}" class="subcat">${newsTagName}</a>`;
                            // ニュース一覧
                            }else{
                                elmNewsTag += `<a href="javascript:;" class="subcat" data-id="${id}">${newsTagName}</a>`;
                            }
                        }
                    });
                }

                // URL
                if(itemDirectLink !== undefined){
                    elmThumb = `<a href="${itemDirectLink}" target="_blank" rel="noreferrer"><img class="lazyload" data-src="${itemThumbnail}" alt=""></a>`;
                    elmTitle = `<a href="${itemDirectLink}" target="_blank" rel="noreferrer" class="_iconWindow">${itemTitle}</a>`;
                }else{
                    elmThumb = `<a href="/news/article.html?contentId=${itemId}"><img class="lazyload" data-src="${itemThumbnail}" alt=""></a>`;
                    elmTitle = `<a href="/news/article.html?contentId=${itemId}">${itemTitle}</a>`;
                }

                str += `
                <div class="bl_card">
                    <figure class="cardImg">
                        ${elmThumb}
                    </figure>
                    <div class="cardBody">
                        <time class="date" datetime="${itemDatetime}">${itemDateText}</time>
                        <div class="tags">
                            ${elmCategory}
                            ${elmNewsTag}
                        </div>
                        <p class="title">${elmTitle}</p>
                    </div>
                </div>`;
            }
        } else {
            str = self.htmlItem('norecord');
        }

        // HTML書き出し
        if (category === 'press') {
            $('#js_news_press').html(str);
        } else if (category === 'infomation') {
            $('#js_news_information').html(str);
        } else {
            self.listBody.append(str);

            // 「もっと見る」表示制御
            if(self.totalCountNum > self.limitNum + self.offsetNum){
                const url = new URL(location);
                let pageNum = Number(url.searchParams.get("page"));
                pageNum++;
                url.searchParams.set("page", pageNum);
                self.buttonMore.addClass('is_show').attr('href', url.href);
            }else{
                self.buttonMore.removeClass('is_show');
            }

            // 検索結果にスクロール
            if(!self.flagFirst && !self.flagMore){
                self.scrolltoElm(self.listBody);
            }
            self.flagFirst = false;
        }

        // loading非表示
        // self.resultWrap.delay(800).removeClass('-nowloading');
        self.loading.classList.remove("is_show");
    };

    // 記事詳細生成
    FilterComp.prototype.articleCreate = function(data) {
        const self = this;
        let str = '';
        let tags = '';
        let post = '<div class="post">';

        if (data) {
            // id,date,language,region,newsCategory,newsTag,title,author,article,importArticle
            let itemId = data.id,
                itemDate = data.date,
                itemDatetime = self.dateTimeTransformation(itemDate),
                itemLanguage = data.language,
                itemNewsCategory = data.newsCategory,
                itemNewsTag = data.newsTag,
                itemTitle = self.strTextBreak(data.title),
                itemAuthor = self.strTextBreak(data.author),
                itemArticle = data.article,
                itemImportArticle = data.importArticle,
                strTitle = '';

            // 言語
            self.paramLanguage = itemLanguage;
            let itemDateText = self.localTimeTransformation(itemDate);

            // titleからタグ削除
            if(itemTitle !== undefined){
                strTitle = itemTitle.replace(/<br>/g, "").replace(/<sup>/g, "").replace(/<\/sup>/g, "");
            }

            // page title
            if(self.createType === 'article'){
                self.elmTitle.innerHTML = strTitle + self.elmTitle.textContent;
            }

            // og:title
            if(self.ogTitle){
                const currentContent = self.ogTitle.getAttribute('content');
                const newContent = strTitle + currentContent;
                self.ogTitle.setAttribute('content', newContent);
            }

            // og:url
            if(self.ogUrl){
                const currentContent = self.ogUrl.getAttribute('content');
                const newContent = `${currentContent}?contentId=${itemId}`;
                self.ogUrl.setAttribute('content', newContent);
            }

            // canonical
            if (self.canonical) {
                const currentHref = self.canonical.getAttribute('href');
                const newHref = `${currentHref}?contentId=${itemId}`;
                self.canonical.setAttribute('href', newHref);
            }

            // author
            if(itemAuthor === undefined){
                itemAuthor = '';
            }

            // 特殊文字変換
            const replaceSpecialEntities = (text) => {
                return text.replace(/&amp;reg;/g, '®')
                .replace(/&amp;trade;/g, '™')
                .replace(/&amp;copy;/g, '©')
                .replace(/&amp;amp;/g, '&')
                .replace(/&amp;quot;/g, '"')
                .replace(/&amp;plusmn;/g, '±')
                .replace(/&amp;lt;/g, '<')
                .replace(/&amp;gt;/g, '>')
                .replace(/&amp;le;/g, '≤')
                .replace(/&amp;ge;/g, '≥')
                .replace(/&amp;#9312;/g, '①')
                .replace(/&amp;#9313;/g, '②')
                .replace(/&amp;#9314;/g, '③')
                .replace(/&amp;#9315;/g, '④')
                .replace(/&amp;#9316;/g, '⑤')
                .replace(/&amp;#9317;/g, '⑥')
                .replace(/&amp;#9318;/g, '⑦')
                .replace(/&amp;#9319;/g, '⑧')
                .replace(/&amp;#9320;/g, '⑨')
                .replace(/&amp;#9321;/g, '⑩');
            }

            // article
            if(itemArticle !== null && itemArticle.length){
                for(let i = 0; i < itemArticle.length; i++){
                    let id = itemArticle[i].fieldId;
                    switch (id) {
                        case 'editor':
                            post += replaceSpecialEntities(itemArticle[i].html);
                            break;
                        case 'html':
                            post += `<div class="fieldHtml">${itemArticle[i].html}</div>`;
                            break;
                        case 'pdf':
                        case 'pdfServer':
                            {
                                let text = itemArticle[i].text,
                                    pdfpath = itemArticle[i].path;
                                if(pdfpath === undefined){
                                    pdfpath = itemArticle[i].file.url;
                                }
                                post += `<p><a href="${pdfpath}" class="_labelPDF" target="_blank">${text}</a></p>`
                            }
                            break;
                        case 'imageText':
                        case 'imageTextServer':
                            {
                            let image = itemArticle[i].image,
                                src = '',
                                wrap = '<div class="bl_media -reverse">',
                                alt = itemArticle[i].alt,
                                text = itemArticle[i].text,
                                caption = itemArticle[i].caption,
                                position = itemArticle[i].position;
                            if(caption === undefined){
                                caption = '';
                            }
                            if(image === undefined){
                                src = itemArticle[i].path;
                            }else{
                                src = image.url;
                            }
                            //画像位置
                            position ? wrap = '<div class="bl_media">' : wrap;

                            post += `
                                ${wrap}
                                    <figure class="mediaImg">
                                        <img class="lazyload" data-src="${src}" alt="${alt}">
                                        <figcaption>${caption}</figcaption>
                                    </figure>
                                    <div class="mediaBody">${text}</div>
                                </div>`;
                            }
                            break;
                        case 'imageCol1':
                        case 'imageCol1Server':
                            {
                            let image = itemArticle[i].path,
                                alt = itemArticle[i].caption,
                                caption = itemArticle[i].caption,
                                src = '';
                            if(image === undefined){
                                src = itemArticle[i].media.url;
                            }else{
                                src = image;
                            }
                            if(caption === undefined){
                                caption = '';
                            }
                            post += `
                                <figure class="bl_imgWrap -slim">
                                <img class="lazyload" data-src="${src}" alt="${alt}">
                                <figcaption>${caption}</figcaption>
                                </figure>`;
                            }
                            break;
                        case 'imageCol2':
                        case 'imageCol2Server':
                            {
                            let image1 = itemArticle[i].image1,
                                image2 = itemArticle[i].image2,
                                src1 = '',
                                src2 = '',
                                alt1 = itemArticle[i].alt1,
                                alt2 = itemArticle[i].alt2,
                                caption1 = itemArticle[i].caption1,
                                caption2 = itemArticle[i].caption2;
                            if(alt1 === undefined){alt1 = '';}
                            if(alt2 === undefined){alt2 = '';}
                            if(caption1 === undefined){caption1 = '';}
                            if(caption2 === undefined){caption2 = '';}
                            if(image1 === undefined){
                                src1 = itemArticle[i].path1;
                            }else{
                                src1 = image1.url;
                            }
                            if(image2 === undefined){
                                src2 = itemArticle[i].path2;
                            }else{
                                src2 = image2.url;
                            }

                            post += `
                            <div class="bl_cardUnit -col2">
                                <div class="bl_card">
                                    <figure class="cardImg">
                                    <img class="lazyload" data-src="${src1}" alt="${alt1}">
                                    <figcaption>${caption1}</figcaption>
                                    </figure>
                                </div>
                                <div class="bl_card">
                                    <figure class="cardImg">
                                    <img class="lazyload" data-src="${src2}" alt="${alt2}">
                                    <figcaption>${caption2}</figcaption>
                                    </figure>
                                </div>
                            </div>`;
                            }
                            break;
                        case 'linkButton':
                                {
                                let path = itemArticle[i].path,
                                    text = itemArticle[i].text,
                                    target = itemArticle[i].target,
                                    blankclass = '',
                                    targetAttr = '';
                                if(target){
                                    targetAttr = ' target="_blank" rel="noopener noreferrer nofollow"';
                                    blankclass = ' -blank';
                                }
                                post += `<div class="bl_btnWrap"><a href="${path}" class="el_btn -wide -stand${blankclass}"${targetAttr}>${text}</a></div>`
                                }
                                break;
                        default:;
                    }
                }
                post += '</div>';
            }else{
                post = '';
            }

            // importArticle
            if(itemImportArticle === undefined){
                itemImportArticle = '';
            }

            // SNS
            const encodeURL = encodeURIComponent(location.href);
            let snsTitle = encodeURI(`${strTitle} | TORAY`);
            let fbLink = `http://www.facebook.com/share.php?u=${encodeURL}&t=${snsTitle}`;
            let twLink = `https://twitter.com/intent/tweet?text=${snsTitle}&url=${encodeURL}`;
            let likedinLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURL}`;

            // metaOGP
            self.metaOGP(strTitle);

            str += `
                <div class="bl_headingWrap -news">
                    <h1 class="bl_headingLv1">${itemTitle}</h1>
                    <div class="itemRow">
                        <div class="bl_snsShare">
                            <a class="fb" href="${fbLink}" target="_blank" rel="nofollow"><img src="../shared/images/icon_fb.svg" alt="Share on facebook" /></a>
                            <a class="tw" href="${twLink}" target="_blank" rel="nofollow"><img src="../shared/images/icon_x.svg" alt="Share on X" /></a>
                            <a class="in" href="${likedinLink}" target="_blank" rel="nofollow"><img src="../shared/images/icon_linkedin.svg" alt="Share on Linkedin" /></a>
                        </div>
                    </div>
                </div>
                <div class="date"><time datetime=${itemDatetime}>${itemDateText}</time></div>
                <div class="meta">${itemAuthor}</div>
                ${post}
                <div class="bl_importArticle">${itemImportArticle}</div>
            `;
        } else {
            str = self.htmlItem('norecord');
        }

        // HTML書き出し
        self.targetArticle.innerHTML = str;

        // loading非表示
        self.targetArticle.classList.add('is_loaded');
        self.loading.classList.remove("is_show");
    };

    // トップページのAPIリクエスト
    FilterComp.prototype.getTopNewsList = function (category) {
        const self = this;
        let filters = [];
        self.paramLanguage.push(self.radioLanguage.val());

        // フィルター設定
        if (self.setFilter) {
            filters.push(`language[contains]${self.radioLanguage.val()}`);
            filters.push(`region[contains]${self.checkRegion.val()}`);
            filters.push(`newsCategory[not_equals]csr`);
        }

        if (category) {
            filters.push(`newsCategory[equals]${category}`);
        }

        console.log(filters.join('[and]'));

        const queries = {
            limit: self.limitNum,
            filters: filters.join('[and]'),
            orders: '-date,-publishedAt,-createdAt',
            fields: 'id,date,language,region,newsCategory,newsTag,businessWebsites,title,directLink,thumbnail',
        };

        self.loading.classList.add("is_show");

        self.client.get({endpoint: self.endpoint, queries: queries })
            .then((res) => {
                self.filterListCreate(res.contents, category);
            })
            .catch((err) => console.error(err));
    };

    // HTMLソース
    FilterComp.prototype.htmlItem = function(val) {
        const self = this;
        let item = '';

        switch (val) {
            case 'norecord':
                let errorMes = '';
                if(self.htmlLang === 'ja'){
                    errorMes = '該当する記事が見つかりません';
                }else{
                    errorMes = 'There is no news.';
                }
                item += '<div class="bl_searchNoResult">';
                item += '<p>'+ errorMes +'</p>';
                item += '</div>';
                break;
        }
        return item;
    };

    // OGP設定
    FilterComp.prototype.metaOGP = function(title){
        const ogpTitle = `${title} | TORAY`;
        const ogpURL = window.location.href;

        const head = document.head;

        let metaTitle = document.createElement("meta");
        metaTitle.setAttribute("property", "og:title");
        metaTitle.content = ogpTitle;
        head.appendChild(metaTitle);

        let metaURL = document.createElement("meta");
        metaURL.setAttribute("property", "og:url");
        metaURL.content = ogpURL;
        head.appendChild(metaURL);
    }

    // 日付表記変換（現地時刻）
    FilterComp.prototype.localTimeTransformation = function(str) {
        const self = this;
        const utcTime = new Date(str);
        let localtime = '';

        // UTC時刻を現地時刻に変換
        switch(self.paramLanguage[0]){
            case 'JA':
            case 'ZH-CN':
                localtime = new Intl.DateTimeFormat('ja-JP', {
                    year: 'numeric',
                    month: 'narrow',
                    day: 'numeric'
                  }).format(utcTime);
                break;
            default:
                localtime = new Intl.DateTimeFormat('en-US', {
                    dateStyle: "medium",
                  }).format(utcTime);
                break;
        }

        return localtime;
    };

    // 日付表記変換（datetime)
    FilterComp.prototype.dateTimeTransformation = function(str) {
        const self = this;
        const utcTime = new Date(str);
        let datetime = new Intl.DateTimeFormat('ja', {
            dateStyle: "medium",
          }).format(utcTime);

          datetime = datetime.replace(/\//g, '-');
        return datetime;
    };

    // 改行コードをタグに変換
    FilterComp.prototype.strTextBreak = function(str) {
        if(str !== undefined){
            return str.replace(/\r?\n/g, '<br>');
        }
    }

    // スクロール
    FilterComp.prototype.scrolltoElm = function(el) {
        const self = this;
        const speed = 300;
        let headerHeight = 0;
        let position = 0;

        MainComponent.windowSizeSp() ? headerHeight = 160 : headerHeight = 260;
        position = parseInt(el.offset().top - headerHeight);
        $("html, body").animate({scrollTop:position}, speed, "easeOutQuad");
        return false;
    };

    // Formアクセシビリティ
    FilterComp.prototype.formAccessibility = function() {
        const self = this;
        self.selectYear.next('label').attr('tabindex','0');
    }

    // filter toggle
    FilterComp.prototype.filterToggle = function() {
        const self = this;
        const controls = self.filterBoxToggle.attr('aria-controls');
        const panel = $('#' + controls);
        const current = 'is_open';
        self.filterBoxToggle.on('click',function(){
            if($(this).hasClass(current)){
                panel.slideUp(300);
                $(this).removeClass(current);
            }else{
                panel.slideDown(300);
                $(this).addClass(current);
            }
        });
    };

    // tab
    FilterComp.prototype.tab = function() {
        const self = this;
        const $parent = $('.bl_filterList')
        let tab = $parent.find('[role="tab"]'),
            tabpanel = $parent.find('[role="tabpanel"]');

            tab.each(function(){
                $(this).prop("checked")
                let bool = Boolean($(this).prop("checked"));
                if(bool){
                    $(this).attr('aria-selected', true)
                    let id = $(this).attr('aria-controls');
                    $('#' + id).attr('aria-hidden', false);
                }
            })

        tab.stop().on('click', function (event) {
          // event.preventDefault();
          let _self = $(this),
            select = _self.attr('aria-selected'),
            id = _self.attr('aria-controls'),
            idBody = $('#' + id);

          if (select === 'true') {
            return false;
          }

          tabpanel.attr('aria-hidden', true);
          idBody.attr('aria-hidden', false);

          tab.attr('aria-selected', false);
          _self.attr('aria-selected', true);
        });
    }


    $(function() {
        window.filtercomp = new FilterComp();
        window.filtercomp.init();
    })

}(jQuery));