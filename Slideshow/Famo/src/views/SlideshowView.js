define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Lightbox = require('famous/views/Lightbox');
    var Easing = require('famous/transitions/Easing');

    var Timer = require('famous/utilities/Timer');

    var SlideView = require('views/SlideView');

    function SlideshowView() {
        View.apply(this, arguments);

        this.currentIndex = undefined;

        this.rootModifier = new StateModifier({
            size: [undefined, undefined],
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });

        this.mainNode = this.add(this.rootModifier);

        _createSlides.call(this);
        this.autoPlay();
    }

    SlideshowView.prototype = Object.create(View.prototype);
    SlideshowView.prototype.constructor = SlideshowView;

    SlideshowView.DEFAULT_OPTIONS = {
        size: [320, 568],
        effect: 1,
    };

    SlideshowView.prototype.showCurrentSlide = function() {
        var slide = this.slides[this.currentIndex];
        if (1 === this.options.effect){
            slide.show(this.options.effect, this.currentIndex%2);
        }else{
            slide.show(this.options.effect);
        }
    };

    SlideshowView.prototype.showNextSlide = function() {
        if (this.currentIndex > -1){
            var slide = this.slides[this.currentIndex];
            slide.hide();
        }

        this.currentIndex++;
        this.currentIndex = this.currentIndex % 9;

        this.showCurrentSlide();

        var self = this;
        Timer.setTimeout(function() {
            self.showNextSlide();
        }, 3000);
    };

    SlideshowView.prototype.autoPlay = function() {
        this.currentIndex = 0;
        this.showNextSlide();
    };

    function _createSlides() {
        this.slides = [];
        this.currentIndex = -1;

        for (var i = 0; i < 9; i++) {
            var slide = new SlideView({
                size: this.options.size,
                photoUrl: 'img/'+(i+1)+'.jpg',
                inNode: this.mainNode,
            });

            this.slides.push(slide);
        }
    }

    module.exports = SlideshowView;
});
