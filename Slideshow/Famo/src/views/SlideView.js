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
    var ContainerSurface = require('famous/surfaces/ContainerSurface');

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
        this.sizeState = new Transitionable(this.options.size);
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
        angle: -0.5,
        origamiFalldownModifers: [],
    };

    /* 显示图片
     * effect: 0, Ken Burns Effect
     *         1, Origami Effect
     */
    SlideView.prototype.show = function(effect, subEffect) {
        if (0 === effect){
            _kenBurnsPlay.call(this);
        }
        if (1 === effect){
            if (subEffect === 0){
                _origamiPlay.call(this);
            }else{
                _origamiSplitVPlay.call(this);
            }

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
        this.options.inNode.add(this.mainNode);

        _origamiFalldown.call(this);
    }

    function _origamiSplitVPlay(){
        var image = {size: [512, 512]};
        var resizeRatio = getResizeRatioFromImage(image, 320, 568);
        var width = image.size[0] * resizeRatio;
        var height = image.size[1] * resizeRatio;
        this.rootModifier.setSize([width, height]);

        // this.mainNode.set([]);
        this.opacityState.set(1);
        this.options.inNode.add(this.mainNode);
        this.options.origamiFalldownModifers = [];
        for (var i = 0; i < 3; i++) {
            var image1 = {size: [512, 512]};
            var resizeRatio1 = getResizeRatioFromImage(image1, 320, 568);
            var width1 = image1.size[0] * resizeRatio;
            var height1 = image1.size[1] * resizeRatio;
            var size = [width1, height1];

            var splitSurface = new ImageSurface({
                properties: {
                    backgroundColor: 'black',
                    pointerEvents: 'none',
                },
                content: "img/3.jpg",//this.options.photoUrl,
                size: size,
            });
            var modifier = new StateModifier({
                size: [this.options.size[0], this.options.size[1]/3],
                origin: [0, 1],
                align: [0, 1/3 * (i+1)],
                transform: Transform.translate(0,
                    0,
                    0),
            });

            var splitContainer = new ContainerSurface({
                properties: {
                    overflow: 'hidden',
                    zIndex: 0,
                },
                size: [this.options.size[0], this.options.size[1]/3],
            });

            this.mainNode.add(modifier).add(splitContainer);

            var surfaceModifier = new StateModifier({
                transform: Transform.translate(0,
                    -this.options.size[1]/3 * i,
                    0),
            });
            splitContainer.add(surfaceModifier).add(splitSurface);

            this.options.origamiFalldownModifers.push(modifier);
        }

        // origami split fall down effect
        _origamiSplitFalldown.call(this);
    }

    function _origamiFalldown(){
        var image = {size: [512, 512]};
        var resizeRatio = getResizeRatioFromImage(image, 320, 568);
        var width = image.size[0] * resizeRatio;
        var height = image.size[1] * resizeRatio;
        this.rootModifier.setSize([width, height]);

        var duration = 3000;

        this.alignState.set([0.5,0]);
        this.originState.set([0.5,0]);

        this.opacityState.set(1,{curve : 'linear', duration : duration});
        this.rootModifier.setTransform(
            Transform.rotateX(this.options.angle),
            { duration: 200, curve: 'easeOut' }
        );
        this.rootModifier.setTransform(
            Transform.identity,
            { method: 'spring', period: 600, dampingRatio: 0.15 }
        );
    }

    function _origamiSplitFalldown(){
        var trasnforms = [];
        for (var i = 0; i < 3; i++) {
            var topModifer = this.options.origamiFalldownModifers[i];
            var t = topModifer.getTransform();
            var translate = t;
            var tEnd = Transform.multiply(Transform.rotateX(-1.7),
                translate);
            trasnforms.push([tEnd, topModifer]);
        }
        trasnforms.reverse();

        _origamiSplitFalldownHelper(trasnforms);
    }

    function _origamiSplitFalldownHelper(trasnforms){
        if (trasnforms.length ===0 ) return;

        var array = trasnforms[trasnforms.length-1];
        var modifer = array[1];
        var transform = array[0];
        trasnforms.pop();

        modifer.setTransform(
            transform,
            { duration: 500, curve: 'easeIn' },
            function(transforms){
                _origamiSplitFalldownHelper(trasnforms);
            }
        );
    }

    function _move(type){
        var duration = this.options.duration;

        this.rootModifier.setTransform(Transform.identity);

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

    // 大于等于整个屏幕
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
