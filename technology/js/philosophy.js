// --------------------------------------
// stickyコンテンツ
// --------------------------------------

const throttle = (fn, interval) => {
    let time = Date.now() - interval;
    return () => {
      if (time + interval < Date.now()) {
        time = Date.now();
        fn();
      }
    };
};

document.addEventListener("DOMContentLoaded", (event) => {

    // GSAP
    gsap.registerPlugin(ScrollTrigger);

    const fixedFooter = (offset = 0) => {
        const elements = document.querySelectorAll('.js-fixed-footer');
    
        elements.forEach(element => {
            // is_active用のトリガー（変更なし）
            ScrollTrigger.create({
                trigger: element,
                start: `top+=${offset} bottom`,
                end: "bottom bottom",
                toggleClass: {
                    targets: element,
                    className: "is_active"
                },
                toggleActions: "play none none reverse",
                markers: false,
            });
    
            // is_end用のトリガー
            ScrollTrigger.create({
                trigger: element,
                start: "bottom bottom", // end位置をstart位置として設定
                end: "bottom top",      // 完全に画面外に出るまで
                toggleClass: {
                    targets: element,
                    className: "is_end"
                },
                toggleActions: "play reverse play reverse",
                markers: false,
            });
        });
    }

    const refresh = () => {
        ScrollTrigger.refresh();
    }
    // bodyの高さが変わったら発火（アコーディオンによる計算位置のずれ対策）
    const throttledBgChangeAndRefresh = throttle(() => {
        refresh();
    }, 100);
    const resizeObserver = new ResizeObserver(entries => {
        throttledBgChangeAndRefresh();
    });
    resizeObserver.observe(document.body);

    fixedFooter();
    
    // アンカーリンクのアニメーション制御を追加
    document.querySelectorAll('.un_sticky_paging a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // アニメーションなしで即座にスクロール
                targetElement.scrollIntoView({
                    behavior: 'auto' // 'smooth'ではなく'auto'を使用
                });
            }
        });
    });

});