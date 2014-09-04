/*** SlideView.js ***/

define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier = require('famous/core/Modifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Transitionable   = require('famous/transitions/Transitionable');
    var SpringTransition = require('famous/transitions/SpringTransition');

    var Timer = require('famous/utilities/Timer');
    var Random = require('famous/math/Random');

    Transitionable.registerMethod('spring', SpringTransition);

    function SlideView() {
        View.apply(this, arguments);

        var photoSurface = new ImageSurface({
            properties: {
                backgroundColor: 'black',
                pointerEvents: 'none',
                overflow: 'hidden',
            },
            content: this.options.photoUrl,
        });

        this.rootModifier = new Modifier({
        });
        this.opacityState = new Transitionable(0);
        this.sizeState = new Transitionable([512, 512]);
        this.alignState = new Transitionable([0, 0]);
        this.originState = new Transitionable([0, 0]);

        this.rootModifier.opacityFrom(this.opacityState);
        this.rootModifier.sizeFrom(this.sizeState);
        this.rootModifier.alignFrom(this.alignState);
        this.rootModifier.originFrom(this.originState);

        this.mainNode = this.add(this.rootModifier);
        this.mainNode.add(photoSurface);
    }

    SlideView.prototype = Object.create(View.prototype);
    SlideView.prototype.constructor = SlideView;

    SlideView.DEFAULT_OPTIONS = {
        size: [undefined, undefined],
        duration : 3000,
        toSize: [undefined, undefined],
    };

    /* 显示图片
     * effect: 0, Ken Burns Effect
     *         1, Origami Effect
     */
    SlideView.prototype.show = function(effect) {
        if (0 === effect){
            _kenBurnsPlay.call(this);
        }
        if (1 === effect){

        }
    };

    SlideView.prototype.hide = function() {
        this.opacityState.set(0,
            {curve : 'linear', duration : 1000});
    };

    function _kenBurnsPlay(){
        this.options.inNode.add(this.mainNode);

        var image = {size: [512, 512]};
        var resizeRatio = getResizeRatioFromImage(image, 320, 568);
        var width = image.size[0] * resizeRatio;
        var height = image.size[1] * resizeRatio;
        this.rootModifier.setSize([width, height]);
        // this.options.toSize = [width, height];

        var type = Random.integer(0,3);
        _move.call(this, type);
    }

    function _origamiPlay(){

    }

    function _move(type){
        var duration = this.options.duration;

        if (0 === type){
            this.alignState.set([0,0]);
            this.originState.set([0,0]);

            this.opacityState.set(1,
                {curve : 'linear', duration : duration},
                function(){
                    console.log('animation finished!');
            });
            this.alignState.set([1,1],
                {curve : 'linear', duration : duration});
            this.originState.set([1,1],
                {curve : 'linear', duration : duration});
            this.rootModifier.setTransform(Transform.scale(1.25, 1.25),
                {curve : 'linear', duration : duration});
        }
        if (1 === type){
            this.alignState.set([1.0,0]);
            this.originState.set([1,0]);

            this.opacityState.set(1,
                {curve : 'linear', duration : duration});
            this.alignState.set([0,1],
                {curve : 'linear', duration : duration});
            this.originState.set([0,1],
                {curve : 'linear', duration : duration});
            this.rootModifier.setTransform(Transform.scale(1.1, 1.1),
                {curve : 'linear', duration : duration});
        }

        if (2 === type){
            this.alignState.set([0,0]);
            this.originState.set([0,0]);

            this.opacityState.set(1,
                {curve : 'linear', duration : duration});
            this.alignState.set([1,0],
                {curve : 'linear', duration : duration});
            this.originState.set([1,0],
                {curve : 'linear', duration : duration});
            this.rootModifier.setTransform(Transform.scale(1.2, 1.2),
                {curve : 'linear', duration : duration});
        }

        if (3 === type){
            this.alignState.set([0,0]);
            this.originState.set([0,0]);

            this.opacityState.set(1,
                {curve : 'linear', duration : duration});
            this.alignState.set([0,1],
                {curve : 'linear', duration : duration});
            this.originState.set([0,1],
                {curve : 'linear', duration : duration});
            this.rootModifier.setTransform(Transform.scale(1.2, 1.2),
                {curve : 'linear', duration : duration});
        }
    }

        // 尽量填充满整个屏幕
    function getResizeRatioFromImage(image, frameWidth, frameheight){
        // var resizeRatio = undefined;
        // var widthDiff = undefined;
        // var heightDiff = undefined;

        if (image.size[0]> frameWidth){
            widthDiff = image.size[0] - frameWidth;

            if (image.size[1] > frameheight){
                heightDiff = image.size[1] - frameheight;

                if (widthDiff > heightDiff){
                    resizeRatio = frameheight / image.size[1];
                }else{
                    resizeRatio = frameWidth / image.size[0];
                }
            }else{
                heightDiff = frameheight - image.size[1];

                if (widthDiff > heightDiff){
                    resizeRatio = frameheight / image.size[1];
                }else{
                    resizeRatio = frameWidth / image.size[0];
                }
            }
        }else{
            widthDiff = frameWidth - image.size[0];

            if (image.size[1] > frameheight){
                heightDiff = image.size[1] - frameheight;

                if (widthDiff > heightDiff){
                    resizeRatio = frameheight / image.size[1];
                }else{
                    resizeRatio = frameWidth / image.size[0];
                }
            }else{
                heightDiff = frameheight - image.size[1];

                if (widthDiff > heightDiff){
                    resizeRatio = frameheight / image.size[1];
                }else{
                    resizeRatio = frameWidth / image.size[0];
                }
            }
        }

        return resizeRatio;
    }

    module.exports = SlideView;
});
