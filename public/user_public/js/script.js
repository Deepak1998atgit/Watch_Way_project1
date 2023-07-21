/**
 * WEBSITE: https://themefisher.com
 * TWITTER: https://twitter.com/themefisher
 * FACEBOOK: https://www.facebook.com/themefisher
 * GITHUB: https://github.com/themefisher/
 */
//  ALERT 
/* ********************** start nova alert ********************** */

const novaAlert = function ({ icon = '', title = '', text = '', darkMode = false, showCancelButton = false, CancelButtonText = 'NO', ConfirmButtonText = 'Okay', dismissButton = true, input = false, inputPlaceholder = '' }) {


  let modal = document.createElement('div');
  modal.setAttribute('class', 'nova-modal');
  document.body.append(modal);
  let alert = document.createElement('div');
  alert.setAttribute('class', 'nova-alert')

  modal.appendChild(alert);
  var svg;

  if (darkMode == true) {
    alert.classList.add('nova-dark-mode');
  }




  if (icon == 'success') {
    svg = `<svg class="circular green-stroke">
            <circle class="path" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
          </svg>
          <svg class="checkmark green-stroke">
            <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)">
              <path class="checkmark__check" fill="none" d="M616.306,283.025L634.087,300.805L673.361,261.53"/>
            </g>
          </svg>`;
  } else if (icon == 'danger') {
    svg = `<svg class="circular red-stroke">
            <circle class="path" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
          </svg>
          <svg class="cross red-stroke">
            <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-502.652,-204.518)">
              <path class="first-line" d="M634.087,300.805L673.361,261.53" fill="none"/>
            </g>
            <g transform="matrix(-1.28587e-16,-0.79961,0.79961,-1.28587e-16,-204.752,543.031)">
              <path class="second-line" d="M634.087,300.805L673.361,261.53"/>
            </g>
          </svg>`;
  } else if (icon == 'warning') {
    svg = `<svg class="circular yellow-stroke">
            <circle class="path" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
          </svg>
          <svg class="alert-sign yellow-stroke">
            <g transform="matrix(1,0,0,1,-615.516,-257.346)">
              <g transform="matrix(0.56541,-0.56541,0.56541,0.56541,93.7153,495.69)">
                <path class="line" d="M634.087,300.805L673.361,261.53" fill="none"/>
              </g>
              <g transform="matrix(2.27612,-2.46519e-32,0,2.27612,-792.339,-404.147)">
                <circle class="dot" cx="621.52" cy="316.126" r="1.318" />
              </g>
            </g>
          </svg>`;
  } else {
    svg = '';
  }
  var icon_template = ` <div class="nova-icon">
           <div class="svg-box">
           ${svg}
           </div>
        </div>`;
  var title_and_text = `
        <h3 class="nova-title">
          ${title}
        </h3>
        <p class="nova-text">
        ${text}
        </p>
        `;

  if (showCancelButton == true) {
    var buttons =
      `
        <div class="nova-btns">
        <a class="accept">
          ${ConfirmButtonText}
        </a>
        <a class="reject">
        ${CancelButtonText}
        </a>
        </div>
        `;
  } else {
    var buttons =
      `
        <div class="nova-btns">
        <a class="accept">
        ${ConfirmButtonText}
        </a>
        </div>
        `;
  }
  if (dismissButton == true) {

    var dismissButton = `<a class="dismissButton">
        X
        </a>`;
  } else {
    var dismissButton = `<a class="dismissButton hidden">
        X
        </a>`;
  }


  if (input == true) {
    var __input = `<input class="nova-input-alert" placeholder='${inputPlaceholder}'>`;
  } else {
    var __input = '';
  }


  var $content = icon_template + title_and_text + __input + buttons + dismissButton;






  alert.innerHTML = $content;




  document.querySelector('.nova-alert .reject  , .nova-alert .accept').onclick = closeNova;
  document.querySelector('.dismissButton').onclick = closeNova;



  function closeNova() {

    alert.remove();
    modal.remove();

  }


  this.then = function (callback) {
    document.querySelector('.nova-alert .accept').onclick = accept;
    function accept() {
        if (input == true) {
        var inputValue = document.querySelector('.nova-input-alert');
        var val = inputValue.value;
        closeNova();
        callback(e = true, val);

      } else {
        closeNova();
        callback(e = true);
      }
    }
    document.querySelector('.nova-alert .reject').onclick = reject;
    function reject() {
      closeNova();
      callback(e = false);
    }
  }
}




/* ********************** end nova alert ********************** */

// new novaAlert({
// title: 'Welcome',
// text: 'Nova is a small JavaScript plugin for creating custom alert',
// icon: 'success',
// dismissButton: false,
// darkMode: false,
// ConfirmButtonText: 'Lets go',

// });




function input_alert() {
  new novaAlert({
    title: 'INPUT ALERT',
    text: 'this is input alert',
    dismissButton: true,
    input: true,
    inputPlaceholder: 'what is your name ?',
    showCancelButton: true,
    ConfirmButtonText: 'send',
    CancelButtonText: 'close'
  }).then((r, v) => {
    if (r) {
      new novaAlert({
        title: 'Hello ' + v
      })
    }
  });
}




function show_warning(value) {

  new novaAlert({
    title:`${value} not valid `,
    text: '',
    icon: 'warning',
    showCancelButton: true,
    showCancelButtonText:"HOME",
    ConfirmButtonText: 'CART'
  }).then(function (e) {

    if (e == true) {
      new novaAlert({
        icon: 'success',
        title: 'very nice',
        text: 'you selected Okay',
      })
    } else {
      new novaAlert({
        icon: 'danger',
        title: 'very nice',
        text: 'you selected No',
      })
    }




  })
}


function show_danger() {
  new novaAlert({
    icon: 'danger',
    title: 'danger alert',
    text: 'this is danger alert do you like this ?',
    showCancelButton: true,
    CancelButtonText: 'no i hate this :(',
    ConfirmButtonText: 'yes i love this :)',


  }).then((result) => {
    if (result) {
      new novaAlert({
        title: 'you selected : yes i love this :)'
      })
    } else {
      new novaAlert({
        title: 'you selected : no i hate this :('
      })
    }
  })
}


function show_success(message) {
  new novaAlert({
    icon: 'success',
    title: message,
    text: '',
    showCancelButton: true,
    CancelButtonText: "HOME",
    ConfirmButtonText: 'CART',
  }).then((result) => {
    if (result) {
      if (result) {
        window.location.href = '/findCartItems'; // Redirect to the desired URL
      }
   } else {
    window.location.href = '/homePage';
    }
  })
}


function show_alert() {
  new novaAlert({
    title: 'Do you love js ?',
    icon: '',
    showCancelButton: true,
    dismissButton: false,
    ConfirmButtonText: 'Yes i love js',
    CancelButtonText: 'No i Hate js'
  }).then(function (e) {
    if (e) {
      new novaAlert({
        title: 'i love Javascript too :)',
        dismissButton: false,

      })



    } else {
      new novaAlert({
        title: 'but i love Javascript :)',
        dismissButton: false,

      })
    }
  })
}


function show_darkmode() {
  new novaAlert({
    title: 'dark Mode is good ha...',
    icon: '',
    dismissButton: false,
    darkMode: true
  })
}
//ALERT
(function ($) {
  'use strict';

  // navbarDropdown
  if ($(window).width() < 992) {
    $('.navigation .dropdown-toggle').on('click', function () {
      $(this).siblings('.dropdown-menu').animate({
        height: 'toggle'
      }, 300);
    });
  }

  //  Count Up
  function counter() {
    var oTop;
    if ($('.counter').length !== 0) {
      oTop = $('.counter').offset().top - window.innerHeight;
    }
    if ($(window).scrollTop() > oTop) {
      $('.counter').each(function () {
        var $this = $(this),
          countTo = $this.attr('data-count');
        $({
          countNum: $this.text()
        }).animate({
          countNum: countTo
        }, {
          duration: 1000,
          easing: 'swing',
          step: function () {
            $this.text(Math.floor(this.countNum));
          },
          complete: function () {
            $this.text(this.countNum);
          }
        });
      });
    }
  }
  $(window).on('scroll', function () {
    counter();
    //.Scroll to top show/hide
    var scrollToTop = $('.scroll-top-to'),
      scroll = $(window).scrollTop();
    if (scroll >= 200) {
      scrollToTop.fadeIn(200);
    } else {
      scrollToTop.fadeOut(100);
    }
  });
  // scroll-to-top
  $('.scroll-top-to').on('click', function () {
    $('body,html').animate({
      scrollTop: 0
    }, 500);
    return false;
  });

  // -----------------------------
  //  Video Replace
  // -----------------------------
  $('.video-box').click(function () {
    var video = '<div class="embed-responsive embed-responsive-16by9 mb-4"><iframe class="embed-responsive-item" src="' + $(this).attr('data-video-url') + '" allowfullscreen></iframe></div>';
    $(this).parent('.video').replaceWith(video);
  });

  // niceSelect

  $('select:not(.ignore)').niceSelect();

  // blog post-slider
  $('.post-slider').slick({
    dots: false,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    autoplay: true,
    fade: true
  });

  // Client Slider 
  $('.category-slider').slick({
    dots: false,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    nextArrow: '<i class="fa fa-chevron-right arrow-right"></i>',
    prevArrow: '<i class="fa fa-chevron-left arrow-left"></i>',
    responsive: [{
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false
      }
    }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });

  // trending-ads-slide 

  $('.trending-ads-slide').slick({
    dots: false,
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 800,
    responsive: [{
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });


  // product-slider
  $('.product-slider').slick({
    dots: true,
    arrows: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: false,
    nextArrow: '<i class="fa fa-chevron-right arrow-right"></i>',
    prevArrow: '<i class="fa fa-chevron-left arrow-left"></i>',
    customPaging: function (slider, i) {
      var image = $(slider.$slides[i]).data('image');
      return '<img class="img-fluid" src="' + image + '" alt="product-img">';
    }
  });



  // tooltip
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

  // bootstrap slider range
  $('.range-track').slider({});
  $('.range-track').on('slide', function (slideEvt) {
    $('.value').text('₹' + slideEvt.value[0] + ' - ' + '₹' + slideEvt.value[1]);
  });


})(jQuery);