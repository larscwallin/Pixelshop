var LCW = window.LCW ? window.LCW : {};

/********************************************************************************************
* LCW.Pixelshop
********************************************************************************************/


LCW.Pixelshop = (function(){


    var getFrame = function(frameName){
        var frameNode = null;
        var framePath = null;
        var svgns = 'http://www.w3.org/2000/svg';

        switch (frameName) {

            case 'vintage':
                frameNode = window.document.createElementNS(svgns, 'clipPath');
                frameNode.setAttribute('id', LCW.Util.generateId());
                frameNode.setAttribute('class', 'pixelshop decor clip-path');
                frameNode.setAttribute('clipPathUnits', 'userSpaceOnUse'); // objectBoundingBox, userSpaceOnUse

                framePath = window.document.createElementNS(svgns, 'path');
                framePath.setAttribute('class', 'pixelshop decor-clip-path');
                framePath.setAttribute('d', 'M 345.283,225.857 A 113.857,113.857 0 0 1 231.426,339.714 113.857,113.857 0 0 1 117.569,225.857 113.857,113.857 0 0 1 231.426,112 113.857,113.857 0 0 1 345.283,225.857 Z');
                frameNode.appendChild(framePath);

                break;

            default:
                frameNode = null;
        }

        if(frameNode !== null){
            return frameNode;
        }else{
            window.console.error('LCW.Pixelshop.getDecor(): Unrecognised decor type "' + frameName + '".');
        }

    };

    var getDecor = function(decorName){
        var decorNode = null;
        var decorPath = null;
        var svgns = 'http://www.w3.org/2000/svg';
        switch (decorName) {

            case 'heart':
                decorNode = window.document.createElementNS(svgns, 'clipPath');
                decorNode.setAttribute('id', LCW.Util.generateId());
                decorNode.setAttribute('class', 'pixelshop decor clip-path');
                decorNode.setAttribute('clipPathUnits', 'userSpaceOnUse'); // objectBoundingBox, userSpaceOnUse

                decorPath = window.document.createElementNS(svgns, 'path');
                decorPath.setAttribute('class', 'pixelshop decor-clip-path');
                decorPath.setAttribute('d', 'M12 21.35l-1.45-1.32c-5.15-4.67-8.55-7.75-8.55-11.53 0-3.08 2.42-5.5 5.5-5.5 1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54l-1.45 1.31z');

                decorNode.appendChild(decorPath);

                break;

            case 'star':
                decorNode = window.document.createElementNS(svgns, 'clipPath');
                decorNode.setAttribute('id', LCW.Util.generateId());
                decorNode.setAttribute('class', 'pixelshop decor clip-path');
                decorNode.setAttribute('clipPathUnits', 'userSpaceOnUse'); // objectBoundingBox, userSpaceOnUse

                decorPath = window.document.createElementNS(svgns, 'path');
                decorPath.setAttribute('class', 'pixelshop decor-clip-path');
                decorPath.setAttribute('d', 'M 570.452,517.922 386.971,493.343 271.43,658.7 200.975,487.511 0,470.128 113.027,323.519 27.5933,140.778 211.075,165.357 326.616,0 397.071,171.189 598.045,188.572 485.019,335.181 Z');
                decorNode.appendChild(decorPath);

                break;

                //

            default:
                decorNode = null;
        }

        if(decorNode !== null){
            return decorNode;
        }else{
            window.console.error('LCW.Pixelshop.getDecor(): Unrecognised decor type "' + decorName + '".');
        }
    };

    var getFilter = function(filterType, value){
        var filterNode = null;
        var svgns = 'http://www.w3.org/2000/svg';
        switch (filterType) {

            case 'blur':
                filterNode = window.document.createElementNS(svgns, 'feGaussianBlur');
                filterNode.setAttribute('stdDeviation', value);

                break;

            case 'erode':
                filterNode = window.document.createElementNS(svgns, 'feMorphology');
                filterNode.setAttribute('operator', 'erode');
                filterNode.setAttribute('radius', value);

                break;

            case 'dilate':
                filterNode = window.document.createElementNS(svgns, 'feMorphology');
                filterNode.setAttribute('operator', 'dilate');
                filterNode.setAttribute('radius', value);

                break;

            case 'saturate':
                filterNode = document.createElementNS(svgns, 'feColorMatrix');
                filterNode.setAttribute('type', 'saturate');
                filterNode.setAttribute('values', value);

                break;

            case 'huerotate':
                filterNode = window.document.createElementNS(svgns, 'feColorMatrix');
                filterNode.setAttribute('type', 'hueRotate');
                filterNode.setAttribute('values', value);

                break;

            case 'sepia':
                filterNode = window.document.createElementNS(svgns, 'feColorMatrix');
                filterNode.setAttribute('type', 'matrix');
                filterNode.setAttribute('values',
                '.343 .669 .119 0 0  ' +
                '.249 .626 .130 0 0  ' +
                '.172 .334 .111 0 0  ' +
                '.000 .000 .000 1 0'
                );

                break;

            case 'greyscale':
                filterNode = window.document.createElementNS(svgns, 'feColorMatrix');
                filterNode.setAttribute('type', 'matrix');
                filterNode.setAttribute('values',
                '0.3333 0.3333 0.3333 0 0  ' +
                '0.3333 0.3333 0.3333 0 0  ' +
                '0.3333 0.3333 0.3333 0 0 ' +
                '0 0 0 1 0'
                );

                break;

            default:
                filterNode = null;
        }

        if(filterNode !== null){
            return filterNode;
        }else{
            window.console.error('LCW.Pixelshop.getFilter(): Unrecognised filter type "' + filterType + '".');
        }

    };

    var applyFilter = function(image, filter, amount){
        var svgEl = null;
        var defsEl = null;
        var filterEl = null;
        var imageIndex = image.getAttribute('data-index');

        if(image instanceof window.SVGImageElement){

            svgEl = image.parentNode;
            defsEl = svgEl.querySelector('#filters_' + imageIndex);

            if(filter instanceof LCW.Pixelshop.Filter){
                filterEl = filter.getDomNode();
            }else{
                filterEl = getFilter(filter, amount);
            }

            defsEl.appendChild(filterEl);

            image.setAttribute('filter', 'url(#filters_'+ imageIndex +')');


        }else{
            window.console.error('LCW.Pixelshop.applyFilter(): Argument image must be of type SVGImageElement.');
        }

    };

    var applyDecor = function(image, decor){
        var svgEl = null;
        var defsEl = null;
        var decorEl = null;
        var imageIndex = image.getAttribute('data-index');

        if(image instanceof window.SVGImageElement){

            svgEl = image.parentNode;
            defsEl = svgEl.querySelector('defs');

            if(decor instanceof LCW.Pixelshop.Decor){
                decorEl = decor.getDomNode();
            }else{
                decorEl = getDecor(decor);
            }

            defsEl.appendChild(decorEl);

            LCW.Pixelshop.Decor.fitToBBox(image.getBBox(), decorEl);

            image.setAttribute('clip-path', 'url(#'+ decorEl.id +')');


        }else{
            window.console.error('LCW.Pixelshop.applyFilter(): Argument image must be of type SVGImageElement.');
        }

    };

    return {
        filters: {
            saturate: function(image, amount){
                applyFilter(image, 'saturate', amount);
            },
            dilate: function(image, amount){
                applyFilter(image, 'dilate', amount);
            },
            huerotate: function(image, amount){
                applyFilter(image, 'huerotate', amount);
            },
            erode: function(image, amount){
                applyFilter(image, 'erode', amount);
            },
            blur: function(image, amount){
                applyFilter(image, 'blur', amount);
            },
            sepia: function(image, amount){
                applyFilter(image, 'sepia', amount);
            },
            greyscale: function(image, amount){
                applyFilter(image, 'greyscale', amount);
            },
            custom: function(image, amount){
                applyFilter(image, 'greyscale', amount);
            }
        },
        decor: {
            custom: function(image, decorObject){
                applyDecor(image, decorObject);
            }
        }

    };
}());

LCW.Pixelshop.Frame = function(SVGFrameNode){
    var domNode = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.cover = true;

    this.getDomNode = function(){

    };

    this.init = function(){

    };

    //Init

};

LCW.Pixelshop.Decor = function(SVGDecorNode){
    var domNode = null;
    this.decorType = ''; // frame, mask, clip
    this.amount = '';
    this.offsetX = 0;
    this.offsetY = 0;
    this.cover = true;

    this.getDomNode = function(){

    };

    this.init = function(){

    };

    //Init

};

LCW.Pixelshop.Decor.fitToBBox = function(targetBBox, decor, align){
    var decorPath = decor.children[0];
    var decorBBox = decor.getBBox();
    var decorWidthRatio = 0;
    var decorHeightRatio = 0;
    var scaleFactor = 0;
    var decorOffsetX = 0;
    var decorOffsetY = 0;
    var decorTransformedX = 0;
    var decorTransformedY = 0;
    var decorTransformedWidth = 0;
    var decorTransformedHeight = 0;
    var decorPixel = 1;

    align = (align !== undefined) ? align : {'x': 'min', 'y': 'min'};

    decorHeightRatio = (decorBBox.height / targetBBox.height);
    decorWidthRatio = (decorBBox.width / targetBBox.width);
    scaleFactor = (decorWidthRatio > decorHeightRatio) ? decorWidthRatio : decorHeightRatio;

    scaleFactor = (1 / scaleFactor);
    decorPixel = (1 / scaleFactor);

    decorTransformedHeight = decorBBox.height * scaleFactor;
    decorTransformedWidth = decorBBox.width * scaleFactor;
    decorTransformedX = decorBBox.x * scaleFactor;
    decorTransformedY = decorBBox.y * scaleFactor;

    console.log(decor);
    console.log(decorBBox);
    console.log(targetBBox);

    decorOffsetX = ((targetBBox.width - decorTransformedWidth) / 2) * decorPixel;
    decorOffsetY = ((targetBBox.height - decorTransformedHeight) / 2) * decorPixel;

    decorOffsetX = decorOffsetX - decorBBox.x;
    decorOffsetY = decorOffsetY - decorBBox.y;

    console.log('decorOffsetY = ' + decorOffsetY + ' decorOffsetX = ' + decorOffsetX);

    decorPath.style.transform = 'scale(' + scaleFactor + ') translateX(' + decorOffsetX + 'px) translateY(' + decorOffsetY + 'px)';

    return decor;
};

LCW.Pixelshop.Filter = function(SVGFilterNode){
    var domNode = null;
    this.filterType = '';
    this.opacity = '';
    this.getDomNode = function(){

    };

    this.init = function(){

    };

    //Init

};
