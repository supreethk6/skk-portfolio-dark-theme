jQuery(document).ready(function ($) {
	var prevArrow = "<button type='button' class='slick-prev slick-arrow' aria-label='Previous'><i class='ri-arrow-left-line' aria-hidden='true'></i></button>";
	var nextArrow = "<button type='button' class='slick-next slick-arrow' aria-label='Next'><i class='ri-arrow-right-line' aria-hidden='true'></i></button>";

	if ($('.ds-testimonials-section').length) {
		$('.ds-testimonials-slider').slick({
			infinite: true,
			arrows: true,
			autoplay: true,
			autoplaySpeed: 4000,
			prevArrow: prevArrow,
			nextArrow: nextArrow
		});
	}

	if ($('.figure-section').length) {
		$('.figure-slider').slick({
			infinite: true,
			arrows: true,
			autoplay: true,
			autoplaySpeed: 4000,
			prevArrow: prevArrow,
			nextArrow: nextArrow
		});
	}
});