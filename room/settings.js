// Room settings: drafting-paper colors, intro timing, camera limits, callout positions.
// All drafting-paper appearance and motion controls live here. Scene units are inches.
export const DRAFTING_CONFIG = {
  interaction:{debugPicking:false,clickPixels:5,clickMs:300,zoomLimitRatio:1.5,zoomExitDelta:180,zoomExitWindowMs:650,firstCloseupHint:"Click anywhere to step back.",captionMs:4000,lampFadeMs:300,hoverColor:0xa89a80,hoverOpacity:.42},
  colors:{paperCenter:'#f5f1e8',paperEdge:'#ded7ca',ink:'#655e52',rule:'#aaa091',grid:'#928879',shadow:'#655440',paperHover:'#fffaf0',inkStrong:'#332c21'},
  grid:{spacing:10,majorEvery:5,minorAlpha:.08,majorAlpha:.16,size:1800,fadeStart:300,fadeEnd:550,revealFeather:25,revealOverscan:50},
  shadow:{opacity:.27,blur:15,padding:55,resolution:512},
  dimensions:{offset:22,tick:4,labelOffset:11,inchesToMeters:.0254,precision:2},
  intro:{enabled:true,duration:2700,grid:[0,850],dimensions:[350,1300],room:[650,1850],callouts:[1900,2200],calloutStagger:100,calloutEndStagger:100,rise:14},
  parallax:{enabled:true,yaw:.018,pitch:.012,damping:9,epsilon:.00005},
  camera:{pixelRatioCap:2,far:3000,mobileFitAspect:.95,maxRadius:1800},
  callouts:{desk:['A','Desk',-65,-68],bed:['B','Bed',-90,35],side:['C','Kitchen',82,-42],resume:['D','Résumé',55,47],laptop:['E','Laptop',0,-42]},
  mobileCallouts:{desk:[-25,-64],bed:[-45,35],side:[60,-85],resume:[20,65],laptop:[0,-42]},
  date:{timeZone:'America/New_York'}
};
