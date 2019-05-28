$(function () {
    $(document).scroll(function () {
        var $nav = $("#mainNav");
        var $navLink = $("#mainNav a");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
        $nav.children().toggleClass('ss-container-sm', $(this).scrollTop() > $nav.height());
        $navLink.toggleClass('scrolled-link', $(this).scrollTop() > $nav.height());
    });

    $("#light-dark-mode").on("click", () => {
        localStorage.setItem('mode', (localStorage.getItem('mode') || 'dark') === 'dark' ? 'light' : 'dark');

        changeColorMode();
    });

    // back to top
    if ($('#back-to-top').length) {
        var scrollTrigger = 100, // px
            backToTop = function () {
                var scrollTop = $(window).scrollTop();
                if (scrollTop > scrollTrigger) {
                    $('#back-to-top').addClass('show');
                } else {
                    $('#back-to-top').removeClass('show');
                }
            };
        backToTop();
        $(window).on('scroll', function () {
            backToTop();
        });
        $('#back-to-top').on('click', function (e) {
            e.preventDefault();
            $('html,body').animate({
                scrollTop: 0
            }, 700);
        });
    }
});
$(function () {
    changeColorMode();
});

function changeColorMode() {
    if (localStorage.getItem('mode') === 'dark') {
        applyDarkMode()
    } else {
        applyLightMode()
    }
}

function applyLightMode() {
    var $navLink = $("#mainNav a");
    $(".ss-container").removeClass("dark-theme");
    $(".jumbotron").removeClass("dark-theme");
    $(".blog-footer").removeClass("dark-theme");
    $(".connect-me li a i").removeClass("dark-theme");
    $("body").removeClass("dark-theme");
    $navLink.removeClass("dark-theme");
    $("#mainNav span").removeClass("dark-theme");
    $(".posts .post .post-title p").removeClass("dark-theme");

    $("#light-dark-mode").children().children().text(' Light')
}

function applyDarkMode() {
    var $navLink = $("#mainNav a");
    $(".ss-container").addClass("dark-theme");
    $(".jumbotron").addClass("dark-theme");
    $(".blog-footer").addClass("dark-theme");
    $(".connect-me li a i").addClass("dark-theme");
    $("body").addClass("dark-theme");
    $navLink.addClass("dark-theme");
    $("#mainNav span").addClass("dark-theme");
    $(".posts .post .post-title p").addClass("dark-theme");

    $("#light-dark-mode").children().children().text(' Dark ')
}