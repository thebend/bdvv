(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{131:function(e,t,n){e.exports=n(325)},323:function(e,t,n){},324:function(e,t,n){},325:function(e,t,n){"use strict";n.r(t);var a=n(0),i=n.n(a),r=n(130),l=n.n(r),o=n(27),s=n(63),c=n(66),u=n(65),m=n(50),d=n(67),h=(n(137),n(323),n(64));var f=navigator.userAgent.indexOf(" Trident/")>-1?"IE":navigator.userAgent.indexOf(" Edge/")>-1?"Edge":"Chrome",p=["Edge","IE"].indexOf(f)>-1,v={edge:{left:116,right:220,bottom:24},chrome:{left:24,right:24,bottom:16}},y="Chrome"==f?v.chrome:v.edge,b=function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(c.a)(this,Object(u.a)(t).call(this,e))).video=i.a.createRef(),n.thumbnail=i.a.createRef(),n.dragMargin=80,n.thumbnailWidth=196,n.thumbnailMargin=y.bottom+8,n.state={},n.hoverThumbnail=n.hoverThumbnail.bind(Object(h.a)(n)),n}return Object(d.a)(t,e),Object(m.a)(t,[{key:"setIO",value:function(){var e=this.props,t=e.inTime,n=e.outTime,a=this.video.current;a.ontimeupdate=function(e){var i=n&&n<a.currentTime,r=t&&t>a.currentTime;(i||r)&&(a.currentTime=t||0)}}},{key:"hoverThumbnail",value:function(e){var t=this.video.current;if(t)if(t.height-e.layerY>this.thumbnailMargin)this.setState({thumbnailState:void 0});else{var n=t.width-y.left-y.right,a=(e.layerX-y.left)/n;if(a<0||a>1)this.setState({thumbnailState:void 0});else{var i=t.duration*a;this.setState({thumbnailState:{offsetX:e.layerX-this.thumbnailWidth/2,timestamp:i}})}}}},{key:"componentDidUpdate",value:function(){var e=this.props,t=e.playbackRate,n=e.showThumbnail,a=this.video.current,i=t||1;if(a.playbackRate=i,this.setIO(),n&&"IE"!=f){var r=this.state.thumbnailState,l=this.thumbnail.current;l&&r&&(l.currentTime=r.timestamp),a.onmouseover=this.hoverThumbnail}else a.onmouseover=null}},{key:"componentDidMount",value:function(){var e=this,t=this.props,n=t.display,a=t.onLoad,i=t.onError,r=t.onDrag,l=t.showThumbnail,o=this.video.current;n.video=o,n.startTime?o.onload=function(){o.currentTime=n.startTime}:(o.onerror=i,o.onloadeddata=function(e){return o.currentTime=o.duration/2},o.onloadedmetadata=a),o.ondragstart=function(t){t.target.height-t.offsetY<e.dragMargin?t.preventDefault():r(n)},o.onmousemove=l&&"IE"!=f?this.hoverThumbnail:null,o.onmouseout=function(t){e.setState({thumbnailState:void 0})},this.setIO()}},{key:"getIO",value:function(){var e=this.props,t=e.inTime,n=e.outTime,a=this.video.current;if(t||n){var r=a.duration,l=t||0,o=n||r,s=a.width-y.left-y.right,c=l/r*s,u=o/r*s;return i.a.createElement(i.a.Fragment,null,i.a.createElement(g,{offset:c,color:"gold"}),i.a.createElement(g,{offset:u,color:"gold"}))}}},{key:"render",value:function(){var e=this.props,t=e.size,n=e.onMouseOver,a=e.onMouseOut,r=e.display,l=e.objectFit,o=e.showOverlay,s=e.showThumbnail,c=e.playbackRate,u=this.state.thumbnailState;return i.a.createElement("div",Object.assign({className:"display"},t,{onMouseOver:n,onMouseOut:a}),i.a.createElement("div",{className:"display-border",style:{width:"".concat(t.width,"px"),height:"".concat(t.height,"px"),pointerEvents:p?"none":"auto"}},o&&"".concat(r.file.name).concat(1==c?"":" ("+c+"x)")),o&&this.getIO(),s&&u&&i.a.createElement("video",{controls:!1,autoPlay:!1,loop:!1,muted:!0,src:r.url,width:this.thumbnailWidth,className:"thumbnail",ref:this.thumbnail,style:{left:u.offsetX}}),i.a.createElement("video",Object.assign({controls:!0,autoPlay:!0,loop:!0,muted:!0,src:r.url,draggable:!p},t,{ref:this.video,style:{objectFit:l}})))}}]),t}(i.a.Component);function g(e){var t=e.offset,n=e.color,a=y.bottom;return i.a.createElement("svg",{className:"iomarker",width:10,height:10,viewBox:"0 0 2 2",style:{bottom:a+5,left:y.left+t-5}},i.a.createElement("circle",{cx:1,cy:1,r:1,fill:n}))}var E=["contain","cover","fill","scale-down"],w=[{ratio:16/9,name:"16:9 (High Def)"},{ratio:4/3,name:"4:3 (Standard Def)"},{ratio:1,name:"1:1 (Square)"},{ratio:9/16,name:"9:16 (Vertical HD)"},{ratio:1.85,name:"1.85:1 (Cinematic)"},{ratio:2.35,name:"2.35:1 (Anamorphic)"}],k=(n(324),i.a.createElement("section",{id:"shortcuts"},i.a.createElement("h2",null,"Shortcuts"),i.a.createElement("ol",null,i.a.createElement("li",null,i.a.createElement("em",null,"C:")," Clone video (+1m)"),i.a.createElement("li",null,i.a.createElement("em",null,"D:")," Distribute times"),i.a.createElement("li",null,i.a.createElement("em",null,"E:")," Remove everything else"),i.a.createElement("li",null,i.a.createElement("em",null,"F:")," Toggle fullscreen"),i.a.createElement("li",null,i.a.createElement("em",null,"Shift+F:")," Fullscreen video"),i.a.createElement("li",null,i.a.createElement("em",null,"H:")," Toggle help"),i.a.createElement("li",null,i.a.createElement("em",null,"I:")," Toggle in point"),i.a.createElement("li",null,i.a.createElement("em",null,"O:")," Toggle out point"),i.a.createElement("li",null,i.a.createElement("em",null,"M:")," Toggle mute"),i.a.createElement("li",null,i.a.createElement("em",null,"R:")," Remove video"),i.a.createElement("li",null,i.a.createElement("em",null,"S:")," Change video scaling"),i.a.createElement("li",null,i.a.createElement("em",null,"X:")," Change aspect ratio"),i.a.createElement("li",null,i.a.createElement("em",null,"\u2190 \u2192:")," Skip 1m"),i.a.createElement("li",null,i.a.createElement("em",null,"Shift \u2190 \u2192:")," Skip 10%"),i.a.createElement("li",null,i.a.createElement("em",null,"Ctrl \u2190 \u2192:")," Change speed"),i.a.createElement("li",null,i.a.createElement("em",null,"Shift+S")," Sync speeds"),i.a.createElement("li",null,i.a.createElement("em",null,"Ctrl+W:")," Close tab"),i.a.createElement("li",null,i.a.createElement("em",null,"O,O:")," Restart video"),i.a.createElement("li",null,i.a.createElement("em",null,"2-9:")," Fill 2-9 size grid"),i.a.createElement("li",null,i.a.createElement("em",null,"Drag+Drop:")," Reorder videos")))),S=i.a.createElement("footer",null,i.a.createElement("h2",null,"Privacy Disclaimer"),i.a.createElement("p",null,"This tool records ",i.a.createElement("b",null,"no")," filenames, screen grabs, or any other methods of identifying the actual contents of any video.  Only metadata about a video's format (codec, file size, resolution, and duration) may be recorded."));function R(e){return i.a.createElement(i.a.Fragment,null,i.a.createElement("label",{htmlFor:e.name},e.label),i.a.createElement("select",{name:e.name,value:e.value,onChange:function(t){return e.callback(t.target.value)}},e.choices))}var O=function(e){return i.a.createElement("section",{id:"help"},i.a.createElement("h2",null,"Usage"),i.a.createElement("p",null,"Drag and drop any number of videos to auto-play in an optimally arranged grid."),i.a.createElement("section",{id:"settings"},i.a.createElement("h2",null,"Settings"),i.a.createElement("form",null,i.a.createElement(R,{name:"objectScale",label:"Video Fit/Fill",value:e.objectFit,choices:E.map(function(e,t){return i.a.createElement("option",{key:t,value:e},e[0].toUpperCase()+e.substr(1))}),callback:function(t){return e.objectFitCallback(t)}}),i.a.createElement("br",null),i.a.createElement(R,{name:"aspectRatio",label:"Aspect Ratio",value:w.indexOf(e.aspectRatio).toString(),choices:w.map(function(e,t){return i.a.createElement("option",{key:t,value:t},e.name)}),callback:function(t){return e.aspectRatioCallback(w[parseInt(t)])}}),i.a.createElement("br",null))),k,S)},T=i.a.createElement("section",{id:"splash"},i.a.createElement("p",null,"Auto-play any number of videos in an optimally arranged grid with simple drag-and-drop.  Videos start half-way in and loop, ensuring immediate, continuous immersion."),i.a.createElement("p",null,"Find your favourite moments quickly with thumbnail scrubbing and keyboard shortcuts to jump ahead in time 1m (\u2192) or 10% (Shift \u2192), or adjust playback speed (Ctrl \u2192)."),i.a.createElement("p",null,"Use shortcut keys to rapidly (c)opy or (r)emove displays, set (i)n/(o)ut loop points, (f)ullscreen the display, toggle (m)ute, etc."),i.a.createElement("p",null,"Great for scouring surveillance footage, finding the best highlights from your last gaming stream, and more!"));function j(e){e.preventDefault(),e.stopPropagation()}function D(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],a=e.video;if(a){var i=a.duration;n&&(t*=i);var r=i-a.currentTime;a.currentTime=t>r?t-r:a.currentTime+t}}function x(e){(e.requestFullscreen||e.msRequestFullscreen||e.webkitRequestFullscreen).call(e)}var F=document.fullscreenEnabled||document.msFullscreenEnabled||document.webkitFullscreenEnabled,I=(document.exitFullscreen||document.msExitFullscreen||document.webkitExitFullscreen).bind(document);function C(e){var t=e.errorDisplays,n=e.dismissCallback;return i.a.createElement("section",{id:"errors"},i.a.createElement("h2",null,"Errors"),i.a.createElement("ol",null,t.map(function(e,t){return i.a.createElement("li",{key:t},e.file.name," (",e.file.type,")")})),i.a.createElement("p",null,"Only videos supported by your web browser will play successfully.  ",i.a.createElement("code",null,".mp4")," and ",i.a.createElement("code",null,".webm")," files are good bets."),i.a.createElement("form",{onSubmit:n},i.a.createElement("button",null,"Dismiss")))}var A=function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(c.a)(this,Object(u.a)(t).call(this,e))).viewport=i.a.createRef(),n.globalActions={f:function(){return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:document.body;F&&(document.fullscreenElement||document.msFullscreenElement||document.webkitFullscreenElement?I():x(e))}()},h:function(){return n.setState({showHelp:!n.state.showHelp})},s:function(){return n.nextObjectFit()},t:function(){return n.setState({showThumbnails:!n.state.showThumbnails})},x:function(){return n.nextDimensionRatio()}},n.state={showHelp:!0,showThumbnails:!0,displays:[],maxId:0,ratioIndex:0,aspectRatio:w[0],objectFitIndex:0,objectFit:E[0],firstBatch:!0,errorDisplays:[]},window.onresize=function(){return n.updateDimensions()},window.onkeydown=function(e){var t=e.key.toLowerCase();if(t in n.globalActions&&!e.shiftKey&&!e.ctrlKey)n.globalActions[t]();else{var a=n.state.activeDisplay;if(a)if(e.shiftKey){var i={arrowleft:function(){return D(a,-.1,!0)},arrowright:function(){return D(a,.1,!0)},s:function(){return n.syncPlaybackRates(a.playbackRate)},f:function(){return x(a.video)}};t in i&&i[t]()}else if(e.ctrlKey){var r={arrowleft:function(){return n.adjustVideoSpeed(a,.5)},arrowright:function(){return n.adjustVideoSpeed(a,2)}};t in r&&r[t]()}else{var l={delete:function(){return n.deleteDisplay(a)},c:function(){return n.addDisplayCopy(a)},d:function(){return n.distributeTimes(a)},e:function(){return n.setState({displays:[a]})},i:function(){return n.setVideoIO(a,"in")},o:function(){return n.setVideoIO(a,"out")},m:function(){var e;(e=a.video)&&(e.muted=!e.muted)},r:function(){return n.deleteDisplay(a)},arrowleft:function(){return D(a,-60)},arrowright:function(){return D(a,60)}};t in l&&l[t](),t>="2"&&t<="9"&&(n.fillGrid(a,parseInt(t)),n.distributeTimes(a))}}},document.ondragover=j,document.ondragenter=j,document.ondragleave=j,document.ondrop=function(e){if(j(e),e.dataTransfer){var t=n.state.firstBatch,a=e.dataTransfer.files,i=Array.from(a).filter(function(e){return e.type.startsWith("video/")}),r=n.state.maxId,l=i.map(function(e){return{id:++r,file:e,url:URL.createObjectURL(e),triggerResize:t,playbackRate:1}});n.setState({displays:n.state.displays.concat(l),maxId:r,firstBatch:!1,showHelp:n.state.showHelp&&0==i.length})}},n}return Object(d.a)(t,e),Object(m.a)(t,[{key:"syncPlaybackRates",value:function(e){var t=this.state.displays;t.forEach(function(t){return t.playbackRate=e}),this.setState({displays:t})}},{key:"distributeTimes",value:function(e){var t=this.state.displays.filter(function(t){return t.file==e.file}),n=t.indexOf(e),a=[e].concat(Object(o.a)(t.slice(n+1)),Object(o.a)(t.slice(0,n))),i=e.video.currentTime,r=e.video.duration,l=r/a.length;a.forEach(function(e,t){var n=i+l*t;e.video.currentTime=n<r?n:n-r})}},{key:"fillGrid",value:function(e,t){var n=this,a=this.state.displays,i=t-a.length;if(!(i<1)){var r=Object(o.a)(Array(i)).map(function(t,a){var i=n.copyDisplay(e);return i.id+=a,i});this.setState({displays:a.concat(r),maxId:r.pop().id})}}}]),Object(m.a)(t,[{key:"getVideoSize",value:function(){var e=this.state,t=e.displays,n=e.aspectRatio,a=e.viewport;if(!a)return{width:1,height:1};if(t.length<2)return{width:a.x,height:a.y};for(var i=0,r=0,l=0,o=n.ratio,s=1;s<=t.length;s++){var c=Math.ceil(t.length/s),u=Math.floor(a.x/c),m=Math.floor(a.y/s),d=u,h=m;o>u/m?h=d/o:d=h*o;var f=d*h;f<i||(i=f,r=u,l=m)}return{width:r,height:l}}},{key:"adjustVideoSpeed",value:function(e,t){e.playbackRate=e.playbackRate*t,this.setState({displays:this.state.displays})}},{key:"setVideoIO",value:function(e,t){t in e?delete e[t]:e[t]=e.video.currentTime,this.setState({displays:this.state.displays})}},{key:"updateDimensions",value:function(){var e=this.viewport.current,t={x:e.clientWidth,y:e.clientHeight};this.setState({viewport:t})}},{key:"copyDisplay",value:function(e){var t=e.video,n=this.state.maxId+1,a=t.currentTime+60;return a>t.duration&&(a=0),{id:n,file:e.file,url:e.url,playbackRate:e.playbackRate,startTime:a,triggerResize:!1}}},{key:"addDisplayCopy",value:function(e){var t=this.copyDisplay(e);this.setState({maxId:t.id,displays:this.state.displays.concat(t)})}},{key:"deleteDisplay",value:function(e){this.setState({displays:this.state.displays.filter(function(t){return t!=e})})}},{key:"nextDimensionRatio",value:function(){var e=this.state.ratioIndex+1;e>=w.length&&(e=0),this.setState({ratioIndex:e,aspectRatio:w[e]})}},{key:"nextObjectFit",value:function(){var e=this.state.objectFitIndex+1;e>=E.length&&(e=0),this.setState({objectFitIndex:e,objectFit:E[e]})}},{key:"componentDidMount",value:function(){this.updateDimensions()}},{key:"getAspectRatios",value:function(){return this.state.displays.map(function(e){return e.video.videoWidth/e.video.videoHeight})}},{key:"getRecommendedAspectRatioIndex",value:function(){var e=this.getAspectRatios().reduce(function(e,t){return e+t},0)/this.state.displays.length,t=Object(o.a)(w).sort(function(t,n){return Math.min(t.ratio/e,e/t.ratio)-Math.min(n.ratio/e,e/n.ratio)}).pop();return w.findIndex(function(e){return e.name==t.name})}},{key:"setRecommendedAspectRatio",value:function(){var e=this.getRecommendedAspectRatioIndex();this.setState({aspectRatio:w[e],ratioIndex:e})}},{key:"handleVideoError",value:function(e){var t=this.state,n=t.displays,a=t.errorDisplays;a.push(e),this.setState({displays:n.filter(function(t){return t!=e}),errorDisplays:a})}},{key:"reorderDisplays",value:function(e){var t=this.state,n=t.displays,a=t.dragSrc;if(a){var i=n.filter(function(t){return t.video==e}).pop()||n[n.length-1],r=n.indexOf(a),l=[].concat(Object(o.a)(n.slice(0,r)),Object(o.a)(n.slice(r+1))),s=l.indexOf(i),c=[].concat(Object(o.a)(l.slice(0,s+1)),[a],Object(o.a)(l.slice(s+1)));this.setState({displays:c})}}},{key:"render",value:function(){var e=this,t=this.state,n=t.displays,a=t.errorDisplays,r=t.activeDisplay,l=(t.lastDisplay,t.showThumbnails),o=t.showHelp,s=t.aspectRatio,c=t.objectFit,u=this.getVideoSize();return i.a.createElement(i.a.Fragment,null,i.a.createElement("main",{ref:this.viewport,onDrop:function(t){return e.reorderDisplays(t.target)}},0==n.length&&T,n.map(function(t){return i.a.createElement(b,{size:u,objectFit:c,key:t.id,display:t,showOverlay:t==r,showThumbnail:l,playbackRate:t.playbackRate,onDrag:function(t){return e.setState({dragSrc:t})},onMouseOver:function(){return e.setState({activeDisplay:t,lastDisplay:t})},onMouseOut:function(){return e.setState({activeDisplay:void 0})},onLoad:function(){return t.triggerResize&&e.setRecommendedAspectRatio()},onError:function(){return e.handleVideoError(t)},inTime:t.in,outTime:t.out})})),a.length>0&&i.a.createElement(C,{errorDisplays:a,dismissCallback:function(){return e.setState({errorDisplays:[]})}}),o&&i.a.createElement(O,Object.assign({aspectRatio:s,objectFit:c},{aspectRatioCallback:function(t){return e.setState({aspectRatio:t})},objectFitCallback:function(t){return e.setState({objectFit:t})}})))}}]),t}(i.a.Component),M=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function W(e,t){navigator.serviceWorker.register(e).then(function(e){e.onupdatefound=function(){var n=e.installing;null!=n&&(n.onstatechange=function(){"installed"===n.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://bit.ly/CRA-PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}}).catch(function(e){console.error("Error during service worker registration:",e)})}l.a.render(i.a.createElement(A,null),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",function(){var t="".concat("","/service-worker.js");M?(function(e,t){fetch(e).then(function(n){var a=n.headers.get("content-type");404===n.status||null!=a&&-1===a.indexOf("javascript")?navigator.serviceWorker.ready.then(function(e){e.unregister().then(function(){window.location.reload()})}):W(e,t)}).catch(function(){console.log("No internet connection found. App is running in offline mode.")})}(t,e),navigator.serviceWorker.ready.then(function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://bit.ly/CRA-PWA")})):W(t,e)})}}()}},[[131,1,2]]]);
//# sourceMappingURL=main.3d6dfba5.chunk.js.map