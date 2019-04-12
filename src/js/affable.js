(function($) {
  "use strict"; // Start of use strict

  //selector caching for performance...
  var $window = $(window),
      $mainNav = $('#mainNav');

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 54)
        }, 500, "easeInOutExpo");
        return false;
      }
    }
  });
  // Activate scrollspy to add/change section names on scroll
  $window.on('activate.bs.scrollspy', function () {
    var x = $(".nav-link.active").text();
    $(".navbar-title").empty().html(x);
  });
  // make Navbar translucent on scroll
  var navbarChange = function() {
    //alert('scrolling');
    console.log('running navbarChange')
    if ($mainNav.offset().top > 100) {
      $mainNav.addClass("translucent");
      console.log('adding translucent')
    } else {
      $mainNav.removeClass("translucent");
      $(".navbar-title").empty();
      console.log('removing translucent')
    }
  };
  //fade masthead graphic on scroll
  var fadeAtoms = function() {
    var scroll_pos = 0;
    var animation_begin_pos = 0; //where you want the animation to begin
    var animation_end_pos = .7 * $(window).height();
    var theHeight = $(window).height();
    console.log('the height:' + theHeight);

    scroll_pos = $(this).scrollTop();
    console.log('position: ' + scroll_pos);
    if(scroll_pos >= animation_begin_pos && scroll_pos <= animation_end_pos ) {
        var opacity = 1 - (scroll_pos / ( animation_end_pos - animation_begin_pos ));
        console.log('opacity:' + opacity);
        $('header').css('opacity', opacity);
    }
  }
  //navbarChange(); // run now if page is not at top
  $window.scroll(navbarChange); // translucent Navbar on scroll
  $window.on('scroll resize', fadeAtoms);

  //toggle layout testing classes
  $("#testing_toggle").click(function () {
    if ($('.masthead').hasClass('testing')){
      $('.masthead').removeClass('testing');
      $('#intro').removeClass('testing');
      $('#work').removeClass('testing');
      $('#about').removeClass('testing');
      $('#contact').removeClass('testing');
      $mainNav.removeClass('testing');
    } else {
      $('.masthead').addClass('testing');
      $('#intro').addClass('testing');
      $('#work').addClass('testing');
      $('#about').addClass('testing');
      $('#contact').addClass('testing');
      $mainNav.addClass('testing');
    }
  })

  //splash screen modal display
  $('#splashscreenModal').modal('show')
  $('.modal-backdrop').addClass('invisible');
  setTimeout(function(){
      //dismissed after 2 seconds
      $('#splashscreenModal').modal('hide')
  }, 2000);

  //form validation and ajax submission
  function showAndDismissAlert(type, message) {
    var messageComponents = [
      '<div class="alert alert-' + type + ' alert fadeIn" role="alert">\n',
      '<strong>' + message + '</strong>\n',
      '</div>\n'
    ];
    var htmlAlert = messageComponents.join('');
    var theDelay = 5000;
    $("#success").prepend(htmlAlert);
    setTimeout(function(){
      $("#success .alert").removeClass('fadeIn').addClass('fadeOut');
    }, theDelay);
    setTimeout(function(){
      $("#success .alert").alert('close');
      //clear all fields on success
      if (type == 'success') $('#contactForm').trigger('reset').removeClass('was-validated');
    }, theDelay + 750);
  }
  $("#contactForm").submit(function(event){
    event.preventDefault(); // prevent default submit behaviour
    if (this.checkValidity() === false) {
      event.stopPropagation();
      document.getElementById('contact').scrollIntoView();
    } else {
      var thename = $("input#thename").val();
      var theemail = $("input#theemail").val();
      var thephone = $("input#thephone").val();
      var theproject = $("textarea#theproject").val();
      var theworktype = $("select#theworktype").val();
      var thetimeline = $("input#thetimeline").val();
      var thewebsite= $("input#thewebsite").val();
      var theassets = $("select#theassets").val();
      var thebudget= $("select#thebudget").val();
      var thewhere= $("input#thewhere").val();

      var $thatsend = $("#TheSendButton");
      // Disable submit button until AJAX call is complete to prevent duplicate messages
      $thatsend.prop("disabled", true);

      $.ajax({
        url: "/mail/contact_me.php",
        type: "POST",
        data: {
          name: thename,
          email: theemail,
          phone: thephone,
          project_description: theproject,
          work_type: theworktype,
          timeline: thetimeline,
          website_url: thewebsite,
          assets_status: theassets,
          budget: thebudget,
          heard_about_us: thewhere
        },
        cache: false,
        success: function() {
          // Success message
          var resultText = 'Your message has been sent.';
          showAndDismissAlert('success', resultText);
        },
        error: function() {
          // Fail message
          var resultText = 'Sorry, it seems that my mail server is not responding. Please try again later!';
          showAndDismissAlert('danger', resultText);
        },
        complete: function() {
          setTimeout(function() {
            $thatsend.prop("disabled", false); // Re-enable submit button when AJAX call is complete
          }, 5750);
        }
      });
    }
    this.classList.add('was-validated');

    //When clicking on Name box, hide fail/success boxes
    $('#thename').focus(function() {
      $('#success').html('');
      $thatsend.prop("disabled", false); // Re-enable submit button
    });
  });
})(jQuery); // End of use strict
