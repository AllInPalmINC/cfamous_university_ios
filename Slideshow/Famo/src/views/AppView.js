define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');

    var SlideshowView = require('views/SlideshowView');
    var MenuView = require('views/MiniMenu/MenuView');

    function AppView() {
        View.apply(this, arguments);

        this.rootModifier = new StateModifier({
            size: [320, 568]
        });
        this.mainNode = this.add(this.rootModifier);

        _createSlideshow.call(this);
        _createMenu.call(this);
    }

    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

    AppView.DEFAULT_OPTIONS = {
    };

    function _createSlideshow() {
        var slideshowView = new SlideshowView({
            size: [undefined, undefined],
        });

        var slideshowModifier = new StateModifier({
            origin: [0.5, 0],
            align: [0.5, 0],
            transform: Transform.translate(0, 0, 0)
        });

        var slideshowContainer = new ContainerSurface({
            properties: {
                overflow: 'hidden',
                // backgroundColor: 'blue',
                zIndex: 0,
            },
            size: [undefined, undefined],
        });

        this.mainNode.add(slideshowModifier).add(slideshowContainer);
        slideshowContainer.context.setPerspective(1000);
        slideshowContainer.add(slideshowView);
    }

    function _createMenu() {
        var modifier = new StateModifier({
            size:[40, 40],
            align: [0, 1],
            origin: [0, 1],
            transform: Transform.translate(0, 0, 10),
        });
        node = this.mainNode.add(modifier);
        var menu = new MenuView({
            items: [{callback: function(){
                console.log(111);
            }.bind(this)},
            {}],
        });
        node.add(menu);
    }

    module.exports = AppView;
});
