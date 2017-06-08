/*
    0    PlayerEntity,
    1    MobEntity,
    2    NPCEntity,
    3    FarmAnimalEntity,
    4    FarmPlantEntity,
    5    WildEntity,
    6    MiscParticleEntity,
	7	FurnatureEntity
*/

var emotes = ["emoteWaiting","emoteMusic","emoteSmile","emoteFrown","emoteExclaim","emoteLove","emoteGrin","emoteAnger","emoteQuestion","emotePoison","emoteSad"];

function ResourcesSetup() {
	
        
	definitionResources.push(new ResourceDefinition("/play/definitions/hatFemaleOccupation.json"));
        
	definitionResources.push(new ResourceDefinition("/play/definitions/body.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/body_angry_eyes.json"));
        
	definitionResources.push(new ResourceDefinition("/play/definitions/hairMale.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/hairMaleSpikey.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/hairMaleDistinct.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/hairFemale.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/hairFemalePonytail.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/hairFemaleNurse.json"));
        
	definitionResources.push(new ResourceDefinition("/play/definitions/pants.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/pantsLab.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/pantsFemale.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/pantsFemaleOccupation.json"));
        
	definitionResources.push(new ResourceDefinition("/play/definitions/shirt.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/shirtLab.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/shirtFemale.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/shirtFemaleOccupation.json"));
        
        
	definitionResources.push(new ResourceDefinition("/play/definitions/shoe.json"));
	definitionResources.push(new ResourceDefinition("/play/definitions/emotes.json"));
	
	SystemFont = new ResourceFont("/play/fonts/fontPixel.xml");
	definitionFonts.push(SystemFont);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//Fonts
var definitionFonts = [];
var definitionFontsLoadedCount = 0;
var definitionFontsTotalCount = 0;

function ResourceFont(url) {
	definitionFontsTotalCount++;
	this.url = url;
	
	var font = this;
	this.characters = {};
	this.key = url;
	
	this.source = null;
	this.image = null;
	
	
	this.Draw = function(text, x, y, align, scale , render ) {
            if( !render )
                render = true;

            if( typeof scale === 'undefined' )
                scale = 1;
            
            var xOffset = 0;
            var rolling = 0;
            if( align == "center" ) {
                //work out the total length so that we can work out where to start the rendering.
                for(var i=0;i<text.length;i++) {
                    var charCode = text.charCodeAt(i) + "";
                    var character = this.characters[charCode];
                    if( character ) {
                            rolling+=parseInt(character.xadvance);
                    }
                }
                xOffset = rolling/2;
            }

            xOffset *= scale;

            var rolling = x - xOffset;
            for(var i=0;i<text.length;i++) {
                var charCode = text.charCodeAt(i) + "";

                var character = this.characters[charCode];
                if( character ) {
                        try {
                            ctx.drawImage(this.image.img, character.x,  character.y, character.width ,  character.height ,  rolling + parseInt(character.xoffset), y+ parseInt(character.yoffset * scale) , character.width * scale,  character.height * scale );
                        } catch(e) {
                            //firefox complains if we draw from outside the source image
                        }
                        rolling+=parseInt(character.xadvance * scale);
                }
            }
            return rolling;
	}
	
	$.ajax({
		type: "GET", url: url, 
		dataType: "xml",
		success: function(responseData, textStatus, jqXHR) {
			var data = responseData;
			
			var fontData = responseData.childNodes[0];
			for(var i=0;i<fontData.childNodes.length;i++) {
				var node = fontData.childNodes[i];
				if( node.nodeName == "pages") {
					var page = node.childNodes[0];
					if( page.nodeName != "page" )
						page = node.childNodes[1];
					font.source = page.getAttribute("file");
					
					font.image = new ResourceImage(font.source,font.source);
					screenResources.push(font.image);
					
				} else if( node.nodeName == "chars") {
					for(var k=0;k<node.childNodes.length;k++) {
						var character = node.childNodes[k];
						
						if( character.nodeName == "char" ) {
							var code = {"id":character.getAttribute("id"), "x":character.getAttribute("x"), "y":character.getAttribute("y"), "width":character.getAttribute("width"), "height":character.getAttribute("height"), "xoffset":character.getAttribute("xoffset"), "yoffset":character.getAttribute("yoffset"), "xadvance":character.getAttribute("xadvance")};
							font.characters[code.id] = code;
						}
					}
				}
			}
			
			definitionFontsLoadedCount++;
		},
		error: function (responseData, textStatus, errorThrown) {
			alert('GET failed.');
		}
    });
	
}


//regions 
function Region(data,x1,y1,x2,y2) {
	this.data = data;
	this.X1 = x1;
	this.Y1 = y1;
	this.X2 = x2;
	this.Y2 = y2;
	
	this.Contains = function(pos) {
		if( pos.x >= this.X1 && pos.x <= this.X2 ) {
			if( pos.y >= this.Y1 && pos.y <= this.Y2 ) {
				return true;
			}
		}
		return false;
	}
	
	return this;
}

//Charset Definitions
var definitionResources = [];
var definitionResourceLoadedCount = 0;
var definitionResourceTotalCount = 0;


//Sprite sheet management class
function ResourceDefinition(url) {
	this.definition = null;
	this.source = null;
	this.sets = null;
	this.frameCount = 0;
	
	//Find a variant in the associative array of variant offsets
	this.VariantForName = function(variant) {
		if( this.definition == null )
			return null;
		
		if( variant == this.definition.name ) {
			return {"x" : 0,"y" : 0};
		}
		
		for (var v in this.definition.variants) {
			if( v == variant ) {
				return this.definition.variants[v];
			}
		}
		return null;
	}
	
	//draw a subsection of a spritesheet to a canvas using an x,y coord and a drawWidth/Height.
	this.Draw = function(ctx,variant,direction,frame,x,y,drawW,drawH) {
		var frames = this.definition.frames[direction];
		var f = frames.frames[frame];
		this.frameCount = frames.frames.length;
		
		var offset = {"x":0,"y":0};
		if( variant != this.definition.name ) {
			offset = this.VariantForName(variant);
		}
		
		this.source = resourceByKey(this.definition.source);
		ctx.drawImage(this.source, (f.x + offset.x) * scale, (f.y + offset.y)* scale, f.w * scale, f.h * scale,  x, y , drawW, drawH );

	}
	
	//download the definition file for this spritesheet
	var res = this;
	
	
	$.ajax({
		type: "GET", url: url, 
		dataType: "json",
		success: function(responseData, textStatus, jqXHR) {
			var data = responseData;
			res.definition = data;
			res.source = resourceByKey(data.source);
			if( res.source == null ) {
				res.source = new ResourceImage(data.source,data.source,true);
				screenResources.push(res.source);
				res.source = resourceByKey(data.source);
			}
			
			res.sets = [];
			res.sets[res.sets.length] = data.name;
			for (var variant in data.variants) {
				res.sets[res.sets.length] = variant;
			}
			
			definitionResourceLoadedCount++;
			
		},
		error: function (responseData, textStatus, errorThrown) {
			alert('GET failed.');
		}
    });
	
	
	definitionResourceTotalCount++;
	return this;
}



function SetScale(scaleNew) {
	//TODO: improve scaling system so that we dont scale things we dont want to.
	scale = scaleNew;
	for(var i=0;i<screenResources.length;i++) {
		screenResources[i].scaled = null;
		if( scale == 1 ) {
			screenResources[i].scaled = screenResources[i].img;
		} else {
			screenResources[i].scaled = screenResources[i].Resize(scale);
		}
	}
	
	if( area != null ) {
		area.tileset = resourceByKey(area.tilesetFile);
	}
        
        console.log("Scale Set to: "+scaleNew);
}






//lookup functions
function definitionByKey(variant) {
	for(var i=0;i<definitionResources.length;i++) {
		if( definitionResources[i].VariantForName(variant) ) {
			return definitionResources[i];
		}
	}
	return null;
}
function fontByKey(key) {
	for(var i=0;i<screenFonts.length;i++) {
		if( screenFonts[i].key == key)
			return screenFonts[i];
	}
	return null;
}
function resourceByKey(key) {
	for(var i=0;i<screenResources.length;i++) {
		if( screenResources[i].key == key)
			return screenResources[i].scaled;
	}
	return null;
}
function musicResourceByKey(key) {
	for(var i=0;i<musicResources.length;i++) {
		if( musicResources[i].key == key)
			return musicResources[i];
	}
	return null;
}
function effectResourceByKey(key) {
	for(var i=0;i<effectResources.length;i++) {
		if( effectResources[i].key == key)
			return effectResources[i].audio;
	}
	return null;
}



//Drawing Resources
var screenResources = [];
var ImageResourceLoadedCount = 0;
var ImageResourceTotalCount = 0;
function ResourceImage(src,key,willScale) {
	
	if( typeof willScale == 'undefined' ) {
		willScale = false;
	}
	
	this.img = new Image();
	this.willScale = willScale;
	this.url = src;
	this.scaled = this.img;
	
	this.key = key;
	ImageResourceTotalCount++;
	
	this.Resize = function( scale ) {
		var img = this.img;
		if( !this.willScale ) {
			return img;
		}
		if( scale == 1 ) {
			return img;
		}
		if( img.width == 0) {
			return img; 
		}
		// Takes an image and a scaling factor and returns the scaled image
		
		// The original image is drawn into an offscreen canvas of the same size
		// and copied, pixel by pixel into another offscreen canvas with the 
		// new size.
		
		var widthScaled = img.width * scale;
		var heightScaled = img.height * scale;
		
		var orig = document.createElement('canvas');
		orig.width = img.width;
		orig.height = img.height;
		var origCtx = orig.getContext('2d');
		origCtx.drawImage(img, 0, 0);
		var origPixels = origCtx.getImageData(0, 0, img.width, img.height);
		
		var scaled = document.createElement('canvas');
		scaled.width = widthScaled+64;
		scaled.height = heightScaled+64;
		var scaledCtx = scaled.getContext('2d');
		var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled , heightScaled );
		
		for( var y = 0; y < heightScaled; y++ ) {
			for( var x = 0; x < widthScaled; x++ ) {
				var index = (Math.floor(y / scale) * img.width + Math.floor(x / scale)) * 4;
				var indexScaled = (y * widthScaled + x) * 4;
				scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
				scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
				scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
				scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
			}
		}
		scaledCtx.putImageData( scaledPixels, 0, 0 );
		
		
		origCtx = null;
		orig = null;
		scaledPixels = null;
		origPixels = null;
		
		
		return scaled;
	}
	
	
	this.img.src = src;
	var image = this;
	this.img.onload = function() {
		ImageResourceLoadedCount++;
		image.width = image.img.width;
		image.height = image.img.height;
		image.scaled = image.Resize(scale);
		
		if( area != null ) {
			if( image.key == area.tilesetFile ) {
				area.tileset = resourceByKey(area.tilesetFile); 
			}
		}
	}
	return this;
}

//Audio Resources
var musicResources = [];
var MusicResourceLoadedCount = 0;
var MusicResourceTotalCount = 0;
function ResourceMusic(src,key) {
	this.audio = null;
	
	MusicResourceTotalCount++;
	this.key = key;
	this.src = src;
	
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
	{
		this.audio = new Audio();
		this.audio.src = src;
		this.audio.load();
	}
	return this;
}


var prevPlaying = "";
var prevPlayingSong = null;
var playOnceSong = null;
var soundEnabled = 0;
var musicEnabled = 0;

var effectResources = [];
var EffectResourceLoadedCount = 0;
var EffectResourceTotalCount = 0;
function ResourceEffect(src,key) {
	this.audio = new Audio();
	this.audio.src = src;
	this.audio.oncanplaythrough = loadedEffectResource;
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
	{
		this.audio.load();
	}
	this.audio.volume = 0.5;
	this.key = key;
	EffectResourceTotalCount++;
	return this;
}

//Load completion functions
function loadedMusicResource() {
	MusicResourceLoadedCount++;
}
function loadedEffectResource() {
	EffectResourceLoadedCount++;
}

//XML functions	function firstChildNodeNamed(name, node) {
function firstChildNodeNamed(name, node) {
	for (var i = 0; i < node.childNodes.length; i++) {
		if (node.childNodes[i].nodeName == name)
			return node.childNodes[i];
	}
	return null;
}

function nodeValue(node) {
	var str = node.nodeValue;
	if (str == null)
		if (node.childNodes.length > 0) 
			str = node.childNodes[0].nodeValue;
			
	return str;
}

function getDataOfImmediateChild(parentNode)
{
	var val = "";
	for (n=0; n < parentNode.childNodes.length; n++)
	{
		val = val + nodeValue(parentNode.childNodes[n]);
	}
	return val;
}


function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
