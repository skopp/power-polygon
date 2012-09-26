/**
 * The PowerPolygon library.
 * 
 * This file contains the JavaScript library correspondent to the PowerPolygon
 * basic functionality.
 * 
 * @dependences jQuery
 * 
 * @author Felipe N. Moura <felipenmoura@gmail.com>
 * @namespace PPW
 *
 */

if(window.PPW)
    throw new Error("PowerPolygon framework already loaded!");
if(!window.jQuery)
    throw new Error("PowerPolygon requires jQuery");

window.PPW= (function($, _d){
    
    "use strict";
    
    /**************************************************
     *                PRIVATE VARIABLES               *
     **************************************************/
    var _self = this,
        _version= '2.0.0',
        // internal configuration properties
        _conf= {
            loadSteps: 5,
            curLoaded: 0,
            cameraLoaded: false,
            presentationTool: null
        },
        // user defined settings
        _settings= {
            PPWSrc: "../ppw/"
        },
        // a local reference to the $(document)
        $d= $(_d),
        // after the load, it references to the body element
        _b= null,
        // $b references to the $(document.body)
        $b= null,
        _n= navigator,
        _w= window;
    
    
    /**
     * Available listeners.
     * Used by addons.
     */
    var _listeners= {
        onstart: [],
        onfinish: [],
        onload: [],
        onnext: [],
        onprev: [],
        ongoto: [],
        onfullscreen: [],
        onshowcamera: [],
        onhidecamera: [],
        onslidetypechange: [],
        onpresentationtoolloaded: []
    }
    
    
    /**************************************************
     *                PRIVATE METHODS                 *
     **************************************************/
    
    /**
     * Adds an event listener to PPW.
     * 
     * Used by addons or external scripts, as well as internal methods calls.
     */
    var _addListener= function(evt, fn){
        if(_listeners[evt])
            _listeners[evt].push(fn);
    }
    
    var _removeListener= function(evt, fn){
        var i= 0, curEvt= null;
        
        if(curEvt= _listeners[evt]){
            i= curEvt.length;
            try{
                do{
                    if(curEvt[i] == fn){
                        curEvt[i]= false;
                    }
                }while(i--);
            }catch(e){
                console.log("[PPW][Event Callback error]: ", e);
            }
        }
    };
    
    /**
     * Triggers an event.
     * 
     * Used only internaly.
     */
    var _triggerEvent= function(evt, args){
        var i= 0, curEvt= null;
        
        if(curEvt= _listeners[evt]){
            i= curEvt.length;
            try{
                do{
                    if(curEvt[i])
                        curEvt[i](args);
                }while(i--);
            }catch(e){
                console.log("[PPW][Event Callback error]: ", e);
            }
        }
    }
    
    /**
     * Extends the PPW object.
     * 
     * Used by addons to register themselves and then, to
     * be able to receive events and the presentation data.
     */
    var _extend= function(id, conf){
        var prop= null;
        
        for(prop in conf){
            if(_listeners[prop] && typeof conf[prop] == 'function'){
                _addListener(prop, conf[prop]);
            }
        }
    }
    
    /**
     * Method called by the user to define the presentation settings.
     */
    var _init= function(conf){
        $.extend(_settings, conf);
        
        _triggerEvent('onload', conf);
    };
    
    /**
     * Sets one step ahead for the loading bar.
     * 
     * This method is used internaly only, before the splash screen.
     */
    var _setLoadingBarStatus= function(){
        _conf.curLoaded++;
        var perc= _conf.curLoaded * 100 / _conf.loadSteps;
        
        //$('#PPW-loadingbar').animate({width: perc+'%'}, 500); // someone tell me WHY IN THE HELL this line does not work? please?
        $('#PPW-loadingbar').css({width: perc+'%'});
        if(perc >= 100){
            $('#PPW-lock-loading').fadeOut();
        }
    };
    
    /**
     * Prepares the page to load the required files.
     * 
     * This method adds the loading bar and then loads the required scrips and
     * styles.
     */
    var _preparePPW= function(){
        $b.append("<div id='PPW-lock-loading' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; background-color: #f0f9f9; padding: 10px; font-family: Arial;'>\
                    Loading Contents<br/><div id='PPW-loadingbarParent'><div/><div id='PPW-loadingbar'><div/></div>");
        $('#PPW-loadingbarParent').css({
            width: '260px',
            height: '8px',
            border: 'solid 1px black',
            background: 'white',
            orverflow: 'hidden'
        });
        $('#PPW-loadingbar').css({
            width: '1px',
            height: '100%',
            background: '#f66'
        });
        
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: _settings.PPWSrc+"/_resources/ppw.css",
            onload: "PPW.setLoadingBarStatus()"
         }).appendTo("head");
        
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: _settings.PPWSrc+"/_resources/jquery-ui-1.8.23.custom.css",
            onload: "PPW.setLoadingBarStatus()"
         }).appendTo("head");
         
         $.getScript(_settings.PPWSrc+"/_resources/jquery-ui-1.8.23.custom.min.js", function(){
             PPW.setLoadingBarStatus();
         });
         
    };
    
    /**
     * Creates the spash screen.
     * 
     * This screen ofers access to useful tools before the presentation begins.
     */
    var _createOpeningToolScreen= function(){
        _b= _d.body;
        $b= $(_b);
        // preparing ppw
        _preparePPW();
        
        $.get(_settings.PPWSrc+"_tools/opening-tool-screen.html", function(data){
            _d.body.innerHTML+= data;
            _setLoadingBarStatus();
            
            $('#ppw-goFullScreen-trigger').click(_enterFullScreen);
            $('#ppw-testResolution-trigger').click(_testResolution);
            $('#ppw-testAudio-trigger').click(_testAudio);
            $('#ppw-testCamera-trigger').click(_startCamera);
            $('#ppw-testConnection-trigger').click(_testConnection);
            
            _d.getElementById('ppw-help-icon').src= _settings.PPWSrc+'/_resources/help-icon.png';
            _d.getElementById('ppw-start-presentation-icon').src= _settings.PPWSrc+'/_resources/start.png';
            _d.getElementById('ppw-presentation-tool').src= _settings.PPWSrc+'/_resources/tools-icon.png';
        });
        _loadSlide(1);
    };
    
    /**
     * Shows the resolution tool.
     * 
     * This tool allows the user to see the boundings of the presentation,
     * as well as check on colors and font sizes.
     */
    var _testResolution= function(){
        var el= $('#PPW-resolution-test-element');
        el.css({
            width: _b.offsetWidth-6+'px', // chrome has a bug with clientWidth in fullscreen
            height: _b.clientHeight-6+'px',
            display: 'block'
        });
        _showMessage("This tool helps you to identify the borders of the screen in the projector, reajust it and the resolution, as well as, for example, resize the window if necessary.<br/>\
This message should be in the center of the screen<br/><br/>Click ok when finished", function(){
            el.hide();
        });
    };
    
    /**
     * Tries to enter in fullscreen mode.
     * 
     * Triggers the event onfullscreen, passing the status: true if ok,
     * false if could not request the fullscreen on the browser.
     */
    var _enterFullScreen= function(){
    
        var fn= null,
            status= true;
        
        if(_b.requestFullScreen)
            _b.requestFullScreen();
        else if(_b.webkitRequestFullScreen)
                _b.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
             else if(_b.mozRequestFullScreen){
                     // TODO: fix this for firefox!!
                     _b.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                  }
                  else{
                    status= false;
                    alert("Your browser does not support Fullscreen from JavaScript!\nPlease, start your fullscreen with your keyboard!");
                  }
        
        _triggerEvent('onfullscreen', status);
    }
    
    /**
     * Show a message in a floating box in the center of the screen.
     */
    var _showMessage= function(msg, fn){
        var box= $('#ppw-message-box');
        $('#ppw-message-content').html(msg);
        box.show()
           .css({
               marginLeft: -(box[0].offsetWidth/2)+'px',
               marginTop: -(box[0].offsetHeight/2)+'px'
           });
        
        if(fn && typeof fn == 'function')
            $('#ppw-message-box input[type=button]').one('click', fn);
    };
    
    /**
     * Initializes and shows the camera.
     * 
     * This mathod askes for permition to use the camera, shows it ans enable
     * the binding events to it(such as gestures and clicks)
     */
    var _startCamera= function(){
        
        var video = _d.querySelector('#ppw-video-element'),
            el= $('#ppw-camera-tool');
                
        if(!_conf.cameraLoaded){
            _w.URL = _w.URL || _w.webkitURL;
            _n.getUserMedia  = _n.getUserMedia || _n.webkitGetUserMedia ||
                               _n.mozGetUserMedia || _n.msGetUserMedia;

            if (_n.getUserMedia) {
                
                _n.getUserMedia({audio: false, video: true}, function(stream) {
                    
                  try{
                      stream= _w.URL.createObjectURL(stream);
                  }catch(e){}

                  video.src = stream;
                  video.play();
                  _conf.cameraLoaded= true;
                  
                  el.draggable()
                    .resizable({
                        handles: "se, sw, ne, nw, n, e, s, w"
                    })
                    .bind('dblclick', function(){

                        var that= $(this), oldie= [];

                        if(that.data('fullscreened')){
                            oldie= that.data('oldprops');
                            that.data('fullscreened', true)
                                .show()
                                .animate({
                                     width: oldie[2]+'px',
                                     height: oldie[3]+'px',
                                     left: oldie[0]+'px',
                                     top: oldie[1]+'px'
                                 }, 500)
                                 .data('fullscreened', false);
                        }else{
                            that.data('fullscreened', true)
                                .data('oldprops', [
                                     this.offsetLeft,
                                     this.offsetTop,
                                     this.offsetWidth,
                                     this.offsetHeight
                                ])
                                .animate({
                                     width: _b.offsetWidth+'px',
                                     height: _b.offsetHeight+'px',
                                     left: '0px',
                                     top: '0px'
                                 }, 500);
                        }
                    }).css({
                        left: _b.offsetWidth - el[0].offsetWidth-10,
                        top: 0-el[0].offsetHeight
                    }).animate({top: '0px'}, 500);
                    
                    $('#ppw-camera-hide-trigger').bind('click', _pauseCamera);
                    _triggerEvent('onshowcamera', video);

                }, function(data){
                    alert("Could NOT start the video!");
                    console.error("[PPW Error]: Could now open the camera!", data);
                });
            }else{
                alert("Could NOT start the video!");
            }
        }else{
            _d.querySelector('#ppw-video-element').play();
            if(el[0].offsetTop <0){
                el.css({
                            left: _b.offsetWidth - el[0].offsetWidth-10,
                            top: 0-el[0].offsetHeight
                       }).animate({top: '0px'}, 500);
            }
        }
    };
    
    /**
     * Pauses the camera and hides it.
     */
    var _pauseCamera= function(){
        
        var el= null;
        
        if(_conf.cameraLoaded){
            el= $('#ppw-camera-tool');
            _d.querySelector('#ppw-video-element').pause();
            el.animate({top: -el[0].offsetHeight - 30})
        }
        _triggerEvent('onhidecamera');
    };
    
    /**
     * Plays an audio so the speaker can test the sound.
     */
    var _testAudio= function(){
        var el= _d.getElementById('ppw-audioTestElement');
        if(!el){
            $b.append("<audio id='ppw-audioTestElement' loop='loop' style='display: none;'>\
                                <source src='"+_settings.PPWSrc+"/_resources/water.mp3'/>\
                                <source src='"+_settings.PPWSrc+"/_resources/water.ogg'/>\
                               </audio>");
            el= _d.getElementById('ppw-audioTestElement');
        }
        el.play();
        _showMessage("Playing audio<br/><img src='"+_settings.PPWSrc+"/_resources/loadingBar.gif' style='position: relative; left: 50%; margin-left: -100px;' width='200' />",
                     function(){
                        _d.getElementById('ppw-audioTestElement').pause();
                     });
    };
    
    /**
     * Opens the presentation tool.
     * 
     * This tool shows the current slide and its notes, as well as the next
     * slide and its notes.
     * Also, the time remaning/lapsed and the shortcut keys.
     */
    var _openPresentationTool= function(){
        var toolSrc= _settings.PPWSrc+'/_tools/presentation-tool.html',
            toolName= 'PPW-Presentation-tool',
            toolProps= "width=780,height=520,left=40,top=10";
            
        _conf.presentationTool= window.open(toolSrc,
                                            toolName,
                                            toolProps);
        _conf.presentationTool.onload= function(){
            _conf.presentationTool.PresentationTool.init($, window.PPW);
            
        };
    };
    
    var _triggerPresentationToolLoadEvent= function(win){
        _triggerEvent('onpresentationtoolloaded', win);
    };
    
    /**
     * Verifies if the browser is online or not.
     */
    var _testConnection= function(){
        if(_n.onLine)
            alert("Your browser is online");
        else
            alert("There is a problem with the internet connection! Or your browser does not support the onLine API");
    };
    /**************************************************
     *                 SLIDE METHODS                  *
     **************************************************/
    var _loadSlide= function(slideNumber){
        _setLoadingBarStatus();
    };
    
    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    var _constructor= function(){
        _createOpeningToolScreen();
    };
    $(_d).ready(_constructor);
    
    /**************************************************
     *                 PUBLIC OBJECT                  *
     **************************************************/
    return {
        version: _version,
        init: _init,
        setLoadingBarStatus: _setLoadingBarStatus,
        testConnection: _testConnection,
        enterFullScreen: _enterFullScreen,
        testResolution: _testResolution,
        openPresentationTool: _openPresentationTool,
        testAudio: _testAudio,
        extend: _extend,
        startCamera: _startCamera,
        addListener: _addListener,
        removeListener: _removeListener,
        triggerPresentationToolLoadEvent: _triggerPresentationToolLoadEvent
    };
    
})(jQuery, document);