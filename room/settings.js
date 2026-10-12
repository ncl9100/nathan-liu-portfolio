// Room settings: drafting-paper colors, intro timing, camera limits, callout positions.
// All drafting-paper appearance and motion controls live here. Scene units are inches.
export const DRAFTING_CONFIG = {
  interaction:{debugPicking:false,clickPixels:5,clickMs:300,zoomLimitRatio:1.5,zoomExitDelta:180,zoomExitWindowMs:650,firstCloseupHint:"Click outside the room, or use Back to room, to step back.",clickZoom:2.5,welcomeCaption:"Welcome to my room. Make yourself at home.",welcomeMs:6000,captionMs:4000,lampFadeMs:300,hoverColor:0xa89a80,hoverOpacity:.42},
  colors:{paperCenter:'#f5f1e8',paperEdge:'#ded7ca',ink:'#655e52',rule:'#aaa091',grid:'#928879',shadow:'#655440',paperHover:'#fffaf0',inkStrong:'#332c21'},
  grid:{spacing:10,majorEvery:5,minorAlpha:.08,majorAlpha:.16,size:1800,fadeStart:300,fadeEnd:550,revealFeather:25,revealOverscan:50},
  shadow:{opacity:.27,blur:15,padding:55,resolution:512},
  dimensions:{offset:22,tick:4,labelOffset:11,inchesToMeters:.0254,precision:2},
  intro:{enabled:true,duration:2700,grid:[0,850],dimensions:[350,1300],room:[650,1850],callouts:[1900,2200],calloutStagger:100,calloutEndStagger:100,rise:14},
  parallax:{enabled:true,yaw:.018,pitch:.012,damping:9,epsilon:.00005},
  // Overview sway after the visitor goes idle. amplitude is in radians (.12 is about 7 degrees);
  // much more and the camera crosses the kitchen's outer wall, which then pops into view.
  sway:{enabled:true,idleMs:4000,amplitude:.12,periodSeconds:20,rampSeconds:1.5,maxFps:30},
  camera:{pixelRatioCap:2,far:3000,mobileFitAspect:.95,maxRadius:1800},
  // Callout title and label offset in px from its point: [title, x, y].
  callouts:{desk:['Desk',-65,-68],resume:['Resume',55,47],laptop:['Laptop',0,-42]},
  mobileCallouts:{desk:[-25,-64],resume:[20,65],laptop:[0,-42]},
  date:{timeZone:'America/New_York'}
};
