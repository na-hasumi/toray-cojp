// --------------------------------------
// 追従フッターナビ用のアクティブ管理
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
        const target = document.querySelectorAll('.js-fixed-footer-target');
        ScrollTrigger.create({
            trigger: ".js-fixed-footer-trigger",
            start: `top+=${offset} center`,
            end: "bottom bottom",
            onEnter: () => {
                target.forEach(el => el.classList.add("is-active"));
            },
            onLeaveBack: () => {
                target.forEach(el => el.classList.remove("is-active"));
            },
            onLeave: () => {
                target.forEach(el => el.classList.remove("is-active"));
            },
            onEnterBack: () => {
                target.forEach(el => el.classList.add("is-active"));
            },
            markers: false,
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

    // アコーディオン
    const aco = () => {
        let active = false;
        let scrollPositionBeforeOpening = 0;
        const triggers = document.querySelectorAll('.js-aco-trigger');
        const targets = document.querySelectorAll('.js-aco-target');
        // console.log(triggers);
        if (!triggers.length || !targets.length) return;
        triggers.forEach((trigger, index) => {
            const target = targets[index];
            trigger?.addEventListener('click', () => {
                trigger?.classList.toggle('is-active');
                target?.classList.toggle('is-active');
                // console.log(index);
    
                if (!target.classList.contains('is-active')) {
                    target.style.height = '';
                } else {
                    target.style.height = target?.scrollHeight + 'px';
                }
            });
        });
    }

    fixedFooter();
    aco();
});