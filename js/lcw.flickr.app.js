LCW.Flickr = LCW.Flickr ? LCW.Flickr : {};

LCW.Util = {};

LCW.Util.XHR = {
    getJSON: function(url, data, successCb, errorCb){
        try{
            J50Npi.getJSON(url, data, successCb);
        }catch(e){
            if(errorCb instanceof Function){
                errorCb();
            }
        }
    }

};

LCW.Util.generateId = function(){
    // Dead simple timestamp method.
    return Date.now();
};

/********************************************************************************************
* LCW.Flickr.View
********************************************************************************************/


LCW.Flickr.View = (function(){
    var imageGrid;
    
    // Event handlers
    window.document.body.addEventListener('pixelshop.app.publicphotosloaded', function(){
        imageGrid = new LCW.Flickr.View.ImageGrid('.main-container');
        imageGrid.render();
    });

    window.document.body.addEventListener('pixelshop.view.imagegrid.rendered', function(){        
        var items;
        var item;
        var domNode = imageGrid.getDomNode();
        
        items = domNode.querySelectorAll('image');
        
        for (var i = 0; i < items.length; i++) {
            item = items[i];
            item.addEventListener('click', function(event){
                applyRandomEffect(event.currentTarget);
            });
        }
        
    });    
    
    var applyRandomEffect = function(image){
        var randomFilter = Math.floor(Math.random() * 5);
        var filters = [];
        filters[0] = 'blur';
        filters[1] = 'erode';
        filters[2] = 'saturate';
        filters[3] = 'greyscale';
        filters[4] = 'sepia';
        
        LCW.Pixelshop.filters[filters[randomFilter]](image, 5);
    };
            
    var applyTemplate = function(item, templ, tags){
        var reg = null;
        var propTag = '';
        var tagValue = '';
        // Check if the calling function has provided the template tag array, or if we should extract them.
        var templTags = (tags !== undefined) ? tags : templ.match(/{{([\s\S]*?)}}/gm);  
            
        var traverseObject = function(propArray, obj){            
            var val = '';
            var currentRef = null;
            var firstItemKey = propArray[0];
            
            if(obj.hasOwnProperty(firstItemKey)){
                
                propArray.shift();
                
                currentRef = obj[firstItemKey];

                if(currentRef instanceof Object){
                    val = traverseObject(propArray, currentRef);
                }else{
                    val = currentRef;
                }

            }else{
                val = currentRef;
            } 
            
            return val;

        };
        
        var resolvePropertyValue = function(prop, obj){
            var val = '';
            var firstItemKey = '';
            
            // Split composite property path
            prop = prop.split('.');
            
            firstItemKey = prop[0];
            
            if(prop.length > 1){                
                val = traverseObject(prop, obj);
                
            }else{
                if(obj.hasOwnProperty(firstItemKey)){
                    val = obj[firstItemKey];
                }
            }
            
            if(val instanceof Object){
                val = '';
            }
            
            return val;
            
        };
        
        templTags.forEach(function(prop){
            propTag = prop.replace('{{', '');
            propTag = propTag.replace('}}', '');

            tagValue = resolvePropertyValue(propTag, item);
            reg = new RegExp(prop, 'g');
            templ = templ.replace(reg, tagValue);
        });        

        return templ;
    };

    return {
        'getImageGrid': function(){
            return imageGrid;        
        },
        'applyTemplate': applyTemplate
    };
    
}());

 LCW.Flickr.View.ImageGrid = function(cssSelector) {
    var selector = cssSelector;
    var domNode = null; 

     var templates = {
        'wrapper': '<div class="pixelshop-view-itemgrid">{{items}}</div>',
        'item': '<div class="pixelshop-view-itemgrid-item" data-tags="{{tags}}" data-link="{{link}}" ><figure><svg id="pixelshop-image-{{index}}" width="{{width}}" height="{{height}}" preserveAspectRatio="xMinYMin meet"><defs><filter id="filters_{{index}}"></filter></defs><image x="0" y="0" width="100%" height="100%" xlink:href="{{media.m}}" data-id="pixelshop-item-{{index}}" data-index="{{index}}"/></svg><figcaption>{{title}}</figcaptioin> </figure></div>'
    };

    var getDomNode = function(){
        if(domNode === null){

            var node = window.document.querySelector(selector);

            if(node !== undefined){
                domNode = node;
                return domNode;
            }else{
                window.console.error('LCW.Flickr.View.ImageGrid.getDomNode(): ImageGrid.selector does not match any DOM Element.');
            }

        }else{
            return domNode;
        }
    };

    var render = function(collection, cb){
        var result = [];
        var resultStr = '';
        var node;
        var templ = templates.item;
        var tags = templ.match(/{{([\s\S]*?)}}/gm);

        if(collection === undefined){
            collection = LCW.Flickr.App.getLoadedPhotos();
        }

        collection.forEach(function(item){            
            result.push(LCW.Flickr.View.applyTemplate(item, templ, tags));
        });

        if(cb instanceof Function){
            cb(result);
        }else{
            resultStr = result.join('');
            node = getDomNode();                        
            node.innerHTML = templates.wrapper.replace('{{items}}', resultStr);                                                
        }
        
        LCW.Flickr.App.triggerEvent('pixelshop.view.imagegrid.rendered', {});
    };

    return {
        'setSelector': function(val) {
            selector = val;
        },
        'templates': templates,
        'render': render,
        'getDomNode': getDomNode
    };
};



/********************************************************************************************
* LCW.Flickr.JSONProvider
********************************************************************************************/

LCW.Flickr.JSONProvider = function(flickrSession){
    var session = flickrSession; 
    
    this.galleries = {};    
    this.galleries.getPhotos = function() {};

    this.feeds = {};
    this.feeds.public = {};
    this.feeds.public.getPhotos = function(cb){
        var result = [];
        var serviceUrl = session.serviceUri;
        serviceUrl = (serviceUrl + '/feeds/photos_public.gne?apiKey=' + session.apiKey + '&format=json');

        LCW.Util.XHR.getJSON(serviceUrl, {}, function( data ) {

            data.items.forEach(function( item, index ) {                
                var resultIndex = result.length + 1;
                
                result[resultIndex] = new LCW.Flickr.Image(item.media.m, function(img){
                    var svgDoc = window.document.getElementById('pixelshop-image-' + index);
                    var svgImage = svgDoc.querySelector('image');

                    svgDoc.setAttribute('viewBox', '0 0 ' + img.width + ' ' + img.height);
                    svgDoc.setAttribute('width', img.width);
                    svgDoc.setAttribute('height', img.height);

                    svgImage.setAttribute('width', img.width);
                    svgImage.setAttribute('height', img.height);



                });
                
                result[resultIndex].media = item.media;
                result[resultIndex].index = index;
                result[resultIndex].id = ('pixelshop-image-' + index);
                result[resultIndex].height = '100%';
                result[resultIndex].width = '100%';

            });
            
            if(cb instanceof Function){
                cb(result);
            }
            
            LCW.Flickr.App.triggerEvent('pixelshop.idataprovider.dataloaded', {});
            
            return result;
            
        }, function(){
            window.console.error('LCW.Flickr.feeds.public.getPhotos(): XHR request failed.');
        });

    };

};


/********************************************************************************************
* LCW.Flickr.Session
********************************************************************************************/

LCW.Flickr.Session = function(apiKey, serviceUri){
    this.apiKey = apiKey;
    this.serviceUri = serviceUri ? serviceUri : 'https://api.flickr.com/services/rest/';
    
    this.authenticate = function(){};
    
    this.signout = function(){};
};


/********************************************************************************************
* LCW.Flickr.Gallery
********************************************************************************************/

LCW.Flickr.Gallery = function(galleryUrl){
    this.url = galleryUrl;
    
    this.load = function(){
    }; 
    
    this.getImage = function(){
    
    };
};

/********************************************************************************************
* LCW.Flickr.Image
********************************************************************************************/

LCW.Flickr.Image = function(src, onImageloaded){
    this.id = '';
    this.index = 0;
    this.title = '';
    this.link = '';
    this.media = {s:'',m:'',b:''};
    this.description = '';
    this.published = '';
    this.author = '';
    this.author_id = '';
    this.tags = [];  
    this.width = 0;
    this.height = 0;
    
    var domNode = null;  
    
    var onLoaded = function(){
        width = domNode.width;
        height = domNode.height;
        
        if(onImageloaded instanceof Function){
            onImageloaded(this);
        }
    };
    
    if(src !== ''){
        domNode = new Image();        
        domNode.addEventListener('load', onLoaded);
        domNode.src = src;
    }
    
    return {
        'getDomNode': function(){
            return domNode;
        },
        'setDomNode': function(node){
            if(domNode !== null){
                domNode.removeEventListener('load', onLoaded);
            }
            
            domNode = node;
            domNode.addEventListener('load', onLoaded);
        }

    };

};


/********************************************************************************************
* LCW.Flickr.App
********************************************************************************************/


LCW.Flickr.App = (function(){
    var apiProvider;
    var loadedPhotos = [];
        
    var setAPIProvider = function(IAPIProvider){
        apiProvider = IAPIProvider;
    };
    
    var loadPublicPhotos = function(cb){
        apiProvider.feeds.public.getPhotos(function(imageList){
            loadedPhotos = imageList;            
            triggerEvent('pixelshop.app.publicphotosloaded', {});
            
        });
    };  

    var triggerEvent = function(evt, args){
        args = args !== undefined ? args : {};
        var event;
        try{
            event = new window.CustomEvent(evt, args);        
            window.document.body.dispatchEvent(event);

        }catch(e){
            window.console.error('LCW.Flickr.triggerEvent(): Your browser does not support CustomEvents.');
        }

    };
    
    // Public API
    return {
        'setAPIProvider': setAPIProvider,
        'triggerEvent': triggerEvent,
        'getLoadedPhotos': function(){
            return loadedPhotos;
        },
        'loadPublicPhotos': loadPublicPhotos,
        'View': LCW.Flickr.View
    };

}());


