/********************************************************************************************************************************
Netspace HTML version
Developed by    -   Above Solutions Inc, India
version         -   v1.0

11-06-2013  -   Router      -   textX property added to adjust router text x value.
            -   Bubble      -   tailPosition-11 issue fixed.    
12-06-2013  -   TextComp    -   class attribute added into div.
            -   BlueButton  -   load button label from media xml using compId
            -   Activitycomp-   activity component parameter issue fixed
*********************************************************************************************************************************/
/********************************************************************************************************************************
                                                        Common Names
                                                        ------------
th  -   this
obj -   object
*********************************************************************************************************************************/
var canvas, mediaStage, root, mediaDOM, isResize;
var sWidth = 680;
var sHeight = 490;
var update = false;
var isResize = true;
var textBoxCount = 0;
var templateType = "";
var currentSlide = 0;
var btnArray = [];
var imghitShapeArr = [];
var imgLastHitShape;
/********************************************************************************************************************************
                                                    Initiate Template Process 
*********************************************************************************************************************************/

function getBgImagePath(type) {
    var path = ""
    if (type == "IMAGE") {
        path = "../../../common/images/IoE_image-and-caption_"
    }
    if (type == "VIDEO") {
        path = "../../../common/images/IoE_video_"
    }
    switch (window.parent.pageType) {
        case "text-on-left":
            path += "TextLeft.png";
            break;
        case "text-on-right":
            path += "TextRight.png";
            break;
        case "full-media":
            path += "full_page.png";
            break;
    }
    return path;
}

function initiateTemplate() {
    var isExpand = media.getPseudolocalize();
    if (isExpand) {
        //Translation
        translationProcess();
    };

    var resize = getUrlVars()['resize'];
    if (resize && resize == "false") {
        //Avoid media resizing
        isResize = false;
    };

    //Find and load Image elements
    var xml = $(canvasXML).find("slide")[0];
    var manifest = [];
    var ext = false;
    var rout = false;
    $(xml).find("element").each(function(index, element) {
        if ($(this).attr("type") == "IMAGE") {
            if ($(this).attr("src")) {
                manifest.push({ id: "bitmap_" + index, src: $(this).attr("src") });
            }
            if ($(this).attr("subType") && $(this).attr("subType").toLowerCase() == "bg") {
                // manifest.push({id:"bitmap_"+index,src:getBgImagePath($(this).attr("bgType"))});
                // $(this).attr("src",getBgImagePath($(this).attr("bgType")));
                var imgsrc = getBgImagePath($(this).attr("bgType"))
                var w = window.innerWidth;
                var h = window.innerHeight;

                //bContainer.addChild(hitShape);
                $('body').append("<img id='bgImg' alt='background image' src='"+imgsrc+"' />");
                $('#bgImg').attr('width', w);
                $('#bgImg').attr('height', h);
            }
        }
        if ($(this).attr("type") == "ROUTER") {
            if (rout == false) {
                rout = true;
                manifest.push({ id: "router_img", src: "../../../common/images/Router.png" })
            };
        }
        if ($(this).attr("type") == "ACTIVITY") {
            if (ext == false) {
                ext = true;
                manifest.push({ id: "ext_lib", src: "../../../common/scripts/templates_ext_dev.js" })
            };
        }
    });

    //alert(manifest.length);

    loadImages(manifest, initSlide);
}
/********************************************************************************************************************************
                                                    Initiate Slide Process 
*********************************************************************************************************************************/
function initSlide() {
    canvas = document.getElementById("canvas");
    mediaStage = new createjs.Stage(canvas);
    //For media container DOMElement
    $("#canvas").after("<div id='mediaContainer' style='top:0px;left:0px;-moz-user-select: none;-webkit-user-select: none;cursor: default;text-transform: none;'></div>");
    $("#mediaContainer").append("<div id='commonMediaText'></div>");

    //Media container DOMElement    
    mediaDOM = new createjs.DOMElement(document.getElementById("mediaContainer"));
    mediaStage.addChild(mediaDOM);
    //For touch support
    if (createjs.Touch.isSupported()) { createjs.Touch.enable(mediaStage); }
    //For Mouse event support
    mediaStage.enableMouseOver();
    mediaStage.mouseMoveOutside = true;
    //Find the first slide node
    var firstNode = $(canvasXML).find("slide")[0];
    //Check stage width and height
    if ($(firstNode).attr("width")) sWidth = $(firstNode).attr("width");
    if ($(firstNode).attr("height")) sHeight = $(firstNode).attr("height");
    try {
    if (window.parent.pageType == "full-media") sWidth = 1000;
    } catch (e) {
        //
        sWidth = 1000;
    }
    //Create Root Container for media
    root = new RootContainer();
    mediaStage.addChild(root);
    //Ticker
    createjs.Ticker.setFPS(24);
    createjs.Ticker.addListener(mediaStage);
    //Load slide    
    templateType = $(firstNode).attr("type") ? $(firstNode).attr("type") : "SINGLE";
    root.addChild(getCJSElement(templateType, firstNode, "commonMediaText"));
    update = true;
    //Hide preloader
    $("#preloader").hide();
}


/********************************************************************************************************************************
                                                        Get Media XML text 
                                                        ------------------
    var text = getMediaText("ID_title");
*********************************************************************************************************************************/
function getMediaText(id) {
    return $(mediaXML).find("component#" + id).text();
}

function loadMuttonAssets() {

}
/********************************************************************************************************************************
                                                    Get createJS Media Element 
                                                    --------------------------
    Image       -   var element = getCJSElement("IMAGE",{src:"",x:"",y:"",width:"",height:""});
    Text        -   var element = getCJSElement("TEXT",{compId:"",x:"",y:"",width:"",div:"parent div id",expand:"down",align:"center"});
    Router      -   var element = getCJSElement("ROUTER",{x:"",y:"",textId:"",width:"",height:"",div:"parent div id"});
    Bubble      -   var element = getCJSElement("BUBBLE",{x:"",y:"",width:"",compId:"",size:"11",div:"parentdiv" ,align:"center",tailPosition:"2",tailFlip:"1"});
    TextBox     -   var element = getCJSElement("TEXTBOX",{x:"",y:"",width:"",height:"",div:"parent div id",titleId:"",bodyId:"",animated:"1",visible:"0"});
    Blue Button -   var element = getCJSElement("BLUE_BUTTON",{x:"",y:"",width:"",height:"",div:"parent div id",id:"",text:"",callback:function(id){}});
*********************************************************************************************************************************/
function getCJSElement(type, obj, divId, xmlElement) {
    if (divId) obj.div = divId;
    var element;
    switch (type) {
        case "SINGLE":
            element = new Slide(obj, divId);
            break;
        case "MBAR":
            element = new MultiBar(obj);
            break;
        case "MBUTTON":
            var imgArray = [];
            $(obj).children().each(function(index, ele) {
                if (ele.attributes["buttonType"]) {
                    if (ele.attributes["buttonType"].value == "IMAGE_PLUS") {
                        imgArray.push({ src: ele.attributes["imgSel"].value, id: "img_" + imgArray.length });
                    }
                }
            });

            if (imgArray.length == 0) {
                element = new MButton(obj, divId);
            } else {
                element = new MButtonAssetComp(imgArray, obj, divId);
            }
            break;
        case "IMAGE":
            element = new ImageComp(obj);
            break;
        case "TEXT":
            element = new TextComp(obj);
            break;
        case "SHAPE":
            element = drawGraphics(obj);
            break;
        case "ROUTER":
            element = new RouterComp(obj);
            break;
        case "BUBBLE":
            element = new BubbleComp(obj);
            break;
        case "TEXTBOX":
            textBoxCount++;
            element = new TextBoxComp(obj);
            break;
        case "BLUE_BUTTON":
            element = new BlueButton(obj);
            break;
        case "SYNTAX_BUTTON":
            element = new SyntaxButton(obj);
            break;
        case "IMAGE_BUTTON":
            element = new ImageButton(obj);
            break;
        case "IMAGE_BUTTON_PLUS":
            element = new ImageButtonPlus(obj);
            break;
        case "ACTIVITY":
            element = new ActivityComp(obj, xmlElement);
            break;
        case "VIDEO":
            element = new VideoComp(obj);
            break;
        default:
            element = new createjs.Shape();
            break;
    }
    return element;
}
/********************************************************************************************************************************
                                                        Root Container
*********************************************************************************************************************************/
(RootContainer = function() {
    this.initialize();

    var th = this;
    /*//Draw hidden background to occupy the stage size
    var bgShape = new createjs.Shape();
    bgShape.graphics.beginFill("#FFF").drawRect(0, 0, sWidth, sHeight);
    bgShape.alpha = 0.5;
    th.addChild(bgShape);*/

    //Resize function
    canvas.width = sWidth;
    canvas.height = sHeight;

    //document.body.style.overflow = "auto";

    $("#htmlMedia").css("width", "100%");
    $("#htmlMedia").css("height", "100%");

    th.resizer = function() {

        var ratio = Math.min(parseInt($("#htmlMedia").css("width")) / sWidth, parseInt($("#htmlMedia").css("height")) / sHeight);

        canvas.width = parseInt($("#htmlMedia").css("width"));
        canvas.height = parseInt($("#htmlMedia").css("height"));

        var xpos = 0;
        var ypos = 0;

        th.scaleX = ratio;
        th.scaleY = ratio;
        th.x = xpos;
        th.y = ypos;
        mediaStage.update();

    }
    th.tick = function() {
        if (update) {
            update = false;
            mediaStage.update();
        }
    }

    $(window).resize(function() {
        th.resizer();

        //video bg resize
        var w = window.innerWidth;
        var h = window.innerHeight;
        $('body > img').attr('width', w);
        $('body > img').attr('height', h);
    });

    th.resizer();

}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                    Single Slide Container
*********************************************************************************************************************************/
(Slide = function(xml, divId) {
    this.initialize();

    var th = this;
    var slideDivId = divId;
    var lastDivId;
    th.tb_dId = "dummy_dId";

    $(xml).find("element").each(function(index, element) {
        var obj = {};
        for (var i = 0; i < this.attributes.length; i++) {
            obj[this.attributes[i].name] = this.attributes[i].value;
        }
        /*
        $.each(this.attributes,function(i, at)
        {
            obj[at.name] = at.value;                
        }); 
        */
        var displayObject = getCJSElement($(this).attr("type"), obj, slideDivId, this);
        th.addChild(displayObject);
        //To find last div tag      
        if (obj.compId) lastDivId = obj.compId;
        if (obj.textId) lastDivId = obj.textId;
    });
    th.hide = function() {
        var sDiv = document.getElementById(slideDivId)
        sDiv.style.cssText = "position: absolute; left: -99999px;";

        var tDiv = $("#" + slideDivId + " #" + th.tb_dId);
        if (tDiv)
            tDiv.css("display", "block");

        $("#"+slideDivId).hide(); //removed comment to fix dnd extra tab clicks issues
        th.visible = false;
        update = true;
    };
    th.show = function() {
        var sDiv = document.getElementById(slideDivId)
        sDiv.style.cssText = "position: absolute; left: 0px;";
        $("#"+slideDivId).show(); //removed comment to fix dnd extra tab clicks issues
        th.visible = true;
        update = true;
    };
    if (lastDivId) {
        var cInter = setInterval(function() {
            if (document.getElementById(lastDivId)) {
                clearInterval(cInter);
                //Callback public function          
                //if(typeof slideViewDidLoad == 'function') slideViewDidLoad(th,slideDivId.split("_")[1]);
                if (typeof slideViewDidLoad == 'function') slideViewDidLoad(th, slideDivId.substr(6, slideDivId.length));
            }
        }, 10);
    } else {
        if (typeof slideViewDidLoad == 'function') slideViewDidLoad(th, slideDivId.substr(6, slideDivId.length));
    }
    update = true;

	if(window.location.host == "review.netacad.net"){
		//   search for duplicate IDs
		var foundDupes=false;
		$('[id]').each(function(){
  			var ids = $('[id="'+this.id+'"]');
  			if(ids.length>1 && ids[0]==this){
  				if(this.id==""){
    				//console.warn('Multiple objects with ID:  ""');
    			}else{
    				console.warn('Multiple objects with ID:  '+this.id);
    			}
				foundDupes = true;
			}
		});
		if(foundDupes){
			console.log("****    Duplicate Ids found in:  "+slideDivId+"  of:"+window.location.pathname)
		};
        // look for img elements that are missing alt.
        $('#body img').each(function() {
            if ( ! $(this).attr('alt'))
                console.log("++++++  image element missing ALT in:  window.location.pathname")
        });
	}

}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                Multiple Slides with Bar Button
*********************************************************************************************************************************/
(MultiBar = function(xml) {
    this.initialize();

    var th = this;
    var slideArray = [];
    var bContainer, selectImg, normalImg, singleDigit, tempImg, hitShape, normalCont, selectedCont, sType, slide, obj, xElement, currentBtn;
    //Mouse over event
    th.mouseOver = function(e) {
            if (e.target == currentBtn) return;
            document.body.style.cursor = 'pointer';
            e.target.normalCont.visible = true;
            e.target.selectedCont.visible = false;
            update = true;
        }
        //Mouse out event
    th.mouseOut = function(e) {
            document.body.style.cursor = 'default';
            if (e.target == currentBtn) return;
            e.target.selectedCont.visible = true;
            e.target.normalCont.visible = false;
            update = true;
        }
        //Click event
    th.mouseClick = function(e) {
            if (e.target == currentBtn) return;
            currentBtn.selectedCont.visible = true;
            currentBtn.normalCont.visible = false;
            slideArray[currentBtn.btnId].hide();
            //slideArray[currentBtn.btnId].visible = false;
            currentBtn = e.target;
            th.slideHandler();
        }
        //Handle slide Events   
    th.slideHandler = function() {
            currentBtn.selectedCont.visible = false;
            currentBtn.normalCont.visible = true;
            //slideArray[currentBtn.btnId].visible = true;
            slideArray[currentBtn.btnId].show();
            update = true;
        }
        //For loading Slide Assets  
    th.loadSlideAssets = function() {
        var slideCnt = 0;
        $(xml).children().each(function(index, element) {
            //Find elements     
            xElement = $(this).find("element")[0];
            if (xElement) {
                //Slide content 
                slideCnt++;

                sType = $(this).attr("type") ? $(this).attr("type") : "SINGLE";
                $("#commonMediaText").append("<div id='slide_" + slideCnt + "'></div>");
                slide = getCJSElement(sType, element, "slide_" + slideCnt);
                th.addChild(slide);
                slide.hide();
                //slide.visible = false;                
                slideArray[slideArray.length] = slide;
            } else {
                //Element content
                obj = {};
                for (var i = 0; i < this.attributes.length; i++) {
                    obj[this.attributes[i].name] = this.attributes[i].value;
                }
                th.addChild(getCJSElement($(this).attr("type"), obj));
            }
        });
        //Provide slide count to parent template
        htmlSlideCount = slideCnt;
       // media.ready();
        btnArray = slideArray;
        media.ready();
    }

    th.loadButtons = function(imgs) {
        //load slides assets
        th.loadSlideAssets();

        tempImg = new createjs.Bitmap(imgs["btn_bar"]); //ImageComp({src:"../../../common/images/btn_bar.png",x:,y:1})
        tempImg.x = sWidth - 30;
        tempImg.y = 1;
        //th.addChild(tempImg);

        for (var i = 0; i < $(xml).find("slide").length; i++) {
            singleDigit = (i + 1) < 10 ? "0" + (i + 1) : i;
            singleDigit = i == 9 ? 10 : singleDigit;
            normalImg = imgs["btn" + singleDigit];
            selectImg = imgs["btn" + singleDigit + "_sel"];;

            //Button container
            bContainer = new createjs.Container();
            //Normal button image
            tempImg = new createjs.Bitmap(normalImg);
            bContainer.addChild(tempImg);
            bContainer.normalCont = tempImg;
            //Selected button image
            tempImg = new createjs.Bitmap(selectImg);
            bContainer.addChild(tempImg);
            bContainer.selectedCont = tempImg;
            //Button Hit area
            hitShape = new createjs.Shape()
            hitShape.graphics.beginFill().drawRect(0, 0, 26, 36);
            bContainer.addChild(hitShape);
            //Button id     
            bContainer.btnId = i;
            //Mouse events
            bContainer.onMouseOver = th.mouseOver;
            bContainer.onMouseOut = th.mouseOut;
            bContainer.onClick = th.mouseClick;
            //th.addChild(bContainer);      
            bContainer.x = sWidth - 28;
            bContainer.y = 3 + (i * 36);
            if (i == 0) currentBtn = bContainer;
        }
        //Load first slide assets
        th.slideHandler();
    }

    //Loading Button Assets  
    var manifest = [{ id: "btn_bar", src: "../../../common/images/btn_bar.png" }];

    var cnt = 0;
    $(xml).children().each(function(index, element) {
        if ($(this).find("element")[0]) {
            cnt++;
        }
    });

    for (var i = 0; i < cnt; i++) {
        singleDigit = i < 10 ? "0" + (i + 1) : i;
        singleDigit = i == 9 ? 10 : singleDigit;
        normalImg = "../../../common/images/btn" + singleDigit + ".png";
        selectImg = "../../../common/images/btn" + singleDigit + "_sel.png";
        manifest.push({ id: "btn" + singleDigit, src: normalImg });
        manifest.push({ id: "btn" + singleDigit + "_sel", src: selectImg });
    }

    loadImages(manifest, th.loadButtons);

}).prototype = new createjs.Container();

/********************************************************************************************************************************
                                                Multiple Slides with Bar Button
*********************************************************************************************************************************/
(MButtonAssetComp = function(imgArray, obj, divId) {
    this.initialize();
    var isHide = false;
    var th = this;
    var mbutton;
    this.imgLoaded = function() {
        mbutton = new MButton(obj, divId);
        th.addChild(mbutton);

        if (isHide) {
            mbutton.hide();
        } else {
            mbutton.show();
        }
    }
    th.hide = function() {
        isHide = true;
        if (mbutton) { mbutton.hide() };
    }
    th.show = function() {
        isHide = false;
        if (mbutton) { mbutton.show() };
    }
    loadImages(imgArray, this.imgLoaded);
}).prototype = new createjs.Container();

(MButton = function(xml, divId) {
    this.initialize();

    var th = this;
    var slideDivId = divId;
    var slideArray = [];
    var slideCnt = 0;
    var currentSlide = 0;
    var button, xElement, slide, obj, slideStage;

    var stageWidth = templateType == "MBAR" ? sWidth - 20 : sWidth;

    th.clickHandler = function(id, btn) {
        slideArray[currentSlide].button.setSelected(false);
        slideArray[currentSlide].slide.hide();
        slideArray[currentSlide].stage.update();
        currentSlide = id - 1;
        th.slideHandler();
    }

    th.slideHandler = function() {
        slideArray[currentSlide].button.setSelected(true);
        slideArray[currentSlide].slide.show();
        slideArray[currentSlide].stage.update();
        update = true;
    }

    $(xml).children().each(function(index, element) {
        //Find elements     
        xElement = $(this).find("element")[0];
        obj = {};
        for (var i = 0; i < this.attributes.length; i++) {
            obj[this.attributes[i].name] = this.attributes[i].value;
        }

        if (xElement) {
            //Slide content 
            slideCnt++;
            $("#" + slideDivId).append('<div id="' + slideDivId + '_' + slideCnt + '" style="visiblity:hidden;top:0px;left:0px;pointer-events:none;"></div>');
            $("#" + slideDivId + "_" + slideCnt).append('<div id="' + slideDivId + '_canvas_div_' + slideCnt + '"></div>');

            $("#" + slideDivId + "_canvas_div_" + slideCnt).append('<canvas id="' + slideDivId + '_slide_canvas_' + slideCnt + '" width="' + stageWidth + '" height="400"></canvas>');
            var dom = new createjs.DOMElement(document.getElementById(slideDivId + "_" + slideCnt));
            th.addChild(dom);
            slideStage = new createjs.Stage(document.getElementById(slideDivId + "_slide_canvas_" + slideCnt));
            slide = getCJSElement("SINGLE", element, slideDivId + "_canvas_div_" + slideCnt);
            slideStage.addChild(slide);
            slide.hide();

            if (obj.buttonType == "BLUE") {
                button = getCJSElement("BLUE_BUTTON", { x: obj.buttonX, y: obj.buttonY, width: obj.buttonWidth, height: obj.buttonHeight, div: slideDivId, id: slideCnt, callback: th.clickHandler, compId: obj.compId });
            } else if (obj.buttonType == "IMAGE") {
                button = getCJSElement("IMAGE_BUTTON", { x: obj.buttonX, y: obj.buttonY, div: slideDivId, id: slideCnt, callback: th.clickHandler, compId: obj.compId, imgSel: obj.imgSel, imgOver: obj.imgOver, hover: obj.hover });
            } else if (obj.buttonType == "IMAGE_PLUS") {
                button = getCJSElement("IMAGE_BUTTON_PLUS", { x: obj.buttonX, y: obj.buttonY, imageType: obj.imageType, imageRadius: obj.imageRadius, imgX: obj.imgX, imgY: obj.imgY, imgWidth: obj.imgWidth, imgHeight: obj.imgHeight, div: slideDivId, id: slideCnt, callback: th.clickHandler, compId: obj.compId, imgSel: obj.imgSel, imgOver: obj.imgOver, imgShadow: obj.imgShadow, selected: obj.selected });
            } else {
                //Place holder for custom button
                button = new createjs.Shape();
            }

            slide.button = button;

            th.addChild(button);
            slideArray[slideArray.length] = { slide: slide, button: button, stage: slideStage };
        } else {
            //Element content                       
            th.addChild(getCJSElement($(this).attr("type"), obj, slideDivId));
        }
        if (obj.selected && obj.selected == "true") {
            currentSlide = slideCnt - 1;
        }
    });
    if (currentSlide != 0) {
        th.slideHandler();
    }

    if (!$(xml).find("slide").attr("selected") || $(xml).find("slide").attr("selected") == "true") {
        //Load first slide
        th.slideHandler();
    }

    th.hide = function() {
        var sDiv = document.getElementById(slideDivId)
        sDiv.style.cssText = "position: absolute; left: -99999px;";
        $("#"+slideDivId).hide(); 
        th.visible = false;
        update = true;
    };
    th.show = function() {
        var sDiv = document.getElementById(slideDivId)
        sDiv.style.cssText = "position: absolute; left: 0px;";
        $("#"+slideDivId).show(); 
        th.visible = true;
        update = true;
    };
    update = true;
}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                        Video Component
                                                        ---------------
<element type="VIDEO" videoId="youtubeid" x="" y="" width="" height=""/>
*********************************************************************************************************************************/
(VideoComp = function(obj) {
    this.initialize();

    var th = this;
    obj.div = obj.div ? obj.div : "commonMediaText";
    obj.width = obj.width ? obj.width : 100;
    obj.height = obj.height ? obj.height : 50;


    var iframeTitle = $('#text h1', window.parent.document).text();
    if (obj.api.toLowerCase() == "youtube") {
        var videoFrame;
        if (obj.src) {
            videoFrame = document.createElement("video");
            videoFrame.controls = 1;
            videoFrame.src = obj.src;

        } else if (obj.videoId) {
            videoFrame = document.createElement("iframe");
            videoFrame.title = iframeTitle;
            videoFrame.src = "//www.youtube.com/embed/" + obj.videoId + "?version=3&fs=1&modestbranding=1&rel=0&color=white&theme=light&autohide=0&frameborder=0&allowfullscreen";
        }
        videoFrame.width = 640;
        videoFrame.height = 390;
        videoFrame.id = "vdo";
        videoFrame.style.cssText = "position:absolute;top:0px;left:0px;visibility:hidden;border:0;-webkit-backface-visibility: hidden !important;"
        $("#" + obj.div).append(videoFrame);

        var domFrame = new createjs.DOMElement(videoFrame);
        domFrame.id = "video";
        domFrame.scaleX = domFrame.scaleY = (obj.width / 640);
        th.addChild(domFrame);

        th.x = obj.x ? parseFloat(obj.x) : 0;
        th.y = obj.y ? parseFloat(obj.y) : 0;

        update = true;

        function resize() {
            th.scaleX = th.scaleY = 1;
            th.x = obj.x ? parseFloat(obj.x) : 0;
            th.scaleX = th.scaleY = 1 - (1 - ((1 / root.scaleX)));
            th.x += (obj.width - (obj.width * th.scaleX)) / 2;
            // if (createjs.Touch.isSupported()) th.x+=15;
        }

        $(window).resize(resize);
        resize();
    } else if (obj.api.toLowerCase() == "wistia") {
        $("#htmlMedia").css("height", "100%");
        $("#htmlMedia").css("width", "100%");
        $("#canvas").css("height", "100%");
        $("#canvas").css("width", "100%");
        $('<script src="//fast.wistia.com/assets/external/E-v1.js" async></' + 'script>').appendTo(document.body);
        $('<iframe src="//fast.wistia.net/embed/iframe/' + obj.videoId + '?seo=false" title="'+iframeTitle+'" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" allowfullscreen mozallowfullscreen webkitallowfullscreen oallowfullscreen msallowfullscreen width="' + obj.width + '" height="' + obj.height + '" style="left:' + obj.x + '; position:absolute;top:' + obj.y + ';"></iframe>').appendTo(document.body);
    } else {
        loadScript("https://sadmin.brightcove.com/js/BrightcoveExperiences.js", brightcoveLoaded);
    }

    function brightcoveLoaded() {
        //alert("loaded brightcrove....");
        var xpos = (parseInt($("#htmlMedia").css("width")) / 2 - obj.width / 2);
        var ypos = (parseInt($("#htmlMedia").css("height")) / 2 - obj.height / 2);

        $("#" + obj.div).append('<div id="bc_vid" style="position: absolute;top:' + ypos + 'px;left:' + xpos + 'px;"><object id="video1" class="BrightcoveExperience">' +
            '<param name="bgcolor" value="#FFFFFF" />' +
            '<param name="width" value="' + obj.width + '" />' +
            '<param name="height" value="' + obj.height + '" />' +
            '<param name="playerID" value="3677677591001" />' +
            '<param name="playerKey" value="AQ~~,AAACaPvlvkE~,zCw2Hw90_KQ_-Dx6JuQmRi84dqeyKuLs" />' +
            '<param name="isUI" value="true" />' +
            '<param name="isVid" value="true" />' +
            '<param name="dynamicStreaming" value="true" />' +
            '<param name="wmode" value="transparent" />' +
            '<param name="includeAPI" value="true" />' +
            '<param name="templateLoadHandler" value="onTemplateLoad" />' +
            '<param name="templateReadyHandler" value="onTemplateReady" />' +
            '<param name="@videoPlayer" value="' + obj.videoId + '" />' +
            '<param name="htmlFallback" value="true" />' +
            '<param name="secureConnections" value="true" />' +
            '<param name="secureHTMLConnections" value="true" />' +
            '</object>' +
            '<script language="Javascript" type="text/javascript" src="http://www.cisco.com/assets/swa/flash/cisco-html5-analytics.js"></script>' +

            '</div>');

        setTimeout(brightcove.createExperiences, 1000);


    }

    function resize() {
        var xpos = (parseInt($("#htmlMedia").css("width")) / 2 - obj.width / 2);
        var ypos = (parseInt($("#htmlMedia").css("height")) / 2 - obj.height / 2);

        $("#bc_vid").css("top", ypos);
        $("#bc_vid").css("left", xpos);

    }

    $(window).resize(resize);

}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                        Image Component
                                                        ---------------
<element type="IMAGE" subType="STD" src="" x="" y="" width="" height=""/>
*********************************************************************************************************************************/
(ImageComp = function(obj) {
    this.initialize();

    var th = this;
    var img, bitmap, width, height;

    img = new Image();
    img.onload = function(ev) { th.imageLoaded(ev) };
    $("#preloader").show();

    if(obj.src != undefined){
        img.src = obj.src;
    }else{
        img.src="";
    }

    th.imageLoaded = function(ev) {
        $("#preloader").hide();
        obj.width = obj.width ? obj.width : ev.target.width;
        obj.height = obj.height ? obj.height : ev.target.height;
        if (obj.subType == "bg") {
            obj.ratio = 1;
        } else {
            //Calculating Image size ratio
            obj.ratio = Math.min((obj.width / ev.target.width), (obj.height / ev.target.height));
        }


        //Check subtype 
        obj.subType = obj.subType ? obj.subType : "none";
        obj.bgType = obj.bgType ? obj.bgType : "none";


        width = ev.target.width * obj.ratio;
        height = ev.target.height * obj.ratio;

        //Bitmap
        bitmap = new createjs.Bitmap(ev.target);
        bitmap.scaleX = bitmap.scaleY = obj.ratio;

        if (obj.rotation) {
            bitmap.scaleY = -obj.ratio;
            bitmap.regY = height / 2;
            bitmap.regX = width / 2;
            bitmap.rotation = obj.rotation;

        }
        if (obj.maskX || obj.maskY || obj.maskWidth || obj.maskHeight) {
            var maskShape1 = new createjs.Shape();
            maskShape1.graphics.beginFill().drawRect(obj.maskX, obj.maskY, obj.maskWidth, obj.maskHeight);
            th.addChild(maskShape1);
            bitmap.mask = maskShape1;
        }

        if (obj.rotation) {
            // th.scaleY = -obj.ratio;
            //th.regY = height/2;
            //th.regX = width/2;
            //th.rotation=obj.rotation;

        }

        th.addChild(bitmap);
        //Check subtype

        switch (obj.subType) {
            case "STD":
                th.std();
                break;
            case "HTML":
                th.removeChild(bitmap);
                break;

            case "HOTSPOT":

                break;

        }
        if (obj.x) th.x = obj.x;
        if (obj.y) th.y = obj.y;
        if (th.getStage()) th.getStage().update();
        update = true;
    }
    th.std = function() {
        //Shadow shape
        var shadowShape = new createjs.Shape();
        shadowShape.graphics.beginFill('rgba(0,0,0,1)').drawRoundRect(0, 0, width, height, 8);
        shadowShape.shadow = new createjs.Shadow("#000000", 3, 3, 10);
        shadowShape.x = shadowShape.y = 0.5;
        shadowShape.scaleX = shadowShape.scaleY = 0.99;
        th.addChild(shadowShape);
        th.swapChildren(bitmap, shadowShape);
        //Mask shape
        var maskShape = new createjs.Shape();
        maskShape.graphics.beginFill().drawRoundRect(0, 0, width, height, 8);
        th.addChild(maskShape);
        bitmap.mask = maskShape;
    }


}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                    Lazy Text Component
                                                    -------------------
    Title   -   <element type="TEXT" subType="TITLE" compId="ID_title"/>
    Table   -   <element type="TEXT" subType="TABLE" compId="ID_table" x="" y="" width=""/>
    Label   -   <element type="TEXT" compId="ID_s3_txt05" x="101.7" y="274.60" width="76" expand="down" align="center" bgColor="#FDE6D4" borderColor="#F68026" border="2" corner="5"/>
*********************************************************************************************************************************/
(TextComp = function(obj) {
    this.initialize();

    var th = this;
    var divElement, width, height, widthStr;


    obj.color = obj.color ? obj.color : "#393536";
    obj.size = obj.size ? obj.size : 11;
    obj.align = obj.align ? obj.align : "left";
    obj.width = obj.width ? parseFloat(obj.width) : "auto";
    obj.expand = obj.expand ? obj.expand : "undefined";
    obj.style = obj.style ? obj.style : "";
    obj.div = obj.div ? obj.div : "commonMediaText";
    obj.subType = obj.subType ? obj.subType : "LABEL";
    obj.x = obj.x ? parseFloat(obj.x) : 0;
    obj.y = obj.y ? parseFloat(obj.y) : 0;

    if (obj.bug) obj.style += "border:0.5px solid #00FF00;";

    if (obj.subType == "TITLE") {
        obj.align = "center";
        obj.size = 17;
        obj.x = 5;
        obj.y = 7;
        obj.expand = "down";
        obj.width = sWidth - 10;
        obj.bold = true;
        /*if($($(canvasXML).find("slide")[0]).attr("type") == "MBAR")
        {        
            obj.width = sWidth-32;    
        }
        else
        {
            
        }*/
    }
    widthStr = obj.width + "px";
    //For table
    if (obj.subType == "TABLE") {
        if (obj.height) obj.style += "max-height:" + parseFloat(obj.height) + "px;overflow:auto;";
        obj.class = "mtable";
    }
    //Text from canvas xml
    if (obj.textId) {
        obj.id = obj.textId;
        widthStr = obj.width == "auto" ? "auto" : obj.width + "px";
        obj.text = $(canvasXML).find("text#" + obj.textId).text();
    }
    //Text from media xml
    if (obj.compId) {
        obj.id = obj.compId;
        obj.text = getMediaText(obj.compId);
    }
    //For bold text
    //if(obj.bold && (obj.bold == "1")) obj.style += "font-weight:bold;";  
    if (obj.bold && (obj.bold == "1")) {
        if (obj.text.indexOf("<b>") == -1)
            obj.style += "font-weight:bold;";
    }

    obj.size = obj.size / 12;
    obj.x = obj.x + 10;

    divElement = document.createElement("div");
    if (obj.class) divElement.setAttribute("class", obj.class);
    divElement.style.cssText = "top:0px;left:0px;width:" + widthStr + ";text-align:" + obj.align + ";font-size:" + obj.size + "em;color:" + obj.color + ";" + obj.style + ";visibility:hidden;";
    if (obj.id) divElement.id = obj.id;
    divElement.innerHTML = obj.text;
    $("#" + obj.div).append(divElement);

   //obj.subType == "TITLE" ? divElement.tabIndex = 1 : divElement.tabIndex = 0;
    //var ti = obj.id.substr(obj.id.length - 2).indexOf("_") == 0 ?parseInt(obj.id.substr(obj.id.length - 1)):parseInt(obj.id.substr(obj.id.length - 2));
    obj.subType == "TITLE" ? divElement.tabIndex = 0 : divElement.tabIndex = obj.tabOrder?obj.tabOrder: 0;
    
    switch (obj.expand) {
        case "up+down":
            if ($(divElement).height() > (obj.size * 12) + 3) {
                obj.y = obj.y - ($(divElement).height() / 2) + ((obj.size * 12 + 2) / 2);
            }
            break;
        case "down":
            obj.y = obj.y;
            break;
        case "up":
            if ($(divElement).height() > (obj.size * 12) + 3) {
                obj.y = obj.y - ($(divElement).height()) + ((obj.size * 12) + 2);
            }
            break;
        case "left":
            $(divElement).css('width', 'auto');
            var maxWidth = obj.width;
            if (maxWidth < $(divElement).width()) {
                maxWidth = $(divElement).width();
                obj.x = obj.x - (maxWidth - obj.width);
            }
            $(divElement).css('width', (maxWidth + 1) + 'px');
            break;
        case "right":

            $(divElement).css('width', 'auto');
            var maxWidth = obj.width;
            if (maxWidth < $(divElement).width()) {
                maxWidth = $(divElement).width();
            }

            $(divElement).css('width', (maxWidth + 1) + 'px');
            break;
        case "left+right":

            $(divElement).css('width', 'auto');
            var maxWidth = obj.width;
            if (maxWidth < $(divElement).width()) {
                maxWidth = $(divElement).width();
                obj.x = obj.x - (maxWidth / 2) + (obj.width / 2);
            }

            $(divElement).css('width', (maxWidth + 1) + 'px');
            break;
        default:
            obj.x = obj.x;
            obj.y = obj.y;
            break;
    }


    var domElement = new createjs.DOMElement(divElement);

    height = $(divElement).height();
    width = $(divElement).width();

    //background graphics    
    var bg = new createjs.Shape();
    th.addChild(bg);

    //return height of the text
    th.height = function(){
        return height;
    }
    //return width of the text
    th.width = function(){
        return width;
    }

    th.drawBG = function() {
        if (obj.bgColor || obj.borderColor) {
            obj.bgColor = obj.bgColor ? obj.bgColor : "";
            obj.corner = obj.corner ? parseInt(obj.corner) : 0;
            obj.border = obj.border ? parseInt(obj.border) : 1;
            obj.borderColor = obj.borderColor ? obj.borderColor : "";
            height = $(divElement).height();
            width = $(divElement).width();

            width = width + (2 * obj.border);
            height = height + (2 * obj.border);
            bg.graphics.clear();
            bg.graphics.setStrokeStyle(obj.border);
            bg.graphics.beginStroke(obj.borderColor);
            if (obj.subType == "BUBBLE") {
                bg.graphics.beginFill(obj.bgColor).drawRoundRect(0, 1, width + 2, height, obj.corner);
                bg.y = -2;
                domElement.x = -7;
                domElement.y = 2;
                obj.y = obj.y + 3;
            } else {
                bg.graphics.beginFill(obj.bgColor).drawRoundRect(-2.5 - obj.border, -2.5, width + 5, height + 5, obj.corner);
                bg.y = -2.5;
            }
            if (obj.bgWithoutBorder == "true") {
                bg.x = 0;
            } else {
                bg.x = -10;
            }


        }
    }

    th.drawBG();

    if (obj.rotation) th.rotation = obj.rotation;
    th.x = obj.x - 10;
    th.y = obj.y;
    th.addChild(domElement);
}).prototype = new createjs.Container();
/********************************************************************************************************************************
													Lazy Button Text Component
													-------------------
	Title 	-	<element type="TEXT" subType="TITLE" compId="ID_title"/>
	Table 	-	<element type="TEXT" subType="TABLE" compId="ID_table" x="" y="" width=""/>
	Label 	-	<element type="TEXT" compId="ID_s3_txt05" x="101.7" y="274.60" width="76" expand="down" align="center" bgColor="#FDE6D4" borderColor="#F68026" border="2" corner="5"/>
*********************************************************************************************************************************/
(ButtonLabelComp = function(obj) {
    this.initialize();

    var th = this;
    var divElement, width, height, widthStr, heightStr, topStr, leftStr;


    obj.color = obj.color ? obj.color : "#393536";
    obj.size = obj.size ? obj.size : 11;
    obj.align = obj.align ? obj.align : "left";
    obj.width = obj.width ? parseFloat(obj.width) : "auto";
    obj.expand = obj.expand ? obj.expand : "undefined";
    obj.style = obj.style ? obj.style : "";
    obj.div = obj.div ? obj.div : "commonMediaText";
    obj.subType = obj.subType ? obj.subType : "LABEL";
    obj.x = obj.x ? parseFloat(obj.x) : 0;
    obj.y = obj.y ? parseFloat(obj.y) : 0;

    if (obj.bug) obj.style += "border:0.5px solid #00FF00;";

    if (obj.subType == "TITLE") {
        obj.align = "center";
        obj.size = 17;
        obj.x = 5;
        obj.y = 7;
        obj.expand = "down";
        obj.width = sWidth - 10;
        obj.bold = true;
        /*if($($(canvasXML).find("slide")[0]).attr("type") == "MBAR")
        {        
            obj.width = sWidth-32;    
        }
        else
        {
            
        }*/
    }
    widthStr = obj.width + "px";

    heightStr = "auto";
    if(obj.height){
    	heightStr = obj.height + "px";
    }

    topStr = "0px";
    if(obj.top){
    	topStr = obj.top + "px";
    }

    leftStrt = "0px";
    if(obj.left){
    	leftStr = obj.left + "px";
    }

    //For table
    if (obj.subType == "TABLE") {
        if (obj.height) obj.style += "max-height:" + parseFloat(obj.height) + "px;overflow:auto;";
        obj.class = "mtable";
    }
    //Text from canvas xml
    if (obj.textId) {
        obj.id = obj.textId;
        widthStr = obj.width == "auto" ? "auto" : obj.width + "px";
        obj.text = $(canvasXML).find("text#" + obj.textId).text();
    }
    //Text from media xml
    if (obj.compId) {
        obj.id = obj.compId;
        obj.text = getMediaText(obj.compId);
    }
    //For bold text
    //if(obj.bold && (obj.bold == "1")) obj.style += "font-weight:bold;";  
    if (obj.bold && (obj.bold == "1")) {
        if (obj.text.indexOf("<b>") == -1)
            obj.style += "font-weight:bold;";
    }

    obj.size = obj.size / 12;
    obj.x = obj.x + 10;

    divElement = document.createElement("button");
    if (obj.class) divElement.setAttribute("class", obj.class);
    
    divElement.style.cssText = "padding: 0;border: none;background-color: transparent;top:0px;left:0px;width:" + widthStr + ";height:" + heightStr + ";text-align:" + obj.align + ";font-size:" + obj.size + "em;color:" + obj.color + ";" + obj.style + ";visibility:hidden;";
    //divElement.style.cssText = "top:0px;left:0px;width:" + widthStr + ";height:" + heightStr + ";text-align:" + obj.align + ";font-size:" + obj.size + "em;color:" + obj.color + ";" + obj.style + ";visibility:hidden;";
    
    if (obj.id) divElement.id = obj.id;
    divElement.innerHTML = obj.text;


    divElement.tabIndex = 0;
    //divElement.tabIndex = parseInt(obj.id.substr(obj.id.length - 2)) + 1;
    //alert($("#"+obj.compId), $("#"+obj.compId).tabIndex);

    divElement.onclick = function() {
        //alert("click");
        th.parent.mouseClick();
    }

    divElement.onfocus = function() {
        th.parent.mouseOver();
    }

    $(divElement).focusout(function() {
        //$(this).css("background-color", "#FFFFFF");
    });

    divElement.onfocusout = function() {
        //console.log("klk");
        th.parent.mouseOut();
    }



    $("#" + obj.div).append(divElement);

    switch (obj.expand) {
        case "up+down":
            if ($(divElement).height() > (obj.size * 12) + 3) {
                obj.y = obj.y - ($(divElement).height() / 2) + ((obj.size * 12 + 2) / 2);
            }
            break;
        case "down":
            obj.y = obj.y;
            break;
        case "up":
            if ($(divElement).height() > (obj.size * 12) + 3) {
                obj.y = obj.y - ($(divElement).height()) + ((obj.size * 12) + 2);
            }
            break;
        case "left":
            $(divElement).css('width', 'auto');
            var maxWidth = obj.width;
            if (maxWidth < $(divElement).width()) {
                maxWidth = $(divElement).width();
                obj.x = obj.x - (maxWidth - obj.width);
            }
            $(divElement).css('width', (maxWidth + 1) + 'px');
            break;
        case "right":

            $(divElement).css('width', 'auto');
            var maxWidth = obj.width;
            if (maxWidth < $(divElement).width()) {
                maxWidth = $(divElement).width();
            }

            $(divElement).css('width', (maxWidth + 1) + 'px');
            break;
        case "left+right":

            $(divElement).css('width', 'auto');
            var maxWidth = obj.width;
            if (maxWidth < $(divElement).width()) {
                maxWidth = $(divElement).width();
                obj.x = obj.x - (maxWidth / 2) + (obj.width / 2);
            }

            $(divElement).css('width', (maxWidth + 1) + 'px');
            break;
        default:
            obj.x = obj.x;
            obj.y = obj.y;
            break;
    }


    var domElement = new createjs.DOMElement(divElement);

    height = $(divElement).height();
    width = $(divElement).width();

    //background graphics    
    var bg = new createjs.Shape();
    th.addChild(bg);

    th.drawBG = function() {
        if (obj.bgColor || obj.borderColor) {
            obj.bgColor = obj.bgColor ? obj.bgColor : "";
            obj.corner = obj.corner ? parseInt(obj.corner) : 0;
            obj.border = obj.border ? parseInt(obj.border) : 1;
            obj.borderColor = obj.borderColor ? obj.borderColor : "";
            height = $(divElement).height();
            width = $(divElement).width();

            width = width + (2 * obj.border);
            height = height + (2 * obj.border);
            bg.graphics.clear();
            bg.graphics.setStrokeStyle(obj.border);
            bg.graphics.beginStroke(obj.borderColor);
            if (obj.subType == "BUBBLE") {
                bg.graphics.beginFill(obj.bgColor).drawRoundRect(0, 1, width + 2, height, obj.corner);
                bg.y = -2;
                domElement.x = -7;
                domElement.y = 2;
                obj.y = obj.y + 3;
            } else {
                bg.graphics.beginFill(obj.bgColor).drawRoundRect(-2.5 - obj.border, -2.5, width + 5, height + 5, obj.corner);
                bg.y = -2.5;
            }
            if (obj.bgWithoutBorder == "true") {
                bg.x = 0;
            } else {
                bg.x = -10;
            }


        }
    }

    th.drawBG();

    if (obj.rotation) th.rotation = obj.rotation;
    th.x = obj.x - 10;
    th.y = obj.y;
    th.addChild(domElement);
}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                        Graphic Element
                                                        ----------------
    Arrow       -   <element type="SHAPE" subType="ARROW" x="272.45" y="205.4" length="120" thickness="3" color="#F68026" rotation="170"/>
    Line        -   <element type="SHAPE" subType="LINE" x="0" y="0" x1="10" y1="20" stroke="2" strokeColor="#000"/>
    Rectangle   -   <element type="SHAPE" subType="RECT" x="0" y="0" stroke="2" strokeColor="#000" color="#f36" corner="2" width="100" height="200"/>
    Circle      -   <element type="SHAPE" subType="CIRCLE" x="0" y="0" stroke="2" strokeColor="#000" color="#f36" corner="2" width="100" height="200"/>
*********************************************************************************************************************************/
function drawGraphics(obj) {
    var shape = new createjs.Shape();
    obj.x = obj.x ? parseFloat(obj.x) : 0;
    obj.y = obj.y ? parseFloat(obj.y) : 0;

    switch (obj.subType) {
        case "ARROW":
            shape = new ArrowComp(obj);
            break;
        case "LINE":
            obj.stroke = obj.stroke ? obj.stroke : 1;
            obj.strokeColor = obj.strokeColor ? obj.strokeColor : "#000";
            shape.graphics.setStrokeStyle(obj.stroke).beginStroke(obj.strokeColor).lineTo(obj.x, obj.y).lineTo(obj.x1, obj.y1).endStroke();
            obj.x = 0;
            obj.y = 0;
            break;
        case "RECT":
            obj.stroke = obj.stroke ? obj.stroke : 0;
            obj.strokeColor = obj.strokeColor ? obj.strokeColor : "";
            obj.color = obj.color ? obj.color : "";
            obj.corner = obj.corner ? obj.corner : 0;
            shape.graphics.setStrokeStyle(obj.stroke).beginStroke(obj.strokeColor);
            shape.graphics.beginFill(obj.color).drawRoundRect(0, 0, parseFloat(obj.width), parseFloat(obj.height), obj.corner);
            break;
        case "CIRCLE":
            var width, height, ratio;
            width = parseFloat(obj.width);
            height = parseFloat(obj.height);
            ratio = width < height ? height / 2 : width / 2;
            obj.stroke = obj.stroke ? obj.stroke : 0;
            obj.strokeColor = obj.strokeColor ? obj.strokeColor : "";
            obj.color = obj.color ? obj.color : "";
            shape.graphics.setStrokeStyle(obj.stroke).beginStroke(obj.strokeColor);
            shape.graphics.beginFill(obj.color).drawCircle(0, 0, ratio);
            if (width < height) {
                shape.scaleX = width / (ratio * 2);
            } else {
                shape.scaleY = height / (ratio * 2);
            }
            obj.x = obj.x + ratio + 5;
            obj.y = obj.y + ratio - 15;
            break;
        default:
            break;
    }
    if (obj.rotation) shape.rotation = obj.rotation;
    shape.x = obj.x;
    shape.y = obj.y;
    return shape;
}
/********************************************************************************************************************************
                                                    Arrow Component
                                                    ---------------
    <element type="SHAPE" subType="ARROW" x="272.45" y="205.4" length="120" thickness="3" color="#F68026" rotation="170"/>
*********************************************************************************************************************************/
(ArrowComp = function(obj) {
    this.initialize();

    var th = this;
    var arrow, length, thick, width, height, color;
    length = obj.length ? parseFloat(obj.length) : 10;
    color = obj.color ? obj.color : "#000";
    thick = obj.thickness ? parseInt(obj.thickness) : 2;
    width = thick == 2 ? 7 : 10;
    height = thick == 2 ? 3 : 4;
    height = height + 0.5;
    arrow = new createjs.Shape();
    arrow.graphics.setStrokeStyle(thick / 4);
    arrow.graphics.beginStroke(color);
    arrow.graphics.beginFill(color);
    arrow.graphics.moveTo(0, 0);
    arrow.graphics.lineTo(0, 0);
    arrow.graphics.lineTo(width, height);
    arrow.graphics.lineTo(width / 2, 0);
    arrow.graphics.lineTo(width, -height);
    arrow.graphics.lineTo(-1.5, 0);
    arrow.graphics.setStrokeStyle(thick);
    arrow.graphics.moveTo(width / 2, 0);
    arrow.graphics.lineTo(length, 0);
    arrow.graphics.endFill();
    th.addChild(arrow);
    if (obj.rotation) th.rotation = obj.rotation;
    th.x = obj.x ? parseFloat(obj.x) : 0;
    th.y = obj.y ? parseFloat(obj.y) : 0;
}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                    Router Output Component
                                                    -----------------------
    <element type="ROUTER" textId="ID_s1_txt04" x="0" y="250" width="450" height="100"/>
*********************************************************************************************************************************/
(RouterComp = function(obj) {
    this.initialize();

    var th = this;

    obj.width = obj.width ? (parseFloat(obj.width) * 2) - 60 : 50;
    obj.height = obj.height ? (parseFloat(obj.height) * 2) - 60 : 35;

    obj.syntax = obj.syntax ? obj.syntax : 0;

    var img = new Image();
    img.onload = function(e) { th.imageLoaded(e); };
    if (obj.syntax == 1) {
        img.src = "../../../common/images/Syntax-router.png";
    } else {
        img.src = "../../../common/images/Router.png";
    }

// accessibility taborder fix -- start//
        if (obj.textId) {
            obj.style = obj.style ? obj.style : "";
            obj.size = obj.size ? obj.size : 11;
            obj.text = obj.text ? obj.text : $(canvasXML).find("text#" + obj.textId).text();
            obj.div = obj.div ? obj.div : "commonMediaText";
            obj.textX = obj.textX ? obj.textX : 6.5;
            obj.style = "font-family: courier new;overflow:auto;padding-left:2px;padding-top:1px;height:" + ((obj.height / 2) + 13) + "px";
            textComp = new TextComp({ textId: obj.textId, subType: "ROUTER", text: obj.text, x: obj.textX, y: 12, expand: "down", div: obj.div, width: ((obj.width / 2) + 12), align: "left", style: obj.style, size: obj.size, color: "#fff" });
            th.addChild(textComp);
        } else if (obj.compId) {
            obj.style = obj.style ? obj.style : "";
            obj.size = obj.size ? obj.size : 11;
            //obj.text = obj.text ? obj.text : $(canvasXML).find("text#"+obj.textId).text();    
            obj.div = obj.div ? obj.div : "commonMediaText";
            obj.textX = obj.textX ? obj.textX : 6.5;
            obj.style = "font-family: courier new;overflow:auto;padding-left:2px;padding-top:1px;height:" + ((obj.height / 2) + 13) + "px";
            textComp = new TextComp({ compId: obj.compId, subType: "ROUTER", x: obj.textX, y: 12, expand: "down", div: obj.div, width: ((obj.width / 2) + 12), align: "left", style: obj.style, size: obj.size, color: "#000" });
            th.addChild(textComp);
        }
// accessibility taborder fix -- end//
    th.imageLoaded = function(ev) {
        var textComp, container, shape, bitmapTop, bitmapDown, bitmapLeft, bitmapRight, cacheCont;
        container = new createjs.Container();
        th.addChild(container);

        bitmapTop = new createjs.Bitmap(ev.target);
        bitmapDown = new createjs.Bitmap(ev.target);
        bitmapLeft = new createjs.Bitmap(ev.target);
        bitmapRight = new createjs.Bitmap(ev.target);

        //For background color
        shape = new createjs.Shape();
        shape.graphics.beginFill("#020202").drawRect(20, 20, obj.width + 40, obj.height + 40);
        container.addChild(shape);
        //For top left corner
        shape = new createjs.Shape();
        shape.graphics.beginBitmapFill(ev.target, "no-repeat").drawRect(0, 0, 40, 40);
        container.addChild(shape);
        //For top middle line
        bitmapTop.sourceRect = new createjs.Rectangle(40, 0, 40, 40);
        bitmapTop.x = 39.1;
        bitmapTop.scaleX = obj.width / 40;
        container.addChild(bitmapTop);
        //For top right corner
        shape = new createjs.Shape();
        shape.graphics.beginBitmapFill(ev.target, "no-repeat").drawRect(160, 0, 40, 40);
        shape.x = obj.width - 122;
        container.addChild(shape);
        //For right line
        bitmapRight.sourceRect = new createjs.Rectangle(160, 40, 40, 40);
        bitmapRight.x = obj.width + 38;
        bitmapRight.y = 39.1;
        bitmapRight.scaleY = obj.height / 40;
        container.addChild(bitmapRight);
        //For down left corner
        shape = new createjs.Shape();
        shape.graphics.beginBitmapFill(ev.target, "no-repeat").drawRect(0, 80, 40, 40);
        shape.y = -41.5 + obj.height;
        container.addChild(shape);
        //For down middle line
        bitmapDown.sourceRect = new createjs.Rectangle(40, 80, 40, 40);
        bitmapDown.x = 39.1;
        bitmapDown.y = 38.3 + obj.height;
        bitmapDown.scaleX = obj.width / 40;
        container.addChild(bitmapDown);
        //For down right corner
        shape = new createjs.Shape();
        shape.graphics.beginBitmapFill(ev.target, "no-repeat").drawRect(160, 80, 40, 40);
        shape.x = obj.width - 122;
        shape.y = -41.5 + obj.height;
        container.addChild(shape);
        //For left line
        bitmapLeft.sourceRect = new createjs.Rectangle(0, 40, 40, 40);
        bitmapLeft.y = 39.1;
        bitmapLeft.scaleY = obj.height / 40;
        container.addChild(bitmapLeft);

        container.scaleX = container.scaleY = 0.5;
        container.x = -5;
        if (obj.syntax == 1) {} else {

            container.shadow = new createjs.Shadow("#000000", 0, 1, 2);
        }

        cacheCont = new createjs.Container();
        cacheCont = container.cache(0, 0, obj.width / 0.5, obj.height / 0.1, 0.5);
        th.addChild(cacheCont);

        // if (obj.textId) {
        //     obj.style = obj.style ? obj.style : "";
        //     obj.size = obj.size ? obj.size : 11;
        //     obj.text = obj.text ? obj.text : $(canvasXML).find("text#" + obj.textId).text();
        //     obj.div = obj.div ? obj.div : "commonMediaText";
        //     obj.textX = obj.textX ? obj.textX : 6.5;
        //     obj.style = "font-family: courier new;overflow:auto;padding-left:2px;padding-top:1px;height:" + ((obj.height / 2) + 13) + "px";
        //     textComp = new TextComp({ textId: obj.textId, subType: "ROUTER", text: obj.text, x: obj.textX, y: 12, expand: "down", div: obj.div, width: ((obj.width / 2) + 12), align: "left", style: obj.style, size: obj.size, color: "#fff" });
        //     th.addChild(textComp);
        // } else if (obj.compId) {
        //     obj.style = obj.style ? obj.style : "";
        //     obj.size = obj.size ? obj.size : 11;
        //     //obj.text = obj.text ? obj.text : $(canvasXML).find("text#"+obj.textId).text();    
        //     obj.div = obj.div ? obj.div : "commonMediaText";
        //     obj.textX = obj.textX ? obj.textX : 6.5;
        //     obj.style = "font-family: courier new;overflow:auto;padding-left:2px;padding-top:1px;height:" + ((obj.height / 2) + 13) + "px";
        //     textComp = new TextComp({ compId: obj.compId, subType: "ROUTER", x: obj.textX, y: 12, expand: "down", div: obj.div, width: ((obj.width / 2) + 12), align: "left", style: obj.style, size: obj.size, color: "#000" });
        //     th.addChild(textComp);
        // }
        th.x = obj.x ? parseFloat(obj.x) : 0;
        th.y = obj.y ? parseFloat(obj.y) - 5 : 0;
        update = true;
    }

}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                        Bubble Component
                                                        ----------------
    Default -   <element type="BUBBLE" compId="ID_bubble" x="100" y="70" width="200" height="100" size="11" align="center" tailPosition="2" tailFlip="1"/>
    Custom  -   <element type="BUBBLE" compId="ID_bubble" x="100" y="70" width="200" height="100" size="11" align="center" tailPosition="2" tailFlip="1" bgColor="#f45" borderColor="#3f6"/>
*********************************************************************************************************************************/
(BubbleComp = function(obj) {
    this.initialize();

    var th = this;
    var width, height, textComp, bgColor, borderColor, shadowCont, shadowShape, shadowTail, tailShape;

    obj.width = obj.width ? parseFloat(obj.width) : 50;
    obj.height = obj.height ? parseFloat(obj.height) : 50;
    obj.align = obj.align ? obj.align : "left";
    obj.x = obj.x ? parseFloat(obj.x) : 0;
    obj.y = obj.y ? parseFloat(obj.y) : 0;
    obj.size = obj.size ? obj.size : 11;
    obj.div = obj.div ? obj.div : "commonMediaText";
    obj.bgColor = obj.bgColor ? obj.bgColor : "#666263";
    obj.borderColor = obj.borderColor ? obj.borderColor : "#FFFFFF";

    width = obj.width;
    height = obj.height;

    if ((obj.tailPosition == "2") || (obj.tailPosition == "3") || (obj.tailPosition == "4") || (obj.tailPosition == "8") || (obj.tailPosition == "9") || (obj.tailPosition == "10")) width = width - 20;
    obj.wid = width;
    textComp = new TextComp({ subType: "BUBBLE", compId: obj.compId, x: 10, y: 0, size: obj.size, div: obj.div, width: width - 6, height: height - 6, align: obj.align, bgColor: obj.bgColor, borderColor: obj.borderColor, corner: 2, border: 3, expand: "down" });

    width = $("#" + obj.compId).width() + 10;
    height = $("#" + obj.compId).height() + 10;
    //Shadow container
    shadowCont = new createjs.Container();
    shadowShape = new createjs.Shape();
    shadowShape.graphics.beginFill("#000").drawRoundRect(0, 0, obj.wid, height - 2, 4);

    width = width < 30 ? 30 : width;
    height = height < 30 ? 30 : height;
    obj.val = (obj.tailFlip && obj.tailFlip == "1") ? 15 : 0;
    //Shadow Tail shape
    shadowTail = new createjs.Shape();
    shadowTail.graphics.beginFill(obj.borderColor);
    shadowTail.graphics.lineTo(0, 0).lineTo(15, 0).lineTo(obj.val, -22).lineTo(0, 0);
    shadowTail.graphics.endFill();

    shadowCont.addChild(shadowTail, shadowShape);
    shadowCont.shadow = new createjs.Shadow("#666263", 0, 1.5, 5);
    shadowCont.y = 1;
    th.addChild(shadowCont);
    //Tail shape
    tailShape = new createjs.Shape();
    tailShape.graphics.beginFill(obj.borderColor);
    tailShape.graphics.lineTo(0, 0).lineTo(15, 0).lineTo(obj.val, -22).lineTo(0, 0);
    tailShape.graphics.endFill();
    th.addChild(tailShape);
    th.addChild(textComp);

    switch (obj.tailPosition) {
        case "1": //done
            obj.y = obj.y + 19;
            shadowTail.y = 1;
            shadowTail.x = width - 25;
            obj.x = obj.x;
            obj.y = obj.y + 1;
            break;
        case "2":
            shadowTail.rotation = 90;
            shadowTail.x = width -2;
            shadowTail.y = 4;
            obj.x = obj.x - 3;
            break;
        case "3":
            shadowTail.rotation = 90;
            shadowTail.x = width - 2;
            shadowTail.y = (height - 20) / 2;
            obj.x = obj.x - 3;
            break;
        case "4": //done
            shadowTail.rotation = 90;
            shadowTail.x = width - 2;
            shadowTail.y = height - 20;
            obj.x = obj.x - 3;
            break;
        case "5": //done
            shadowTail.rotation = 180;
            shadowTail.x = width - 5;
            shadowTail.y = height - 5;
            if (height == 30)
                shadowTail.y = height - 8;
            obj.x = obj.x - 1;

            break;
        case "6": //done
            shadowTail.rotation = 180;
            shadowTail.x = (width + 25) / 2;
            shadowTail.y = height - 4;
            if (height == 30)
                shadowTail.y = height - 8;
            break;
        case "7": //done
            shadowTail.rotation = 180;
            shadowTail.x = 20;
            shadowTail.y = height - 4;
            if (height == 30)
                shadowTail.y = height - 8;
            obj.y = obj.y + 2;
            break;
        case "8": //done
            shadowTail.rotation = 270;
            textComp.x = textComp.x + 5;
            shadowCont.x = shadowCont.x + 5;
            shadowTail.x = shadowTail.x + 5;
            shadowTail.y = height - 7;
            obj.x = obj.x + 18;
            break;
        case "9": //done
            shadowTail.rotation = 270;
            textComp.x = textComp.x + 5;
            shadowCont.x = shadowCont.x + 5;
            shadowTail.x = shadowTail.x + 5;
            shadowTail.y = (height + 15) / 2;
            obj.x = obj.x + 18;
            break;
        case "10": //done
            shadowTail.rotation = 270;
            textComp.x = textComp.x + 5;
            shadowTail.x = shadowTail.x;
            shadowTail.y = 28;
            textComp.x = textComp.x - 5;
            break;
        case "11": //done
            textComp.x = textComp.x - 3;
            shadowTail.x = 5;
            shadowTail.y = 1;
            obj.y = obj.y + 20;
            break;
        case "12":
            obj.y = obj.y + 19;
            shadowTail.x = (width - 22) / 2;
            shadowTail.y = 1;
            break;

    }
    if (obj.tailPosition == "11") {

    }
    if ((obj.tailPosition == "5") || (obj.tailPosition == "6") || (obj.tailPosition == "7")) {
        if (obj.height > (height + 12)) {
            obj.y = obj.y + (obj.height - height) - 19;
        } else {
            obj.y = obj.y - ((height + 21) - obj.height);
        }
    }
    if ((obj.tailPosition == "8") || (obj.tailPosition == "9") || (obj.tailPosition == "10") || (obj.tailPosition == "2") || (obj.tailPosition == "3") || (obj.tailPosition == "4")) {
        if (obj.height > height) {
            obj.y = obj.y + (obj.height - height) + 2;
        } else {

            obj.y = obj.y - (height - obj.height);
        }
    }

    tailShape.x = shadowTail.x;
    tailShape.y = shadowTail.y;
    tailShape.rotation = shadowTail.rotation;
    th.x = obj.x;
    th.y = obj.y;

}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                        (TextBox) or (Purple Box) or (Feedback) Component
                                         ------------------------------------------------
    <element type="TEXTBOX" subType="CLOSABLE" titleId="ID_s2_title" bodyId="ID_bubble" x="0" y="0" width="200" height="100" animated="1" visible="0"/> 
*********************************************************************************************************************************/
(TextBoxComp = function(obj) {
    this.initialize();
    var CloseVar;
    var th = this;
    var shape, tbCanvas, tbContainer, width, height, titleHeight, textComp, bodyTextY;
    var heightBox = 0;

    width = obj.width ? parseFloat(obj.width) : 50;
    height = obj.height ? parseFloat(obj.height) : 50;
    obj.div = obj.div ? obj.div : "mediaContainer";
    //obj.divId = "textBoxDiv_"+textBoxCount;
    obj.divId = obj.divId ? obj.divId : "textBoxDiv_" + textBoxCount;
    $("#" + obj.div).append(('<div id="' + obj.divId + '" style="pointer-events:auto;"></div>'));
    //textbox canvas
    tbCanvas = document.createElement("canvas");
    tbCanvas.width = width + 25;
    tbCanvas.height = height + 20;
    tbCanvas.id = "textBoxCanvas_" + textBoxCount;
    tbCanvas.style.cssText = "position:absolute;left:0px;top:0px;visibility:hidden;";
    $("#" + obj.divId).append(tbCanvas);
    //convert to createjs DOMElement
    var domElement = new createjs.DOMElement(tbCanvas);
    th.x = obj.x ? parseFloat(obj.x) - 9 : 0;
    th.y = obj.y ? parseFloat(obj.y) - 11 : 0;
    th.addChild(domElement);

    //For changing title text
    th.setTitleId = function(id) {
            $("#" + obj.divId + '_title').remove();
            $("#" + obj.divId).append('<div id="' + obj.divId + '_title"></div>');
        textComp = new TextComp({ compId: id, x: 25, y: 20, width: width - 50, size: 18, div: obj.divId + '_title', color: "#393536", tabOrder:obj.tabOrder });
            $("#" + id).css({ 'font-family': "CiscoSansTTThin" });
            th.addChild(textComp);
            //$("#"+obj.titleId).text(getMediaText(id));
        }
        //For changing body text
    th.setBodyId = function(id) {
        //$("#"+obj.bodyId).text(getMediaText(id));
        $("#" + obj.divId + '_body').remove();
        $("#" + obj.divId).append('<div id="' + obj.divId + '_body"></div>');
        obj.style = 'font-family:' + "CiscoSansTTLight;" + "overflow:auto !important; height:" + (height - 20) + "px;" + "line-height:" + "1.5";
        textComp = new TextComp({ compId: id, x: 26, y: bodyTextY + 3, width: width - 17, size: 11, color: "#0a0a0a", style: obj.style, div: obj.divId + '_body', tabOrder:parseInt(obj.tabOrder)+1 });
        th.addChild(textComp);
    }

    //Textbox Stage
    var pStage = new createjs.Stage(tbCanvas);
    //Textbox container
    var tbContainer = new createjs.Container();
    tbContainer.x = 15;
    tbContainer.y = 10;
    pStage.addChild(tbContainer);
    //Background color
    shape = new createjs.Shape();
    shape.graphics.beginFill("#fff").drawRoundRectComplex(0, 0, width, height, 2, 2, 0, 0);
    shape.shadow = new createjs.Shadow("#666263", 0, 0.5, 6);
    tbContainer.addChild(shape);
    //Title line
    shape = new createjs.Shape();
    shape.graphics.beginFill("#cccccc").drawRect(10, 0, width - 20, 1);
    shape.y = 3;
    tbContainer.addChild(shape);
    titleHeight = 4;
    height = height - 4;
    //Title text 
    if (obj.titleId) {
        th.setTitleId(obj.titleId);
        //textComp = new TextComp({compId:obj.titleId,x:11,y:13,width:width-30,div:obj.divId+'_title',color:"#442557"});
        //th.addChild(textComp);

        if (height <= 96) {

            heightBox = 1
            heightComp = 1;
            titleHeight = $("#" + obj.titleId).height()

            if (titleHeight == 23) {
                titleHeight = titleHeight - 5;
            } else if (titleHeight == 47 || titleHeight == 46) {
                titleHeight = titleHeight - 11;
            } else if (titleHeight == 70 || titleHeight == 69) {
                titleHeight = titleHeight - 30;
            } else {
                titleHeight = titleHeight - 40;
            }

            $("#" + obj.titleId).css('font-size', '14px');
            $("#" + obj.titleId).css('top', '-10px');
        } else {
            heightBox = 0
            heightComp = 0;
            if (($("#" + obj.titleId).height()) == 0) {
                titleHeight = 40;
            } else {
                //alert($("#"+obj.titleId).height())
                if ($("#" + obj.titleId).height() == 18)
                    titleHeight = $("#" + obj.titleId).height() + 22;
                else if ($("#" + obj.titleId).height() == 23)
                    titleHeight = $("#" + obj.titleId).height() + 20;
                else if ($("#" + obj.titleId).height() == 36)
                    titleHeight = $("#" + obj.titleId).height() + 15;
                else if ($("#" + obj.titleId).height() == 46)
                    titleHeight = $("#" + obj.titleId).height() + 10;
                else if ($("#" + obj.titleId).height() == 47)
                    titleHeight = $("#" + obj.titleId).height() + 15;
                else if ($("#" + obj.titleId).height() == 54)
                    titleHeight = $("#" + obj.titleId).height() - 10;
                else if ($("#" + obj.titleId).height() == 69)
                    titleHeight = $("#" + obj.titleId).height() + 10;
                else if ($("#" + obj.titleId).height() == 115)
                    titleHeight = $("#" + obj.titleId).height() - 40;
                else if ($("#" + obj.titleId).height() == 138)
                    titleHeight = $("#" + obj.titleId).height() - 75;
                else if ($("#" + obj.titleId).height() == 161)
                    titleHeight = $("#" + obj.titleId).height() - 75;
                else if ($("#" + obj.titleId).height() == 70)
                    titleHeight = $("#" + obj.titleId).height() + 10;
                else if ($("#" + obj.titleId).height() == 92)
                    titleHeight = $("#" + obj.titleId).height() + 10;
                else
                    titleHeight = $("#" + obj.titleId).height() - 20;
            }
        }

        //titleHeight = $("#"+obj.titleId).height()+23;
        shape.y = titleHeight;
        height = height - titleHeight + 4;
    } else {
        if (obj.subType == "CLOSABLE") {
            shape.y = 16;
            titleHeight = 9;
        } else {
            tbContainer.removeChild(shape);
            titleHeight = 1;
        }
    }
    //Body background
    shape = new createjs.Shape();
    shape.graphics.beginFill("#fff").drawRect(4, 8, width - 8, height - 13);
    shape.y = titleHeight ? titleHeight : 0;
    tbContainer.addChild(shape);
    //Body text 
    if (obj.bodyId) {
        if (heightBox == 1) {
            bodyTextY = (shape.y + 14);
        } else {
            bodyTextY = (shape.y + 18);

        }
        th.setBodyId(obj.bodyId);
        //obj.style = "overflow:auto !important; height:"+(height-14)+"px;";
        //textComp = new TextComp({compId:obj.bodyId,x:11,y:(shape.y+18),width:width-11,style:obj.style,div:obj.divId});
        //th.addChild(textComp);
    }
    obj.subType = obj.subType ? obj.subType : "ROLLOVER";
    
    //For Close Button
    if (obj.subType == "CLOSABLE") {
        if (createjs.Touch.isSupported()) createjs.Touch.enable(pStage);
        pStage.enableMouseOver();

            //accessibility fix
            if (heightBox == 1) {
                shape.x = width - 25;
                shape.y = 3;
                shape.scaleX = shape.scaleY = 0;
            } else {
                shape.x = width - 40;
                shape.y = 10;
                shape.scaleX = shape.scaleY = 0;
            }
 
            var _btn = document.createElement("button");
            _btn.style.cssText = "border: 1px solid rgba(0,0,0,0);padding: 0;visibility:hidden;background-color:transparent;top:2px;left:2px;cursor:pointer;pointer-events:none;";
            _btn.innerHTML = "";
            _btn.name="Close";
            _btn.id = "domElement_close" + textBoxCount;
            _btn.tabIndex = 0;

            $(_btn).insertAfter($('#textBoxDiv_' + textBoxCount).last());
            $("#domElement_close" + textBoxCount).on("click", handlerMethod);
            $("#domElement_close" + textBoxCount).css({ "position": "absolute", "margin-top": shape.y+6 + "px", "margin-left": shape.x+12 + "px", "width": 30 + "px", "height": 30 + "px" })
            $("#domElement_close" + textBoxCount).addClass("closeDomElement");
            var domElement2 = new createjs.DOMElement(_btn);
            CloseVar = domElement2;
            //CloseVar.visible=false;

            function handlerMethod(event) {
                if (obj.animated && obj.animated == "1") {
                    $("#" + obj.divId).hide(2000);

                } else {
                    th.visible = false;
                    if (th.parent && th.parent.button) {
                        th.parent.button.setSelected(false);
                        th.visible = true;
                        th.parent.tb_dId = obj.divId;
                        $("#" + obj.divId).hide();
                    }
                }
                update = true;
            }


        var cImg = new Image();
        cImg.src = "../../../common/images/closeBtn.png";
        cImg.onload = function(ev) {
            shape = new createjs.Bitmap(ev.target); //ImageComp({src:"../../../common/images/closeBtn.jpg",x:width-18,y:3});
            shape.cursor = "pointer";

            if (heightBox == 1) {
                shape.x = width - 25;
                shape.y = 3;
                shape.scaleX = shape.scaleY = 0.5;
            } else {
                shape.x = width - 40;
                shape.y = 10;
                shape.scaleX = shape.scaleY = 0.9;
            }

            
            shape.onClick = function(ev) {
                if (obj.animated && obj.animated == "1") {
                    $("#" + obj.divId).hide(2000);
                } else {
                    th.visible = false;
                    if (th.parent && th.parent.button) {
                        th.parent.button.setSelected(false);
                        th.visible = true;
                        th.parent.tb_dId = obj.divId;
                        $("#" + obj.divId).hide();
                    }
                }
                update = true;
            }
            tbContainer.addChild(shape);
            th.addChild(domElement2);
            pStage.update();
        }
    }
    obj.visible = obj.visible ? obj.visible : "1";
    if (obj.visible == "0") th.visible = false;
    pStage.update();
}).prototype = new createjs.Container();
/********************************************************************************************************************************
                                                        Blue Button Component
                                                        ---------------------
    new BlueButton({x:18,y:o.height-37,width:126.6,height:20,id:"r",compId:"comp_text",callback:t.cb});
*********************************************************************************************************************************/
(BlueButton = function(obj) {
    this.initialize();

    var th = this;
    var normalCont, overCont, bgShape, selected;
    var minusfactor, plusfactor;
    obj.id = obj.id ? obj.id : "btn";
    obj.width = obj.width ? parseFloat(obj.width) : 100;
    obj.height = obj.height ? parseFloat(obj.height) : 40;
    obj.div = obj.div ? obj.div : "commonMediaText";
    obj.bold = obj.bold ? obj.bold : "0";
    //obj.bold = getMediaText(obj.compId).substr(0,3) == "<b>" ? "0" : obj.bold;

    //Default selected mode
    selected = false;
    //Set selected mode
    th.setSelected = function(mode) {
            selected = mode;
            if (selected) {
                $("#" + obj.compId).css("color", "#b47c07");
                normalCont.visible = false;
                overCont.visible = true;
            } else {
                $("#" + obj.compId).css("color", "#343434");
                normalCont.visible = true;
                overCont.visible = false;
            }
            update = true;
            if (th.getStage()) th.getStage().update();
        }
        //Mouse over function
    th.mouseOver = function() {
            th.cursor = 'pointer';
            if (selected) return;
            $("#" + obj.compId).css("color", "#b47c07");
            normalCont.visible = false;
            overCont.visible = true;
            update = true;
            if (th.getStage()) th.getStage().update();
        }
        //Mouse out function
    th.mouseOut = function() {
            th.cursor = 'default';
            if (selected) return;
            $("#" + obj.compId).css("color", "#343434");
            normalCont.visible = true;
            overCont.visible = false;
            if (th.getStage()) th.getStage().update();
        }
        //Mouse click function
    th.mouseClick = function() {
            if (selected) return;
            if (obj.callback) obj.callback(obj.id, th);
            update = true;
        }
        //Assign mouse events
    th.onMouseOver = th.mouseOver;
    th.onMouseOut = th.mouseOut;
    th.onClick = th.mouseClick;

    //For Blue Button Label
    //var label = new TextComp({ x: 0, y: 2, width: obj.width - 2, compId: obj.compId, align: "center", color: "#343434", div: obj.div, bold: obj.bold, style: "pointer-events:none;cursor:pointer;" + "line-height:" + "1.1" });
    var label = new ButtonLabelComp({ x: 0, y: 2, width: obj.width - 2, compId: obj.compId, align: "center", color: "#343434", div: obj.div, bold: obj.bold, style: "pointer-events:none;cursor:pointer;" });
    th.addChild(label);

    label.y = $("#" + obj.compId).height() < 20 ? (18 - $("#" + obj.compId).height()) / 2 : (obj.height - $("#" + obj.compId).height()) / 2;

    obj.width = $("#" + obj.compId).width();
    obj.height = obj.height < $("#" + obj.compId).height() ? obj.height : $("#" + obj.compId).height() * 1.6; //1.5

    //alert("H::"+obj.height);

    //Normal stage container
    normalCont = new createjs.Container();
    minusfactor = obj.height * 60 / 100;
    plusfactor = obj.height * 40 / 100;
    ya = parseInt(obj.height - minusfactor);
    yb = parseInt(obj.height + plusfactor);

    bgShape = new createjs.Shape();
    bgShape.graphics.lf(["#FFFFFF", "#c2dbe8"], [0.396, 0.663], -0.2, -ya, 0.4, yb).drawRoundRect(0, 0, obj.width, obj.height, 3);


    blackShape = new createjs.Shape();
    blackShape.graphics.setStrokeStyle(1.5).beginLinearGradientStroke(["#9c9d9d", "#9c9d9d"], [.8, .4], 0, 0, 0, obj.height).beginFill().drawRoundRect(0, -2, obj.width, obj.height + 2, 3);
    blackShape.shadow = new createjs.Shadow("#8c999e", 0, 0, .5);
    th.addChild(blackShape, bgShape);

    orangeShape = new createjs.Shape();
    orangeShape.graphics.setStrokeStyle(1.5,'round', 'round').beginLinearGradientStroke(["#feec72", "#fdab26"], [0.2, .8], 0, 0, 0, obj.height - 3).beginFill().drawRoundRect(1, 0, obj.width - 2, obj.height - 1, 3);
    normalCont.addChild(orangeShape);
    th.addChild(normalCont);

    //Over state container
    overCont = new createjs.Container();
    orangeShape = new createjs.Shape();
    orangeShape.graphics.setStrokeStyle(3.5).beginLinearGradientStroke(["#feec72", "#fdab26"], [0.2, .8], 0, 0, 0, obj.height).beginFill().drawRoundRect(1, 1.2, obj.width - 3.5, obj.height - 3.5, 3);
    blackShape = new createjs.Shape();
    blackShape.graphics.setStrokeStyle(1.5).beginLinearGradientStroke(["#9c9d9d", "#9c9d9d"], [1, .7], 0, 0, 0, obj.height).beginFill().drawRoundRect(0, -2, obj.width, obj.height + 2, 3);
    blackShape.shadow = new createjs.Shadow("#8c999e", 0, 0, 1);
    overCont.addChild(blackShape, orangeShape);
    th.addChild(overCont);
    overCont.visible = false;

    th.x = obj.x ? parseFloat(obj.x) : 0;
    th.y = obj.y ? parseFloat(obj.y) : 0;

}).prototype = new createjs.Container();

/********************************************************************************************************************************
                                                        Syntax Button Component
                                                        ---------------------
    new SyntaxButton({x:18,y:o.height-37,width:126.6,height:20,id:"r",compId:"comp_text",callback:t.cb});
*********************************************************************************************************************************/
(SyntaxButton = function(obj) {
    this.initialize();

    var th = this;
    var normalCont, overCont, bgShape, selected;
    var minusfactor, plusfactor;
    obj.id = obj.id ? obj.id : "btn";
    obj.width = obj.width ? parseFloat(obj.width) : 100;
    obj.height = obj.height ? parseFloat(obj.height) : 40;
    obj.div = obj.div ? obj.div : "commonMediaText";
    obj.bold = obj.bold ? obj.bold : "0";
    //obj.bold = getMediaText(obj.compId).substr(0,3) == "<b>" ? "0" : obj.bold;

    //Default selected mode
    selected = false;
    //Set selected mode
    th.setSelected = function(mode) {
            selected = mode;
            if (selected) {
                $("#" + obj.compId).css("color", "#b47c07");
                normalCont.visible = false;
                overCont.visible = true;
            } else {
                $("#" + obj.compId).css("color", "#343434");
                normalCont.visible = true;
                overCont.visible = false;
            }
            update = true;
            if (th.getStage()) th.getStage().update();
        }
        //Mouse over function
    th.mouseOver = function() {
            th.cursor = 'pointer';
            if (selected) return;
            $("#" + obj.compId).css("color", "#b47c07");
            normalCont.visible = false;
            overCont.visible = true;
            update = true;
            if (th.getStage()) th.getStage().update();
        }
        //Mouse out function
    th.mouseOut = function() {
            th.cursor = 'default';
            if (selected) return;
            $("#" + obj.compId).css("color", "#343434");
            normalCont.visible = true;
            overCont.visible = false;
            if (th.getStage()) th.getStage().update();
        }
        //Mouse click function
    th.mouseClick = function() {
            if (selected) return;
            if (obj.callback) obj.callback(obj.id, th);
            update = true;
        }
        //Assign mouse events
    th.onMouseOver = th.mouseOver;
    th.onMouseOut = th.mouseOut;
    th.onClick = th.mouseClick;

    //For Blue Button Label
    var label = new ButtonLabelComp({ x: 0, y: 2, width: obj.width - 2, compId: obj.compId, align: "center", color: "#343434", div: obj.div, bold: obj.bold, style: "pointer-events:none;cursor:pointer;" + "line-height:" + "1.1" });
    th.addChild(label);

    //label.y = $("#"+obj.compId).height() < 20 ? (20-$("#"+obj.compId).height())/2 : (obj.height-$("#"+obj.compId).height())/2;

    obj.width = $("#" + obj.compId).width();
    obj.height = obj.height < $("#" + obj.compId).height() ? obj.height : $("#" + obj.compId).height() * 1.3; //1.5

    //alert("H::"+obj.height);

    //Normal stage container
    normalCont = new createjs.Container();
    minusfactor = obj.height * 60 / 100;
    plusfactor = obj.height * 40 / 100;
    ya = parseInt(obj.height - minusfactor);
    yb = parseInt(obj.height + plusfactor);

    bgShape = new createjs.Shape();
    bgShape.graphics.lf(["#FFFFFF", "#c2dbe8"], [0.396, 0.663], -0.2, -ya, 0.4, yb).drawRoundRect(0, 0, obj.width, obj.height, 3);


    blackShape = new createjs.Shape();
    blackShape.graphics.setStrokeStyle(1.5).beginLinearGradientStroke(["#9c9d9d", "#9c9d9d"], [.8, .4], 0, 0, 0, obj.height).beginFill().drawRoundRect(0, -2, obj.width, obj.height + 2, 3);
    blackShape.shadow = new createjs.Shadow("#8c999e", 0, 0, .5);
    th.addChild(blackShape, bgShape);

    orangeShape = new createjs.Shape();
    orangeShape.graphics.setStrokeStyle(1.5).beginLinearGradientStroke(["#feec72", "#fdab26"], [0.2, .8], 0, 0, 0, obj.height - 3).beginFill().drawRoundRect(1, 0, obj.width - 2, obj.height - 1, 3);
    normalCont.addChild(orangeShape);
    th.addChild(normalCont);

    //Over state container
    overCont = new createjs.Container();
    orangeShape = new createjs.Shape();
    orangeShape.graphics.setStrokeStyle(3.5).beginLinearGradientStroke(["#feec72", "#fdab26"], [0.2, .8], 0, 0, 0, obj.height).beginFill().drawRoundRect(1, 1.2, obj.width - 3.5, obj.height - 3.5, 3);
    blackShape = new createjs.Shape();
    blackShape.graphics.setStrokeStyle(1.5).beginLinearGradientStroke(["#9c9d9d", "#9c9d9d"], [1, .7], 0, 0, 0, obj.height).beginFill().drawRoundRect(0, -2, obj.width, obj.height + 2, 3);
    blackShape.shadow = new createjs.Shadow("#8c999e", 0, 0, 1);
    overCont.addChild(blackShape, orangeShape);
    th.addChild(overCont);
    overCont.visible = false;

    th.x = obj.x ? parseFloat(obj.x) : 0;
    th.y = obj.y ? parseFloat(obj.y) : 0;

}).prototype = new createjs.Container();


/********************************************************************************************************************************
                                                        Image Button Component
                                                        ---------------------
    new BlueButton({x:18,y:o.height-37,width:126.6,height:20,id:"r",compId:"comp_text",callback:t.cb});
*********************************************************************************************************************************/
(ImageButton = function(obj) {
    this.initialize();

    var th = this;
    var normalCont, overCont, bgShape, selected;
    //Default selected mode
    selected = false;
    //Set selected mode
    th.setSelected = function(mode) {
        selected = mode;
        if (selected) {
            normalCont.visible = false;
            overCont.visible = true;
        } else {
            normalCont.visible = true;
            overCont.visible = false;
        }
        update = true;
        if (th.getStage()) th.getStage().update = true;
    }
    th.mouseOver = function() {
            th.cursor = 'pointer';
            if (selected) return;

            if (obj.hover != '0') {
                normalCont.visible = false;
                overCont.visible = true;
                update = true;
                if (th.getStage()) th.getStage().update = true;
            }
        }
        //Mouse out function
    th.mouseOut = function() {
            th.cursor = 'default';
            if (selected) return;
            normalCont.visible = true;
            overCont.visible = false;
            if (th.getStage()) th.getStage().update = true;
        }
        //Mouse click function
    th.mouseClick = function() {
            if (selected) return;
            if (obj.callback) obj.callback(obj.id, th);
            if (th.getStage()) th.getStage().update = true;
        }
        //Assign mouse events
    th.onMouseOver = th.mouseOver;
    th.onMouseOut = th.mouseOut;
    th.onClick = th.mouseClick;

    //Normal stage container
    normalCont = new createjs.Container();
    imgSelBut = new createjs.Bitmap(obj.imgSel);
    normalCont.addChild(imgSelBut);
    th.addChild(normalCont);

    //Over state container
    overCont = new createjs.Container();
    imgOverBut = new createjs.Bitmap(obj.imgOver);
    overCont.addChild(imgOverBut);
    th.addChild(overCont);
    overCont.visible = false;

    th.x = obj.x ? parseFloat(obj.x) : 0;
    th.y = obj.y ? parseFloat(obj.y) : 0;


}).prototype = new createjs.Container();


/********************************************************************************************************************************
                                                        Image Button Component
                                                        ---------------------
*********************************************************************************************************************************/
(ImageButtonPlus = function(obj) {
    this.initialize();
    var th = this;
    selected = false;
    var btnCont, overCont, bgShape, selected, bitmap, shadowShape, heighlight_Shape;

    //Set selected mode
    th.setSelected = function(mode) {
            selected = mode;
            if (selected) {
                heighlight_Shape.visible = true;
            } else {
                heighlight_Shape.visible = false;
            }
            update = true;
            if (th.getStage()) th.getStage().update = true;
        }
        //image container
    var imgContainer = new createjs.Container();
    var img = new Image();
    img.onload = function(ev) { th.imageLoaded(ev) };
    img.src = obj.imgSel;

    th.imageLoaded = function(ev) {
        //Add Shadow Container
        if (obj.imgShadow == "false") {} else {
            th.addChild(shadowShape);
        }
        //th.addChild(shadowShape);     
        th.swapChildren(imgContainer, shadowShape)
            //highlight container 
        th.addChild(heighlight_Shape);

        if (th.getStage()) th.getStage().update();
        update = true;
        if (obj.selected == "true") heighlight_Shape.visible = true;
        else heighlight_Shape.visible = false;

        //Mask shape
        var maskShape = new createjs.Shape();
        maskShape.graphics.beginFill().drawRoundRect(0, 0, parseFloat(obj.imgWidth), parseFloat(obj.imgHeight), 4);
        th.addChild(maskShape);
        imgContainer.mask = maskShape;
        //adding Images         
        obj.imgWidth = obj.imgWidth ? obj.imgWidth : ev.target.width;
        obj.imgHeiht = obj.imgHeiht ? obj.imgHeiht : ev.target.height;
        var ratio = Math.min((obj.imgWidth / ev.target.width), (obj.imgHeiht / ev.target.height));
        bitmap = new createjs.Bitmap(ev.target);
        bitmap.scaleX = bitmap.scaleY = ratio;
        imgContainer.addChild(bitmap);
        th.addChild(imgContainer);
        //adding Plus Button Container              
        btnCont = new createjs.Container();
        var imgBut = new createjs.Bitmap("../../../common/images/plus_btn.png");
        var imgOverBut = new createjs.Bitmap("../../../common/images/plus_btn_over.png");
        btnCont.addChild(imgOverBut);
        btnCont.addChild(imgBut);
        btnCont.id = obj.id;
        btnCont.x = parseFloat(obj.x);
        btnCont.y = parseFloat(obj.y);
        th.addChild(btnCont);
        btnCont.cursor = 'pointer';
        // Button Container clicking                    
        btnCont.onMouseOver = function() {
            imgBut.visible = false;
            imgOverBut.visible = true;
            update = true;
            if (th.getStage()) th.getStage().update = true;
        }
        btnCont.onMouseOut = function() {
            imgBut.visible = true;
            imgOverBut.visible = false;
            if (th.getStage()) th.getStage().update = true;
        }

        btnCont.onClick = function(event) {
            if (typeof multibuttonLocal == 'function') multibuttonLocal(th, imgContainer, obj.id);
            if (selected) return;
            if (obj.callback) obj.callback(obj.id, th);
            if (th.getStage()) th.getStage().update = true;
        }

        if (th.getStage()) th.getStage().update();
        update = true;
    }

    //heighlight shape 
    heighlight_Shape = new createjs.Shape();
    heighlight_Shape.graphics.beginStroke("#f8ae18");
    heighlight_Shape.graphics.setStrokeStyle(4); // 2 pixel
    var imgW = parseInt(obj.imgWidth) + 3
    var imgH = parseInt(obj.imgHeight) + 3
    if (obj.imageType == "circle") {
        //heighlight_Shape.graphics.drawCircle(imgW/2,imgH/2,50); // Change size as-needed
        heighlight_Shape.graphics.drawCircle(58, 58, obj.imageRadius);

    } else {
        heighlight_Shape.graphics.drawRoundRect(-2, -2, imgW, imgH, 4); // Change size as-needed
    }
    heighlight_Shape.visible = false;

    // shadow Shape
    shadowShape = new createjs.Shape();
    if (obj.imageType == "circle") {
        shadowShape.graphics.beginFill('rgba(0,0,0,1)').drawCircle(58, 58, obj.imageRadius - 5);
        shadowShape.shadow = new createjs.Shadow("#000000", 2, 2, 10);
        shadowShape.x = shadowShape.y = 2;
        shadowShape.scaleX = shadowShape.scaleY = 0.97;
    } else {
        shadowShape.graphics.beginFill('rgba(0,0,0,1)').drawRoundRect(0, 0, parseFloat(obj.imgWidth), parseFloat(obj.imgHeight), 4);
        shadowShape.shadow = new createjs.Shadow("#000000", 3, 3, 10);
        shadowShape.x = shadowShape.y = 0.5;
        shadowShape.scaleX = shadowShape.scaleY = 0.97;
    }

    th.x = obj.imgX ? parseFloat(obj.imgX) : 0;
    th.y = obj.imgY ? parseFloat(obj.imgY) : 0;
}).prototype = new createjs.Container();


/********************************************************************************************************************************
                                                            Load Images 
*********************************************************************************************************************************/
function loadImages(manifest, callback) {
    var th = this;
    var pjs = new createjs.LoadQueue(false);
    th.imgs = [];

    if (manifest.length == 0) {
        if (callback) callback();
    } else {
        $("#preloader").show();
        pjs.addEventListener("error", function(ev) { th.errorHandler(); });
        pjs.addEventListener("fileload", function(ev) { th.fileLoaded(ev); });
        pjs.addEventListener("complete", function(ev) {
            $("#preloader").hide();
            if (callback) callback(th.imgs);
        });
        pjs.loadManifest(manifest);
    }
    th.fileLoaded = function(ev) {
        if (ev.item.type == createjs.LoadQueue.JAVASCRIPT) {
            document.body.appendChild(ev.result);
        }
        if (ev.item.type == createjs.LoadQueue.IMAGE) {
            th.imgs[ev.item.id] = ev.result;
        }
    }
    th.errorHandler = function(ev) {
        //alert("Please check the image src");
        console.log("Please check the image src " + ev);
    }
}
/********************************************************************************************************************************
                                                    PesudoLocalization Process 
*********************************************************************************************************************************/
function translationProcess() {
    var pseudoChars = [];
    pseudoChars["a"] = "ā";
    pseudoChars["b"] = "þ";
    pseudoChars["c"] = "ć";
    pseudoChars["d"] = "đ";
    pseudoChars["e"] = "ē";
    pseudoChars["f"] = "子";
    pseudoChars["g"] = "g"
    pseudoChars["h"] = "ĥ";
    pseudoChars["i"] = "ï";
    pseudoChars["j"] = "ĵ";
    pseudoChars["k"] = "ķ";
    pseudoChars["l"] = "λ";
    pseudoChars["m"] = "μ";
    pseudoChars["n"] = "ñ";
    pseudoChars["o"] = "ð";
    pseudoChars["p"] = "ρ";
    pseudoChars["q"] = "ς";
    pseudoChars["r"] = "ř";
    pseudoChars["s"] = "š";
    pseudoChars["t"] = "ŧ";
    pseudoChars["u"] = "ů";
    pseudoChars["v"] = "υ";
    pseudoChars["w"] = "ŵ";
    pseudoChars["x"] = "文";
    pseudoChars["y"] = "ŷ";
    pseudoChars["z"] = "ž";
    var shortString = "-- 你好世 界 holamu ndo Hallo Welt にちは世界 привет мир 여보세요 세계 hello world Hej verden 789!@# $%^&*--";

    $(mediaXML).find("component").each(function(index, element) {
        var content = $(element).text();
        var skipString = false;
        if (content.length <= 15 && (content.split(".").length == 4)) {
            skipString = true;
        }
        if (skipString == false) {
            // strip out HTML
            $("body").append("<div id='temp'>" + content + "</div>");
            content = $("#temp").text();
            $("#temp").remove();
            content = content.toLowerCase();
            // find adjusted length - string will grow when localized  
            //  numbers and punctuation won't expand..          
            var noNumbers = content.replace(/[0-9]/g, '');
            noNumbers = noNumbers.split(".").join("");
            noNumbers = noNumbers.split(",").join("");

            var conLen = noNumbers.length;
            var pseudoLocalizeAmount = 1
                // we want short strings to have more room for expansion... they get 2x instead of 1.5
            if (conLen < 35) {
                pseudoLocalizeAmount = 2
            }

            var adjLen = conLen * pseudoLocalizeAmount;
            var newString = "";
            var junkString = ""
            for (var v = 0; v < 10; v++) {
                junkString += shortString;
            }
            var localizedString = "";
            for (var j = 0; j < 40; j++) {
                localizedString += junkString;
            }
            if (conLen > 1) {
                newString = "";
                for (var b = 0; b <= conLen; b++) {
                    if ((content.charCodeAt(b) > 96) && (content.charCodeAt(b) < 123)) {
                        newString += pseudoChars[content.charAt(b)];
                    } else {
                        newString += content.charAt(b);
                    }
                }
            }
            if (conLen == 0) newString = $(element).text();
            // add extra chars at the end..    
            if (adjLen >= 2 && adjLen < 4) {
                content = newString + junkString.slice(0, (adjLen - conLen));
            } else if (adjLen > 4) {
                newString += junkString.slice(0, (adjLen - conLen));
                content = "<b>[</b>" + newString + "<b>]</b>";
            } else {
                content = newString;
            }
            $(element).text(content);
        }
    });
}
