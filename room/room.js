// Room: the 3D drafting-sheet view of the room (scene, camera, intro, hotspots, captions).
//
// Listens for:  room:go {view}                 move the camera (nav)
//               resume:opened / resume:closed  track the résumé viewer; go to the shelves view on close
//               laptop:opened / laptop:closed  pause while LiuOS covers the room
//               laptop:screen {canvas,...}     show LiuOS's picture on the 3D laptop screen
// Announces:    room:view {view}               where the camera is (nav highlights)
//               resume:open / resume:close     ask the résumé viewer to open or close
//               laptop:open / laptop:close / laptop:screen-request

import { DRAFTING_CONFIG } from './settings.js';
import { LIUOS_CONFIG } from '../liuos/settings.js'; // only for the 3D screen's brightness

const markup = await fetch(new URL('room.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('beforeend', markup);

// LiuOS state, kept in sync by its laptop:opened / laptop:closed / laptop:screen announcements.
let laptopOpen=false,laptopScreenPowered=true;
// Résumé viewer state, kept in sync by its resume:opened / resume:closed announcements.
let resumeOpen=false;

const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion=()=>motionPreference.matches||!DRAFTING_CONFIG.intro.enabled;
for(const [key,value] of Object.entries(DRAFTING_CONFIG.colors))document.documentElement.style.setProperty({'paperCenter':'--paper-center','paperEdge':'--paper-edge',ink:'--drawing-ink',rule:'--drawing-rule'}[key]||'--'+key,value);
document.getElementById('drawing-date').textContent=new Date().toLocaleDateString('en-CA',{timeZone:DRAFTING_CONFIG.date.timeZone});

// Measured structure with procedural oak and an estimated lamp, not a finished room.
const status = document.getElementById('status');
try {
const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
const measured = {width:42,depth:24,desktopHeight:30,shelfWidth:42,shelfDepth:10,shelfHeights:[50.5,63,75],frontStripHeight:2.75,drawerWidth:15.5};
const estimated = {board:0.8,upright:0.85,desktopThickness:1.1};
const stage = document.getElementById('stage');
const scene = new THREE.Scene(); scene.background=null;
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,DRAFTING_CONFIG.camera.pixelRatioCap));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-label',"3D model of Nathan's room. Use the navigation above to view About, Experience, Projects, Resume, and Contact.");renderer.domElement.tabIndex=0;stage.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(38,1,0.1,DRAFTING_CONFIG.camera.far);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
// A deterministic oak-like grain: broad growth rings plus fine fibers. It is
// synthesized locally, not extracted from the supplied photos or downloaded.
const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=512;
const grainContext=grainCanvas.getContext('2d');const pixels=grainContext.createImageData(512,512);
function hash(x,y){const n=Math.sin(x*127.1+y*311.7+47.2)*43758.5453;return n-Math.floor(n);}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return (hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx)*(1-fy)+(hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx)*fy;}
for(let y=0;y<512;y++)for(let x=0;x<512;x++){
const u=x/512,v=y/512;
const warp=noise(u*3,v*7)*1.9+noise(u*8,v*12)*.22;
const phase=v*115+warp+Math.sin(u*4.8+v*3)*1.4;
const ring=Math.pow((Math.sin(phase*2*Math.PI)+1)/2,15);
const fiber=noise(u*13,v*260)*6+noise(u*35,v*400)*3;
const shade=noise(u*4,v*4)*18-ring*15+fiber-11;
const i=(y*512+x)*4;pixels.data[i]=177+shade;pixels.data[i+1]=124+shade*.8;pixels.data[i+2]=65+shade*.5;pixels.data[i+3]=255;
}grainContext.putImageData(pixels,0,0);
const grain=new THREE.CanvasTexture(grainCanvas);grain.colorSpace=THREE.SRGBColorSpace;grain.anisotropy=renderer.capabilities.getMaxAnisotropy();
const grainVertical=grain.clone();grainVertical.center.set(.5,.5);grainVertical.rotation=Math.PI/2;grainVertical.needsUpdate=true;
function oak(color,map=grain){const m=new THREE.MeshPhysicalMaterial({color,map,roughness:.48,clearcoat:.16,clearcoatRoughness:.55});m.userData.wood=true;return m;}
const material=oak('#ffffff');const trim=oak('#e9d5b5');
const woodVertical=oak('#ffffff',grainVertical);const trimVertical=oak('#e9d5b5',grainVertical);
const dark=new THREE.MeshStandardMaterial({color:'#24272a',roughness:.5,metalness:.2});
const chairMat=new THREE.MeshStandardMaterial({color:'#233a57',roughness:.94});
const desk=new THREE.Group();scene.add(desk);
function box(w,h,d,x,y,z,mat=material,parent=desk){
let faces=mat;
if(mat.userData.wood){const vertical=mat===trim?trimVertical:woodVertical;const side=h>d?vertical:mat;const top=d>w?vertical:mat;const front=h>w?vertical:mat;faces=[side,side,top,top,front,front];}
const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),faces);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
// Top faces land exactly at the measured heights.
box(measured.width,estimated.desktopThickness,measured.depth,0,30-estimated.desktopThickness/2,0);
const shelfZ=-measured.depth/2+measured.shelfDepth/2;
for(const height of measured.shelfHeights){
box(measured.shelfWidth,estimated.board,measured.shelfDepth,0,height-estimated.board/2,shelfZ);
// A tall front rail does not imply a 2.75-inch-thick whole shelf board.
box(measured.shelfWidth,measured.frontStripHeight,0.65,0,height-measured.frontStripHeight/2,shelfZ+measured.shelfDepth/2-0.325,trim);
}
const aboveDesk=75-30;
for(const x of [-21+estimated.upright/2,21-estimated.upright/2])box(estimated.upright,aboveDesk,10,x,30+aboveDesk/2,shelfZ);
// Drawer pedestal occupies the measured rightmost 15.5 inches.
const drawerX=21-measured.drawerWidth/2;
box(measured.drawerWidth,28.9,22.5,drawerX,14.45,-0.45,trim);
for(let i=0;i<3;i++)box(14.5,8.8,0.65,drawerX,5.3+i*9.1,11.25);
for(let i=0;i<3;i++)box(11,0.55,0.6,drawerX,8.8+i*9.1,11.8,trim);
for(const z of [-10.5,10.5])box(1.5,28.9,1.5,-19.7,14.45,z);
box(25,3,1,-7.4,27,10.7,trim);
const deskFurniture=new Set(desk.children);
// Laptop base is measured; screen height and keyboard spacing are photo estimates.
const laptopBase=box(14,0.45,9.5,-5,30.25,3.8,dark);
const screen=box(14,8,0.35,-5,34.35,-0.5,dark);screen.rotation.x=-0.15;
const screenFace=box(12.8,6.7,0.08,-5,34.35,-0.26,new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false}));screenFace.rotation.x=-0.15;screenFace.castShadow=false;screenFace.receiveShadow=false;

const keys=new THREE.Group();desk.add(keys);
const keyMat=new THREE.MeshStandardMaterial({color:'#15191e',roughness:.65});
function textSurface(text,w,h,x,y,z,parent,color='#cbd0d5',bg=null,rotation=0){
 const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);}ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 '+(text.length>12?32:55)+'px Segoe UI';text.split('\n').forEach((line,i,arr)=>ctx.fillText(line,256,128+(i-(arr.length-1)/2)*56));
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true}));m.position.set(x,y,z);m.rotation.x=rotation;parent.add(m);return m;
}
const keyRows=[['Esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','Del'],['~','1','2','3','4','5','6','7','8','9','0','←'],['Tab','Q','W','E','R','T','Y','U','I','O','P','['],['Caps','A','S','D','F','G','H','J','K','L',';','↵'],['Shift','Z','X','C','V','B','N','M',',','.','↑','Shift']];
for(let r=0;r<keyRows.length;r++)for(let c=0;c<12;c++){const x=-11.15+c*.78,z=.1+r*.84;box(.68,.13,.7,x,30.54,z,keyMat,keys);textSurface(keyRows[r][c],.45,.36,x,30.615,z,keys,'#bbc0c5',null,-Math.PI/2);}
for(let r=0;r<5;r++)for(let c=0;c<3;c++){const x=-1.4+c*.9,z=.1+r*.84;box(.77,.13,.7,x,30.54,z,keyMat,keys);textSurface(['7','8','9','4','5','6','1','2','3','0','.','↵','←','↓','→'][r*3+c],.45,.4,x,30.615,z,keys,'#bbc0c5',null,-Math.PI/2);}
box(4,.13,.7,-6.5,30.54,4.3,keyMat,keys);textSurface('space',2,.35,-6.5,30.615,4.3,keys,'#9fa7ad',null,-Math.PI/2);
box(4.7,.03,2.2,-6,30.495,6.6,new THREE.MeshStandardMaterial({color:'#353a40',roughness:.65}),keys);
const powerButton=box(.7,.13,.55,.9,30.55,-.5,keyMat,keys);textSurface('⏻',.5,.4,.9,30.625,-.5,keys,'#dce6ef',null,-Math.PI/2);

const chair=new THREE.Group();scene.add(chair);
box(18,1.5,17,-7,17,26,material,chair);box(16.5,1,15.5,-7,18.2,26,chairMat,chair);
for(const x of [-15,1])for(const z of [19,33])box(1.2,17,1.2,x,8.5,z,material,chair);
for(const x of [-15,1])box(1.2,18,1.2,x,27,33,material,chair);
box(17,11,1.5,-7,30.5,33,chairMat,chair);
// Floor and room structure are built below after relocating the desk.
scene.add(new THREE.HemisphereLight(0xe8efff,0x8b7153,1.35));
const light=new THREE.DirectionalLight(0xffecd4,2.1);light.position.set(35,200,100);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.target.position.set(155,0,65);scene.add(light.target);light.shadow.camera.left=-240;light.shadow.camera.right=240;light.shadow.camera.top=200;light.shadow.camera.bottom=-200;light.shadow.camera.near=1;light.shadow.camera.far=600;light.shadow.bias=-0.0004;light.shadow.radius=4;scene.add(light);
// Lamp silhouette is estimated from the photos; the ambient light stays on
// when its spotlight is off so the scene remains usable.
const silver=new THREE.MeshStandardMaterial({color:'#a9adb0',metalness:.65,roughness:.3});
const lampMeshes=[box(4.5,.6,5,15,30.3,-4,silver),box(.8,10,.8,15,35.5,-6,silver)];
const lampBar=box(1.25,.55,9,15,40.7,-2.2,silver);lampBar.rotation.x=-.15;
const emitterMat=new THREE.MeshStandardMaterial({color:'#fff4d8',emissive:'#fff2d4',emissiveIntensity:2});
const emitter=box(.9,.08,7.7,15,40.38,-2.2,emitterMat);emitter.rotation.x=-.15;
const lampLight=new THREE.SpotLight(0xfff3dc,1800,55,.72,.75,2);lampLight.position.set(15,40,-1);lampLight.target.position.set(7,30,2);lampLight.castShadow=true;lampLight.shadow.mapSize.set(1024,1024);lampLight.shadow.bias=-.0001;scene.add(lampLight,lampLight.target);
lampMeshes.push(lampBar,emitter);
let lampOn=true,lampFadeFrame=0;

// Main room dimensions are approximate user measurements. Connection offsets
// are explicit assumptions awaiting review; do not mistake them for measurements.
const room={length:218,width:135,height:96,passageLength:86,passageWidth:42.5,kitchenWidth:102,kitchenDepth:92,passageInset:15};
const passageCenterZ=room.passageInset+room.passageWidth/2;
const kitchenStartZ=room.passageInset+room.passageWidth;
const kitchenCenterZ=kitchenStartZ+room.kitchenDepth/2;
const kitchenEndZ=kitchenStartZ+room.kitchenDepth;
desk.position.set(154.75,0,12);chair.position.copy(desk.position);
lampLight.position.add(desk.position);lampLight.target.position.add(desk.position);
const roomObjects=new THREE.Group();scene.add(roomObjects);
const wallMat=new THREE.MeshStandardMaterial({color:'#f3f0e9',roughness:.95});
const linen=new THREE.MeshStandardMaterial({color:'#f2eee5',roughness:1});
const paleGreen=new THREE.MeshStandardMaterial({color:'#c5ceae',roughness:1});
const cabinet=new THREE.MeshStandardMaterial({color:'#aaa18e',roughness:.8});
const white=new THREE.MeshStandardMaterial({color:'#e4e6e3',roughness:.6});
const labelMat=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false});
const fixtures=new THREE.Group();roomObjects.add(fixtures);
function rb(w,h,d,x,y,z,mat=material){return box(w,h,d,x,y,z,mat,fixtures);}
// Keep the confirmed door and kitchen wall aligned at X=304. Kitchen width
// puts its other wall at 202. Split the bedroom floor to avoid overlapping
// surfaces at the resulting 16-inch step; approximate dimensions need review.
const floorMat=oak('#f3e3c8');
rb(218,1,kitchenStartZ,109,-.5,kitchenStartZ/2,floorMat);
rb(202,1,135-kitchenStartZ,101,-.5,(135+kitchenStartZ)/2,floorMat);
rb(86,1,42.5,261,-.5,passageCenterZ,floorMat);
rb(102,1,92,253,-.5,kitchenCenterZ,floorMat);
const walls=[];
function wall(w,d,x,z,nx,nz){const m=rb(w,96,d,x,48,z,wallMat);walls.push({mesh:m,x,z,nx,nz});return m;}
wall(218,2,109,-1,0,-1);wall(2,135,-1,67.5,-1,0);wall(202,2,101,136,0,1);
wall(2,room.passageInset,219,room.passageInset/2,1,0);wall(86,2,261,room.passageInset-1,0,-1);
// The sink-side partition has an actual opening, not glass or a mirror.
// Only its 17.5-inch clear height is measured; sill elevation and width are estimated.
const passThrough={height:17.5,bottom:36.5,width:68,startZ:kitchenStartZ+6};
passThrough.top=passThrough.bottom+passThrough.height;
const openingCenterZ=passThrough.startZ+passThrough.width/2;
const openingEndZ=passThrough.startZ+passThrough.width;
const kitchenPartition=new THREE.Group();fixtures.add(kitchenPartition);
function partitionBox(w,h,d,x,y,z,mat=wallMat){return box(w,h,d,x,y,z,mat,kitchenPartition);}
const lowerPartition=partitionBox(2,passThrough.bottom,92,201,passThrough.bottom/2,kitchenCenterZ);
const upperPartition=partitionBox(2,room.height-passThrough.top,92,201,(room.height+passThrough.top)/2,kitchenCenterZ);
partitionBox(2,passThrough.height,6,201,(passThrough.bottom+passThrough.top)/2,kitchenStartZ+3);
partitionBox(2,passThrough.height,kitchenEndZ-openingEndZ,201,(passThrough.bottom+passThrough.top)/2,(kitchenEndZ+openingEndZ)/2);
partitionBox(.15,35,passThrough.width,199.9,17.5,openingCenterZ,new THREE.MeshStandardMaterial({color:'#343638',roughness:.8}));
// Narrow white ledge around the room-side edge, below the clear opening.
partitionBox(6,1,passThrough.width,200,passThrough.bottom-.5,openingCenterZ,white);
scene.updateMatrixWorld(true);
const clearHeight=new THREE.Box3().setFromObject(upperPartition).min.y-new THREE.Box3().setFromObject(lowerPartition).max.y;
if(Math.abs(clearHeight-17.5)>.01)throw new Error('Kitchen pass-through height must be 17.5 inches.');
wall(102,2,253,kitchenEndZ+1,0,1);wall(2,92,305,kitchenCenterZ,1,0);
wall(16,2,210,kitchenStartZ-1,0,-1);
// Door wall: a 34-inch-wide opening, positioned within the measured passage.
wall(2,4.25,305,room.passageInset+2.125,1,0);wall(2,4.25,305,kitchenStartZ-2.125,1,0);
const door=rb(.8,80,34,304.6,40,passageCenterZ,white);walls.push({mesh:door,x:305,z:passageCenterZ,nx:1,nz:0});
// Photo-confirmed divider between the door and fridge. Its thickness and
// projection are estimated separately from the measured 15-inch bedroom step.
const fridgePartition=rb(28,96,3,290,48,kitchenStartZ+1.5,wallMat);
// Window dimensions and blind count are estimated from the photographs.
const windowGroup=new THREE.Group();fixtures.add(windowGroup);
box(.5,59,90,.3,57,67.5,new THREE.MeshStandardMaterial({color:'#a8b9ba',roughness:.5}),windowGroup);
for(let i=0;i<30;i++)box(.75,.7,90,1,28+i*1.9,67.5,white,windowGroup);
rb(3,1.5,94,1,26.5,67.5,white);rb(5,23,48,3,11.5,67.5,white);
// Your bed: the supplied outer footprint, with a 56-inch headboard offset.
function bed(x,z,length,width,mat,headAtStart){
const bedGroup=new THREE.Group();fixtures.add(bedGroup);
const b=(...args)=>box(...args.slice(0,6),args[6]||material,bedGroup);
b(length,3,width,x,17,z,trim);b(length-3,7,width-2,x,22,z,mat);
for(const bx of [x-length/2+1,x+length/2-1])for(const bz of [z-width/2+1,z+width/2-1])b(2,18,2,bx,9,bz);
const headX=x+(headAtStart?-1:1)*(length/2-1);
b(2,17,width,headX,31,z,material);
// A curved pillow and a subdivided blanket make the bed feel occupied.
const pillow=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),mat);pillow.scale.set(7,2.4,(width-10)/2);pillow.position.set(headX+(headAtStart?9:-9),27,z);pillow.castShadow=true;pillow.receiveShadow=true;bedGroup.add(pillow);
const cloth=new THREE.PlaneGeometry(length-16,width+4,48,32);cloth.rotateX(-Math.PI/2);const positions=cloth.attributes.position;
for(let i=0;i<positions.count;i++){const bx=positions.getX(i),bz=positions.getZ(i);const folds=.65*Math.sin(bx*.4+bz*.22)+.4*Math.sin(bz*.7-bx*.14);const drape=Math.max(0,Math.abs(bz)-(width/2-4))*1.1;positions.setY(i,folds-drape+1.1*Math.exp(-((bx-15)**2)/70));}cloth.computeVertexNormals();
const blanket=new THREE.Mesh(cloth,new THREE.MeshStandardMaterial({color:headAtStart?'#eeeae0':'#d3d9c7',roughness:1,side:THREE.DoubleSide}));blanket.position.set(x+(headAtStart?7:-7),26.4,z);blanket.castShadow=true;blanket.receiveShadow=true;bedGroup.add(blanket);
return bedGroup;
}
const yourBed=bed(93,19.5,74,39,linen,true);
const otherBed=bed(117,115.5,74,39,paleGreen,false);
for(const [root,name] of [[yourBed,'Your bed'],[otherBed,'Other bed']]){root.name=name;root.traverse(obj=>{if(obj.isMesh)obj.name=name+' / '+obj.geometry.type;});}
// Roommate's desk uses the same dorm-furniture proportions as an estimate.
// x=50 leaves a 1-inch gap to the dresser (x 8-28) and 9 inches to the roommate's bed.
const otherDesk=desk.clone();otherDesk.position.set(50,0,123);otherDesk.rotation.y=Math.PI;scene.add(otherDesk);
const otherChair=chair.clone();otherChair.position.set(50,0,123);otherChair.rotation.y=Math.PI;scene.add(otherChair);
for(const z of [17,108]){rb(20,45,24,18,22.5,z);for(let i=0;i<5;i++)rb(.7,7.7,22,28.4,5+i*8.5,z,trim);}
// Four identical measured stools, arranged in a photo-based cluster beside the kitchen.
const stoolDimensions={width:15,depth:15,height:31};
const stools=[];
function addStool(x,z){
 const stool=new THREE.Group();stool.position.set(x,0,z);fixtures.add(stool);
 const part=(w,h,d,px,py,pz,mat=material)=>box(w,h,d,px,py,pz,mat,stool);
 part(15,1.3,15,0,30.35,0);
 for(const px of [-6.3,6.3])for(const pz of [-6.3,6.3])part(1.4,29.7,1.4,px,14.85,pz);
 // Aprons under the seat; narrow stretchers leave the center visibly open.
 for(const pz of [-6.3,6.3])part(12.6,2.2,.8,0,28.1,pz,trim);
 for(const px of [-6.3,6.3])part(.8,2.2,12.6,px,28.1,0,trim);
 for(const pz of [-6.3,6.3])part(12.6,1.2,1.1,0,8,pz,trim);
 for(const px of [-6.3,6.3])part(1.1,1.2,12.6,px,10,0,trim);
 scene.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(stool),size=bounds.getSize(new THREE.Vector3());
 if(Math.abs(size.x-15)>.01||Math.abs(size.y-31)>.01||Math.abs(size.z-15)>.01)throw new Error('Stool dimensions must be 15 × 15 × 31 inches.');
 stools.push(stool);return stool;
}
for(const [x,z] of [[172,81],[189,81],[172,99],[189,99]])addStool(x,z);
const kitchenObjects=new THREE.Group();fixtures.add(kitchenObjects);
function kb(w,h,d,x,y,z,mat=material){return box(w,h,d,x,y,z,mat,kitchenObjects);}
// Galley: cabinet/appliance dimensions remain photo-based estimates. Upper
// cabinets are split around the refrigerator; its top is 63, shelving starts
// at 74. A continuous cabinet block previously caused an actual intersection.
const upperCabinets=new THREE.Group();kitchenObjects.add(upperCabinets);
function upper(w,h,d,x,y,z,mat=cabinet){return box(w,h,d,x,y,z,mat,upperCabinets);}
// Hollow sink cabinet: a solid block would fill the recessed basin from below.
kb(1,35,92,224.5,17.5,kitchenCenterZ,cabinet);kb(1,35,92,202.5,17.5,kitchenCenterZ,cabinet);
kb(23,1,92,213.5,.5,kitchenCenterZ,cabinet);
for(const z of [kitchenStartZ+.5,kitchenEndZ-.5])kb(23,35,1,213.5,17.5,z,cabinet);
// Dimensions interpreted as length along counter, front-to-back width, basin depth.
const sinkDimensions={length:21,width:15.5,depth:9.5,endWallGap:7};
const sinkZ=kitchenEndZ-sinkDimensions.endWallGap-sinkDimensions.length/2;
const sinkX=214.75,sinkBottom=36.5-sinkDimensions.depth;
kb(5,1.5,92,204.5,35.75,kitchenCenterZ,white);kb(3.5,1.5,92,224.25,35.75,kitchenCenterZ,white);
kb(15.5,1.5,sinkZ-10.5-kitchenStartZ,sinkX,35.75,(kitchenStartZ+sinkZ-10.5)/2,white);
kb(15.5,1.5,7,sinkX,35.75,kitchenEndZ-3.5,white);
const sink=new THREE.Group();kitchenObjects.add(sink);
const sinkSteel=new THREE.MeshStandardMaterial({color:'#b4bfc6',metalness:.45,roughness:.32});
box(15.5,.2,21,sinkX,sinkBottom+.1,sinkZ,sinkSteel,sink);
for(const x of [sinkX-7.65,sinkX+7.65])box(.2,9.5,21,x,31.75,sinkZ,sinkSteel,sink);
for(const z of [sinkZ-10.4,sinkZ+10.4])box(15.5,9.5,.2,sinkX,31.75,z,sinkSteel,sink);
// A narrow rounded rim, with a real hole through the countertop.
function roundedPath(path,w,h,r){path.moveTo(-w/2+r,-h/2);path.lineTo(w/2-r,-h/2);path.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);path.lineTo(w/2,h/2-r);path.quadraticCurveTo(w/2,h/2,w/2-r,h/2);path.lineTo(-w/2+r,h/2);path.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);path.lineTo(-w/2,-h/2+r);path.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return path;}
const rimShape=roundedPath(new THREE.Shape(),15.5,21,1.1);rimShape.holes.push(roundedPath(new THREE.Path(),14.7,20.2,.85));
const sinkRim=new THREE.Mesh(new THREE.ExtrudeGeometry(rimShape,{depth:.12,bevelEnabled:false,curveSegments:12}),sinkSteel);sinkRim.rotation.x=-Math.PI/2;sinkRim.position.set(sinkX,36.38,sinkZ);sink.add(sinkRim);
const drain=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.04,32),dark);drain.position.set(sinkX,sinkBottom+.23,sinkZ);sink.add(drain);
for(let i=0;i<8;i++){const slot=box(.07,.02,.65,sinkX+Math.sin(i*Math.PI/4)*.3,sinkBottom+.26,sinkZ+Math.cos(i*Math.PI/4)*.3,silver,sink);slot.rotation.y=i*Math.PI/4;}
// The curved faucet itself is the interaction target; no overlay or UI button.
const faucet=new THREE.Group();kitchenObjects.add(faucet);
const chrome=new THREE.MeshPhysicalMaterial({color:'#d4dae0',metalness:.65,roughness:.19,clearcoat:.3});
const outlet=new THREE.Vector3(212.5,41.6,sinkZ);
const faucetCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(205,36.6,sinkZ),new THREE.Vector3(205,40.7,sinkZ),new THREE.Vector3(207,43,sinkZ),new THREE.Vector3(211.5,42.8,sinkZ),outlet]);
const faucetTube=new THREE.Mesh(new THREE.TubeGeometry(faucetCurve,48,.28,12,false),chrome);faucetTube.castShadow=true;faucet.add(faucetTube);
const faucetBase=new THREE.Mesh(new THREE.CylinderGeometry(.8,.85,.45,32),chrome);faucetBase.position.set(205,36.75,sinkZ);faucet.add(faucetBase);
const faucetHandle=new THREE.Group();faucetHandle.position.set(205.8,38,sinkZ);faucet.add(faucetHandle);box(.3,.3,2.1,0,0,.8,chrome,faucetHandle);
// Slightly larger transparent hit region makes the narrow metal spout clickable.
const faucetHit=new THREE.Mesh(new THREE.TubeGeometry(faucetCurve,32,.7,8,false),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));faucet.add(faucetHit);
const waterGroup=new THREE.Group();kitchenObjects.add(waterGroup);waterGroup.visible=false;
// Locally generated soft reflections keep transparent water legible without asset downloads.
const reflectionFaces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=64;const cx=c.getContext('2d');const g=cx.createLinearGradient(0,0,64,64);g.addColorStop(0,'#f7faff');g.addColorStop(.42,'#889ba9');g.addColorStop(.5,'#ffffff');g.addColorStop(.68,'#b2c5d0');g.addColorStop(1,i===3?'#666f78':'#e4edf0');cx.fillStyle=g;cx.fillRect(0,0,64,64);return c;});
const waterEnvironment=new THREE.CubeTexture(reflectionFaces);waterEnvironment.colorSpace=THREE.SRGBColorSpace;waterEnvironment.needsUpdate=true;
sinkSteel.envMap=waterEnvironment;sinkSteel.envMapIntensity=.4;sinkSteel.needsUpdate=true;chrome.envMap=waterEnvironment;chrome.envMapIntensity=.8;chrome.needsUpdate=true;
const waterMaterial=new THREE.MeshPhysicalMaterial({color:'#d1effa',metalness:0,roughness:.08,transparent:true,opacity:.75,transmission:.6,thickness:.16,ior:1.333,envMap:waterEnvironment,envMapIntensity:.55,clearcoat:1,depthWrite:false});
const streamHeight=outlet.y-(sinkBottom+.27),waterTime={value:0};
waterMaterial.onBeforeCompile=shader=>{shader.uniforms.waterTime=waterTime;shader.vertexShader='uniform float waterTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += 0.035 * sin(position.y * 5.5 - waterTime * 18.0); transformed.z += 0.025 * cos(position.y * 7.0 - waterTime * 23.0);');};
const stream=new THREE.Mesh(new THREE.CylinderGeometry(.14,.22,streamHeight,20,36,true),waterMaterial);stream.position.set(outlet.x,outlet.y-streamHeight/2,outlet.z);waterGroup.add(stream);
const droplets=new THREE.InstancedMesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshPhysicalMaterial({color:'#c4e8f3',transparent:true,opacity:.6,roughness:.12,envMap:waterEnvironment,metalness:.05,depthWrite:false}),32);waterGroup.add(droplets);
const rippleMat=new THREE.MeshBasicMaterial({color:'#b9e4f3',transparent:true,opacity:.3,depthWrite:false});
const ripples=[];for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.025,6,48),rippleMat.clone());ring.rotation.x=-Math.PI/2;ring.position.set(outlet.x,sinkBottom+.27+i*.005,outlet.z);waterGroup.add(ring);ripples.push(ring);}
const wetPatch=new THREE.Mesh(new THREE.CircleGeometry(1.3,48),new THREE.MeshBasicMaterial({color:'#b3d4de',transparent:true,opacity:.13,depthWrite:false}));wetPatch.rotation.x=-Math.PI/2;wetPatch.position.set(outlet.x,sinkBottom+.245,outlet.z);waterGroup.add(wetPatch);
waterGroup.traverse(obj=>{if(obj.isMesh)obj.raycast=()=>{};});
let waterOn=false,waterFrame=0;const dropTransform=new THREE.Object3D();
function updateWater(seconds){waterTime.value=seconds;for(let i=0;i<32;i++){const phase=(seconds*1.4+i/32)%1,angle=i*2.39996,spread=phase*1.1;dropTransform.position.set(outlet.x+Math.cos(angle)*spread,sinkBottom+.3+Math.sin(phase*Math.PI)*(.2+(i%4)*.19),outlet.z+Math.sin(angle)*spread);dropTransform.scale.set(.6,1.5,.6);dropTransform.updateMatrix();droplets.setMatrixAt(i,dropTransform.matrix);}droplets.instanceMatrix.needsUpdate=true;for(let i=0;i<3;i++){const phase=(seconds*1.5+i/3)%1;const scale=.16+phase*1.5;ripples[i].scale.set(scale,scale,scale);ripples[i].material.opacity=(1-phase)*.32;}}
function animateWater(now){if(!waterOn||document.hidden||laptopOpen)return;updateWater(now*.001);render();waterFrame=requestAnimationFrame(animateWater);}
function toggleFaucet(){waterOn=!waterOn;cancelAnimationFrame(waterFrame);waterGroup.visible=waterOn;faucetHandle.rotation.x=waterOn?-.5:0;updateWater(0);render();if(waterOn&&!reducedMotion()&&!document.hidden)waterFrame=requestAnimationFrame(animateWater);}
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(waterFrame);if(waterOn&&!document.hidden&&!reducedMotion()&&!laptopOpen)waterFrame=requestAnimationFrame(animateWater);});
const refrigerator=kb(29,63,25,289.5,31.5,74.5,white);
const fridgeTrim=kb(.8,.4,24,274.6,43,74.5,silver);
kb(23,35,32,292.5,17.5,103,cabinet);kb(24,1.5,32,292,35.75,103,white);
kb(26,35,26,291,17.5,132,white);kb(.6,17,19,277.6,16,132,dark);
for(const x of [285,297])for(const z of [126,137]){
const ring=new THREE.Mesh(new THREE.TorusGeometry(3,.35,6,18),dark);ring.rotation.x=Math.PI/2;ring.position.set(x,35.6,z);kitchenObjects.add(ring);
}
// Open shelf niche at the entrance end, matching the new reference photos.
upper(15,1,8,296.5,74.5,66);upper(15,1,8,296.5,93.5,66);
upper(15,20,.8,296.5,84,62.4);upper(15,20,.8,296.5,84,69.6);
const aboveFridge=upper(15,20,17,296.5,84,78.5);
const aboveCounter=upper(15,38,32,296.5,73,103);
const aboveStove=upper(15,25,26,296.5,79.5,132);
kb(18,2,26,293,66,132,white);
// Check actual geometry bounds, allowing surfaces to touch but rejecting
// positive-volume intersections. This catches the fridge/cabinet error.
scene.updateMatrixWorld(true);
const fridgeBounds=new THREE.Box3().setFromObject(refrigerator);
function overlapsVolume(a,b){return ['x','y','z'].every(axis=>Math.min(a.max[axis],b.max[axis])-Math.max(a.min[axis],b.min[axis])>.01);}
for(const neighbor of [aboveFridge,aboveCounter,aboveStove,fridgePartition]){
if(overlapsVolume(fridgeBounds,new THREE.Box3().setFromObject(neighbor)))throw new Error('Fridge intersects a cabinet or entrance partition.');
}
const actualSinkGap=kitchenEndZ-new THREE.Box3().setFromObject(sink).max.z;if(Math.abs(actualSinkGap-7)>.01)throw new Error('Sink outer edge must be 7 inches from end wall.');
const sinkSize=new THREE.Box3().setFromObject(sink).getSize(new THREE.Vector3());if(Math.abs(sinkSize.x-15.5)>.01||Math.abs(sinkSize.y-9.5)>.01||Math.abs(sinkSize.z-21)>.01)throw new Error('Sink dimensions must be 21 × 15.5 × 9.5 inches.');
console.info('Geometry check passed: fridge clears upper cabinet by '+(new THREE.Box3().setFromObject(aboveFridge).min.y-fridgeBounds.max.y)+' inches.');
// Cabinet seams help distinguish individual doors without extra photo assets.
for(const z of [75,87,97,109,119,132])upper(.3,18,.35,288.8,82,z,trim);

// Photo-based props. Dimensions are estimates; layout follows the references.
function solid(color,roughness=.8){return new THREE.MeshStandardMaterial({color,roughness});}
function ellipsoid(parent,x,y,z,a,b,c,mat){const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),mat);m.scale.set(a,b,c);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,r,h,x,y,z,mat,rt=r){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,r,h,32),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function mug(parent,x,y,z){const m=solid('#e8e5dc',.3);cylinder(parent,1.2,3,x,y+1.5,z,m);cylinder(parent,1.02,.05,x,y+3.03,z,solid('#726d61'));const handle=new THREE.Mesh(new THREE.TorusGeometry(.88,.18,8,24),m);handle.position.set(x+1.25,y+1.55,z);parent.add(handle);return m;}
const blue=solid('#182943'),cream=solid('#d4b88b'),brown=solid('#392a20'),black=solid('#0b1118');

// Revolved can profile: narrower neck/base, aluminum seams, inset lid, pull tab.
// Original procedural label inspired by the blue/silver can in the supplied photo.
const can=new THREE.Group();can.position.set(-15.5,30,-7.8);can.rotation.y=Math.PI;desk.add(can);
const canLabel=document.createElement('canvas');canLabel.width=1024;canLabel.height=1024;const cc=canLabel.getContext('2d');
cc.fillStyle='#d0d7df';cc.fillRect(0,0,1024,1024);cc.fillStyle='#134780';cc.beginPath();cc.moveTo(0,0);cc.lineTo(560,0);cc.lineTo(1024,1024);cc.lineTo(500,1024);cc.closePath();cc.fill();
cc.fillStyle='#123f74';cc.fillRect(0,0,240,1024);cc.save();cc.translate(490,650);cc.rotate(-Math.PI/2);cc.fillStyle='#eee9d9';cc.font='bold 100px Arial';cc.textAlign='center';cc.fillText('Red Bull',0,0);cc.font='32px Arial';cc.fillText('THE SEA BLUE EDITION',0,65);cc.restore();
cc.fillStyle='#e0b446';cc.beginPath();cc.arc(490,235,72,0,Math.PI*2);cc.fill();cc.fillStyle='#b93036';for(const sign of [-1,1]){cc.save();cc.translate(490+sign*46,235);cc.scale(sign,1);cc.beginPath();cc.moveTo(-10,22);cc.lineTo(55,12);cc.lineTo(72,-8);cc.lineTo(80,-22);cc.lineTo(70,-32);cc.lineTo(62,-13);cc.lineTo(10,-18);cc.lineTo(-22,-2);cc.closePath();cc.fill();cc.restore();}
cc.fillStyle='#102c4a';cc.font='22px Arial';for(let i=0;i<12;i++)cc.fillText('ENERGY DRINK · 250 ml',770,230+i*35);
const canTexture=new THREE.CanvasTexture(canLabel);canTexture.colorSpace=THREE.SRGBColorSpace;canTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
const canBodyMat=new THREE.MeshPhysicalMaterial({map:canTexture,metalness:.4,roughness:.3,clearcoat:.4});
const profile=[[.78,.12],[.89,.18],[.97,.35],[1.02,.65],[1.02,4.8],[.98,5.03],[.85,5.18],[.84,5.4]].map(([r,y])=>new THREE.Vector2(r,y));
const canBody=new THREE.Mesh(new THREE.LatheGeometry(profile,64),canBodyMat);canBody.castShadow=true;canBody.receiveShadow=true;can.add(canBody);
const aluminum=new THREE.MeshPhysicalMaterial({color:'#cbd0d5',metalness:.75,roughness:.23,clearcoat:.3});
for(const y of [.18,5.4]){const rim=new THREE.Mesh(new THREE.TorusGeometry(.85,.065,12,64),aluminum);rim.rotation.x=Math.PI/2;rim.position.y=y;can.add(rim);}
cylinder(can,.81,.06,0,5.37,0,aluminum);cylinder(can,.79,.04,0,.1,0,aluminum);
const scored=new THREE.Mesh(new THREE.TorusGeometry(.69,.012,6,48),aluminum);scored.rotation.x=Math.PI/2;scored.position.y=5.41;can.add(scored);
const opening=ellipsoid(can,0,5.415,-.3,.22,.014,.31,solid('#26313a'));
const pullTab=new THREE.Mesh(new THREE.TorusGeometry(.22,.055,8,24),aluminum);pullTab.rotation.x=Math.PI/2;pullTab.scale.y=1.6;pullTab.position.set(0,5.46,.11);can.add(pullTab);cylinder(can,.09,.04,0,5.45,.04,aluminum);
// The desk paper and reading view share the same PDF raster, not retyped text.
const resumeTexture=await new THREE.TextureLoader().loadAsync(document.getElementById('resume-image').src);resumeTexture.colorSpace=THREE.SRGBColorSpace;resumeTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
const resumePaper=new THREE.Group();resumePaper.position.set(9,30.08,5.2);resumePaper.rotation.y=-.12;desk.add(resumePaper);
box(8.5,.035,11,0,0,0,new THREE.MeshStandardMaterial({color:'#fafaf4',roughness:.95}),resumePaper);
const paperFace=new THREE.Mesh(new THREE.PlaneGeometry(8.5,11),new THREE.MeshBasicMaterial({map:resumeTexture,toneMapped:false}));paperFace.rotation.x=-Math.PI/2;paperFace.position.y=.024;resumePaper.add(paperFace);

box(3.7,5.7,2.8,-16,53.35,-7,solid('#d8c48c'));textSurface('TISSUES',3.2,1.2,-16,53.4,-5.56,desk,'#9e7552');
const tissue=new THREE.PlaneGeometry(2.5,3,5,5);for(let i=0;i<tissue.attributes.position.count;i++)tissue.attributes.position.setZ(i,.25*Math.sin(i*2));tissue.computeVertexNormals();const tissueMesh=new THREE.Mesh(tissue,new THREE.MeshStandardMaterial({color:'#faf8ed',side:THREE.DoubleSide,roughness:1}));tissueMesh.position.set(-16,56.9,-7);tissueMesh.rotation.x=-.5;desk.add(tissueMesh);
mug(desk,-9,50.5,-7);textSurface('NYU',1.7,1.6,-9,52,-5.76,desk,'#644b83');mug(desk,2,50.5,-7);
box(.25,4.3,.3,1.8,55,-7,solid('#1c7b97'));box(.35,.8,.35,1.8,57.5,-7,white);box(.9,3,.45,2.5,54.8,-7.2,solid('#9a2832'));textSurface('paste',.8,.9,2.5,55,-6.94,desk,'#fff');
// A printed band wrapped around a tub; the text is centered on the side facing the desk chair.
function wrapLabel(lines,r,h,x,y,z,color,bg){
 const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/(2*Math.PI*r));const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';
 // Text stays within the front quarter of the wrap, where the curve barely foreshortens it.
 const size=Math.min(c.height*.75/lines.length,1024*.27/(.72*Math.max(...lines.map(l=>l.length))));ctx.font=`700 ${size}px "Segoe UI",Arial,sans-serif`;lines.forEach((line,i)=>ctx.fillText(line,512,c.height/2+(i-(lines.length-1)/2)*size*1.1));
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,48,1,true,-Math.PI,2*Math.PI),new THREE.MeshStandardMaterial({map:t,roughness:.7}));m.position.set(x,y,z);desk.add(m);return m;
}
cylinder(desk,2.5,7.2,11,54.1,-7,white);cylinder(desk,2.55,.55,11,57.9,-7,solid('#629341'));wrapLabel(['PROTEIN','POWDER'],2.53,4.4,11,54.1,-7,'#3d643a','#f0efe7');
cylinder(desk,1.65,5.2,17,53.1,-7,white);cylinder(desk,1.7,.4,17,55.9,-7,black);wrapLabel(['CREATINE'],1.68,2.6,17,53.1,-7,'#303638','#efeee8');
for(let i=0;i<5;i++){const colors=['#a52b29','#d4c8aa','#24395e','#855266','#b8b4a8'];box(.7,6+(i%2),4,-16+i*.85,66+(i%2)*.5,-7,solid(colors[i]));}textSurface('KEEP CALM',.68,3,-16,66,-4.97,desk,'#f2ddad');
const monkey=new THREE.Group();desk.add(monkey);ellipsoid(monkey,15,80,-7,2.4,3.3,1.9,brown);ellipsoid(monkey,15,80,-5.5,1.65,2.3,.55,cream);ellipsoid(monkey,15,84.4,-7,2.15,2.2,1.8,brown);ellipsoid(monkey,15,84.1,-5.45,1.6,1.5,.65,cream);for(const x of [12.7,17.3]){ellipsoid(monkey,x,84.4,-7,.7,.8,.5,cream);ellipsoid(monkey,x,78.7,-6,.8,2,.8,brown);ellipsoid(monkey,x,75.8,-4.9,1.1,.65,1.6,cream);}for(const x of [14.4,15.6])ellipsoid(monkey,x,84.7,-4.84,.18,.2,.12,black);textSurface('⌣',1.2,.6,15,83.4,-4.74,monkey,'#4c3827');for(const x of [13.6,16.4])ellipsoid(monkey,x,77,-6,.8,1.5,.8,brown);
// Sink-side counter: appliances near the passage, soap and sponge by the basin.
kb(12,11,17,216,42,76,dark);kb(.2,7,12,222.1,42,74.5,black);textSurface('MICROWAVE',8,2,222.24,46,76,kitchenObjects,'#b8bdc3').rotation.y=Math.PI/2;
cylinder(kitchenObjects,2.2,6,214,39.5,91,new THREE.MeshPhysicalMaterial({color:'#cedee0',transparent:true,opacity:.55,roughness:.2,metalness:.15}));cylinder(kitchenObjects,2.3,.45,214,42.7,91,black);
cylinder(kitchenObjects,.9,3.5,205,38.3,sinkZ+13,solid('#9aba96'));kb(1.3,.2,.45,205,40.3,sinkZ+13,white);kb(2,.6,3,218,36.8,sinkZ+13,solid('#d5c359'));
for(let i=0;i<5;i++){cylinder(kitchenObjects,.75,2.5,205,37.8,94+i*2.1,solid(['#6c845d','#793529','#a89670','#87976d','#493c30'][i]));cylinder(kitchenObjects,.8,.3,205,39.2,94+i*2.1,black);}
cylinder(kitchenObjects,1.7,7,205,40,86,white);cylinder(kitchenObjects,.2,8,205,40.5,86,silver);
// Readable floor labels are orientation aids, not portfolio content.
// Cutaway and upper cabinets remain enabled for every camera preset.
const cutaway=true;
upperCabinets.visible=true;
function updateWalls(){for(const w of walls)w.mesh.visible=((camera.position.x-w.x)*w.nx+(camera.position.z-w.z)*w.nz<=0);windowGroup.visible=camera.position.x>=0;}

// A single transparent shader plane; screen-space derivatives keep grid lines fine.
const gridUniforms={minor:{value:new THREE.Color(DRAFTING_CONFIG.colors.grid)},spacing:{value:DRAFTING_CONFIG.grid.spacing},majorEvery:{value:DRAFTING_CONFIG.grid.majorEvery},minorAlpha:{value:DRAFTING_CONFIG.grid.minorAlpha},majorAlpha:{value:DRAFTING_CONFIG.grid.majorAlpha},fadeStart:{value:DRAFTING_CONFIG.grid.fadeStart},fadeEnd:{value:DRAFTING_CONFIG.grid.fadeEnd},revealFeather:{value:DRAFTING_CONFIG.grid.revealFeather},reveal:{value:0}};
const gridMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:gridUniforms,vertexShader:`varying vec2 paperPosition;void main(){paperPosition=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec2 paperPosition;uniform vec3 minor;uniform float spacing,majorEvery,minorAlpha,majorAlpha,fadeStart,fadeEnd,reveal,revealFeather;
float lines(float scale){vec2 cell=paperPosition/scale;vec2 edge=abs(fract(cell-.5)-.5)/max(fwidth(cell),vec2(.0001));return 1.0-min(min(edge.x,edge.y),1.0);}
void main(){float distanceFromCenter=length(paperPosition);float falloff=1.0-smoothstep(fadeStart,fadeEnd,distanceFromCenter);float draw=1.0-smoothstep(reveal-revealFeather,reveal+revealFeather,distanceFromCenter);float alpha=max(lines(spacing)*minorAlpha,lines(spacing*majorEvery)*majorAlpha)*falloff*draw;gl_FragColor=vec4(minor,alpha);
#include <colorspace_fragment>
}`});
const paperGrid=new THREE.Mesh(new THREE.PlaneGeometry(DRAFTING_CONFIG.grid.size,DRAFTING_CONFIG.grid.size),gridMaterial);paperGrid.rotation.x=-Math.PI/2;paperGrid.position.set(152,-1.8,75);paperGrid.userData.pickThrough=true;paperGrid.raycast=()=>{};scene.add(paperGrid);
// Bake the L-shaped footprint into a blurred alpha mask once, with transparent margins.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=DRAFTING_CONFIG.shadow.resolution;
const shadowContext=shadowCanvas.getContext('2d'),shadowPadding=DRAFTING_CONFIG.shadow.padding,shadowWidth=304+2*shadowPadding,shadowDepth=kitchenEndZ+2*shadowPadding;
shadowContext.filter=`blur(${DRAFTING_CONFIG.shadow.blur}px)`;shadowContext.fillStyle=DRAFTING_CONFIG.colors.shadow;
for(const [x,z,w,d] of [[0,0,218,kitchenStartZ],[0,kitchenStartZ,202,135-kitchenStartZ],[218,room.passageInset,86,42.5],[202,kitchenStartZ,102,92]])shadowContext.fillRect((x+shadowPadding)/shadowWidth*shadowCanvas.width,(z+shadowPadding)/shadowDepth*shadowCanvas.height,w/shadowWidth*shadowCanvas.width,d/shadowDepth*shadowCanvas.height);
const shadowTexture=new THREE.CanvasTexture(shadowCanvas);shadowTexture.colorSpace=THREE.SRGBColorSpace;
const contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(shadowWidth,shadowDepth),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,opacity:0,depthWrite:false,toneMapped:false}));contactShadow.rotation.x=-Math.PI/2;contactShadow.position.set(152,-1.3,kitchenEndZ/2);contactShadow.userData.pickThrough=true;contactShadow.raycast=()=>{};scene.add(contactShadow);
const modelRoot=new THREE.Group();scene.add(modelRoot);for(const root of [desk,chair,roomObjects,otherDesk,otherChair,lampLight,lampLight.target])modelRoot.add(root);
const materialStates=new Map();modelRoot.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(!materialStates.has(m))materialStates.set(m,{opacity:m.opacity,transparent:m.transparent});});
let introFrame=0,introDone=false,introElapsed=0,dimensionProgress=0,modelProgress=0;
const ease=t=>t*t*(3-2*t);
const phase=(time,range)=>ease(Math.max(0,Math.min(1,(time-range[0])/(range[1]-range[0]))));
const dimensionGroup=new THREE.Group();scene.add(dimensionGroup);
const dimensions=[],dimensionOverlay=document.getElementById('drawing-labels');
const dim=DRAFTING_CONFIG.dimensions;
function addDimension(start,end,amount,description){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(36),3));
 const line=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:DRAFTING_CONFIG.colors.rule,transparent:true,opacity:0,depthTest:false}));line.userData.pickThrough=true;line.raycast=()=>{};dimensionGroup.add(line);
 const label=document.createElement('span');label.className='dimension-label';label.hidden=true;label.setAttribute('aria-label',description+': approximately '+(amount*dim.inchesToMeters).toFixed(dim.precision)+' meters');dimensionOverlay.append(label);
 dimensions.push({start:new THREE.Vector3(...start),end:new THREE.Vector3(...end),amount,label,line});
}
addDimension([0,-1,room.width+dim.offset],[room.length,-1,room.width+dim.offset],room.length,'Main room length');
addDimension([-dim.offset,-1,0],[-dim.offset,-1,room.width],room.width,'Main room width');
addDimension([202,-1,kitchenEndZ+dim.offset],[304,-1,kitchenEndZ+dim.offset],room.kitchenWidth,'Kitchen width');
function updateDimensionGeometry(){for(const d of dimensions){const middle=d.start.clone().lerp(d.end,.5),a=middle.clone().lerp(d.start,dimensionProgress),b=middle.clone().lerp(d.end,dimensionProgress),axis=d.end.clone().sub(d.start).normalize(),tick=new THREE.Vector3(axis.x-axis.z,0,axis.z+axis.x).normalize().multiplyScalar(dim.tick);const vertices=[...a,...b,...a.clone().sub(tick),...a.clone().add(tick),...b.clone().sub(tick),...b.clone().add(tick)];
 // Extension lines join each measured edge to its offset dimension line.
 const normal=new THREE.Vector3(-axis.z,0,axis.x);const direction=d.start.x<0?-1:d.start.z<0?1:-1;const extension=normal.multiplyScalar(dim.offset*direction);
 vertices.push(...d.start,...d.start.clone().add(extension),...d.end,...d.end.clone().add(extension));d.line.geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));d.line.geometry.computeBoundingSphere();d.line.material.opacity=dimensionProgress;}}
function updateDimensionLabels(){const show=['angle','front','custom'].includes(currentView)&&!moving;dimensionGroup.visible=show;for(const d of dimensions){const point=d.start.clone().lerp(d.end,.5).project(camera);d.label.hidden=!show||dimensionProgress===0||Math.abs(point.x)>.97||Math.abs(point.y)>.94||point.z>1;d.label.textContent=(d.amount*dim.inchesToMeters*dimensionProgress).toFixed(dim.precision)+' m';d.label.style.left=(point.x*.5+.5)*stage.clientWidth+'px';d.label.style.top=((-point.y*.5+.5)*stage.clientHeight+dim.labelOffset)+'px';d.label.style.opacity=dimensionProgress;}}
function applyIntro(time){introElapsed=time;gridUniforms.reveal.value=phase(time,DRAFTING_CONFIG.intro.grid)*(DRAFTING_CONFIG.grid.fadeEnd+DRAFTING_CONFIG.grid.revealOverscan);dimensionProgress=phase(time,DRAFTING_CONFIG.intro.dimensions);modelProgress=phase(time,DRAFTING_CONFIG.intro.room);modelRoot.visible=modelProgress>0;modelRoot.position.y=-(1-modelProgress)*DRAFTING_CONFIG.intro.rise;contactShadow.material.opacity=modelProgress*DRAFTING_CONFIG.shadow.opacity;
 for(const [material,original] of materialStates){const transparent=modelProgress<1||original.transparent;if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}material.opacity=original.opacity*modelProgress;}
 updateDimensionGeometry();}
let welcomed=false;
function finishIntro(){cancelAnimationFrame(introFrame);introDone=true;stage.dataset.intro='complete';applyIntro(DRAFTING_CONFIG.intro.duration);if(welcomed)showCaption();else{welcomed=true;showCaption(DRAFTING_CONFIG.interaction.welcomeCaption,DRAFTING_CONFIG.interaction.welcomeMs);}noteInput();}
function startDraftingIntro(){if(reducedMotion()){finishIntro();render();return;}stage.dataset.intro='running';const started=performance.now();function frame(now){applyIntro(Math.min(now-started,DRAFTING_CONFIG.intro.duration));if(now-started>=DRAFTING_CONFIG.intro.duration)finishIntro();render();if(!introDone)introFrame=requestAnimationFrame(frame);}introFrame=requestAnimationFrame(frame);}
let parallaxFrame=0,parallaxTime=0;const parallax={x:0,y:0,targetX:0,targetY:0};
function resetParallax(){cancelAnimationFrame(parallaxFrame);parallaxFrame=0;parallax.x=parallax.y=parallax.targetX=parallax.targetY=0;}
function dampParallax(now){parallaxFrame=0;if(document.hidden||laptopOpen||reducedMotion()||!introDone||moving)return;const k=1-Math.exp(-DRAFTING_CONFIG.parallax.damping*Math.min(.05,(now-parallaxTime)/1000));parallaxTime=now;parallax.x+=(parallax.targetX-parallax.x)*k;parallax.y+=(parallax.targetY-parallax.y)*k;render();if(Math.abs(parallax.targetX-parallax.x)+Math.abs(parallax.targetY-parallax.y)>DRAFTING_CONFIG.parallax.epsilon)parallaxFrame=requestAnimationFrame(dampParallax);}
function requestParallax(){if(!parallaxFrame){parallaxTime=performance.now();parallaxFrame=requestAnimationFrame(dampParallax);}}
// Overview sway: a slow side-to-side orbit added to yaw. Any input freezes it in place; it eases back in after idleMs.
const sway={offset:0,phase:0,rate:0,last:0,frame:0,timer:0,hovering:false,lastInput:0};
function swayAllowed(){return DRAFTING_CONFIG.sway.enabled&&introDone&&currentView==='angle'&&!moving&&!pointer&&!sway.hovering&&!laptopOpen&&!resumeOpen&&!document.hidden&&!reducedMotion();}
function stopSway(){clearTimeout(sway.timer);cancelAnimationFrame(sway.frame);sway.timer=sway.frame=sway.last=0;sway.rate=0;}
function scheduleSway(){stopSway();if(swayAllowed())sway.timer=setTimeout(()=>sway.frame=requestAnimationFrame(swayTick),Math.max(0,sway.lastInput+DRAFTING_CONFIG.sway.idleMs-performance.now()));}
function noteInput(){sway.lastInput=performance.now();scheduleSway();}
function swayTick(now){sway.frame=0;if(!swayAllowed())return;const cfg=DRAFTING_CONFIG.sway,dt=sway.last?Math.min(.1,(now-sway.last)/1000):0;sway.last=now;sway.rate=Math.min(1,sway.rate+dt/cfg.rampSeconds);sway.phase=(sway.phase+dt*sway.rate*2*Math.PI/cfg.periodSeconds)%(2*Math.PI);sway.offset=cfg.amplitude*Math.sin(sway.phase);render();sway.timer=setTimeout(()=>sway.frame=requestAnimationFrame(swayTick),1000/cfg.maxFps);}
// Folds the sway into yaw so camera moves and drags start from where the camera actually is.
function bakeSway(){yaw+=sway.offset;sway.offset=sway.phase=0;}
motionPreference.addEventListener('change',()=>{resetParallax();if(motionPreference.matches){finishIntro();cancelAnimationFrame(waterFrame);}else if(waterOn)waterFrame=requestAnimationFrame(animateWater);scheduleSway();render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetParallax();scheduleSway();});

let target=new THREE.Vector3(150,12,70),yaw=0.55,pitch=0.85,radius=600;
function render(){if(document.hidden||laptopOpen)return;document.body.dataset.roomView=currentView;camera.position.set(target.x+radius*Math.sin(yaw+sway.offset+parallax.x)*Math.cos(pitch+parallax.y),target.y+radius*Math.sin(pitch+parallax.y),target.z+radius*Math.cos(yaw+sway.offset+parallax.x)*Math.cos(pitch+parallax.y));camera.lookAt(target);updateBackControl();updateWalls();renderer.render(scene,camera);updateHotspots();updateDimensionLabels();}
function fittedRadius(value){return value*Math.max(1,DRAFTING_CONFIG.camera.mobileFitAspect/camera.aspect);}
function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;if(['angle','front','desk'].includes(currentView))radius=fittedRadius(presets[currentView].radius);camera.updateProjectionMatrix();render();}window.addEventListener('resize',resize);
const presets={stools:{yaw:-2.3,pitch:.55,radius:92,target:[183,18,94],fov:48},resume:{yaw:0,pitch:1.48,radius:25,target:[163.75,30.1,17.2],fov:40},details:{yaw:-.15,pitch:.2,radius:130,target:[154.75,48,10]},angle:{yaw:.55,pitch:.85,radius:600,target:[150,12,70]},front:{yaw:0,pitch:Math.PI/2-.001,radius:560,target:[156,0,73]},side:{yaw:Math.PI/2,pitch:.2,radius:48,target:[215,38,119],fov:65},fridge:{yaw:-.45,pitch:.18,radius:145,target:[284,47,80]},desk:{yaw:0,pitch:.27,radius:29,target:[149.75,34,12]},bed:{yaw:-Math.PI/2,pitch:.15,radius:60,target:[130,34,19.5]},otherBed:lookFrom([125,52,104],[152,40,10],50)};
// A preset from where a seated person's eyes are to what they're looking at.
function lookFrom(eye,look,fov){const d=new THREE.Vector3(...eye).sub(new THREE.Vector3(...look)),r=d.length();return {yaw:Math.atan2(d.x,d.z),pitch:Math.asin(d.y/r),radius:r,target:look,fov};}
let animation=0,moving=false,currentView='angle';
const hint=document.querySelector('.hint');let captionTimer=0,captionHideTimer=0;
const defaultCaption='Click around. Most things in here do something.';
const viewCaptions={angle:defaultCaption,front:'The floor plan. Click an object to explore.',desk:'You’re at your desk. Click the laptop to open LiuOS.',bed:'You’re on your bed. Drag to look around.',otherBed:'Your roommate’s bed. Drag to look around.',side:'You’re in the kitchen. Drag to look around.',fridge:'The fridge. Drag to look around.',stools:'Four stools beside the kitchen.',details:'Your shelves and desk. Click the lamp or laptop.',resume:'Your resume, up close.',zoom:'A closer look. Click outside the room to step back.'};
function hideCaption(){clearTimeout(captionTimer);clearTimeout(captionHideTimer);hint.classList.remove('caption-visible');captionHideTimer=setTimeout(()=>hint.hidden=true,reducedMotion()?0:250);}
function showCaption(message=defaultCaption,duration=DRAFTING_CONFIG.interaction.captionMs){hideCaption();clearTimeout(captionHideTimer);hint.hidden=false;hint.textContent=message;hint.classList.add('caption-visible');captionTimer=setTimeout(hideCaption,duration);}

const hotspotPositions={desk:[154.75,39,25],laptop:[149.75,38.1,12.35],resume:[163.75,31,17.2]};
const hotspotButtons=[...document.querySelectorAll('[data-destination]')];
const leaders=new Map(),leaderSvg=document.getElementById('callout-lines');
for(const button of hotspotButtons){const name=button.dataset.destination,[title]=DRAFTING_CONFIG.callouts[name],action=button.textContent;button.replaceChildren();const heading=document.createElement('span'),detail=document.createElement('span');heading.className='callout-title';heading.textContent=title;detail.className='callout-action';detail.textContent=action;button.append(heading,detail);const line=document.createElementNS('http://www.w3.org/2000/svg','polyline'),dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','2');leaderSvg.append(line,dot);leaders.set(name,{line,dot});}
function updateHotspots(){
for(const [index,button] of hotspotButtons.entries()){
const name=button.dataset.destination,leader=leaders.get(name);if(name==='laptop')button.querySelector('.callout-action').textContent=laptopScreenPowered?'Open laptop':'Turn on laptop';
const available=(!moving||name==='laptop')&&modelProgress===1&&(name==='laptop'?currentView==='desk':name==='resume'?['angle','front','custom','zoom','desk','details'].includes(currentView):['angle','front','custom','zoom'].includes(currentView));
button.hidden=!available;button.disabled=!introDone;leader.line.style.display=leader.dot.style.display=available?'':'none';if(!available)continue;
const point=new THREE.Vector3(...hotspotPositions[name]).project(camera);
if(point.z>1||point.z< -1||Math.abs(point.x)>.95||Math.abs(point.y)>.95){button.hidden=true;leader.line.style.display=leader.dot.style.display='none';continue;}
let x=(point.x*.5+.5)*stage.clientWidth,y=(-point.y*.5+.5)*stage.clientHeight,small=stage.clientWidth<500,offset=small?[null,...DRAFTING_CONFIG.mobileCallouts[name]]:DRAFTING_CONFIG.callouts[name],lx=Math.max(52,Math.min(stage.clientWidth-52,x+offset[1])),ly=Math.max(165,Math.min(stage.clientHeight-(small?180:100),y+offset[2]));
if(name==='laptop'){
 // Project the actual glass bounds so the label never sits over screen content.
 const corners=[[-6.4,-3.35],[6.4,-3.35],[-6.4,3.35],[6.4,3.35]].map(([cx,cy])=>screenFace.localToWorld(new THREE.Vector3(cx,cy,0)).project(camera));
 const minX=Math.min(...corners.map(p=>(p.x*.5+.5)*stage.clientWidth)),maxX=Math.max(...corners.map(p=>(p.x*.5+.5)*stage.clientWidth)),minY=Math.min(...corners.map(p=>(-p.y*.5+.5)*stage.clientHeight)),maxY=Math.max(...corners.map(p=>(-p.y*.5+.5)*stage.clientHeight));
 const half=button.offsetWidth/2,gap=LIUOS_CONFIG.screen.calloutGap;
 if(maxX+gap+button.offsetWidth<stage.clientWidth-12){lx=maxX+gap+half;ly=(minY+maxY)/2;x=maxX;y=ly;}
 else if(minX-gap-button.offsetWidth>12){lx=minX-gap-half;ly=(minY+maxY)/2;x=minX;y=ly;}
 else{lx=Math.max(half+12,Math.min(stage.clientWidth-half-12,(minX+maxX)/2));ly=Math.max(button.offsetHeight/2+12,minY-gap-button.offsetHeight/2);x=(minX+maxX)/2;y=minY;}
}
const opacity=introDone?1:phase(introElapsed,[DRAFTING_CONFIG.intro.callouts[0]+index*DRAFTING_CONFIG.intro.calloutStagger,DRAFTING_CONFIG.intro.callouts[1]+index*DRAFTING_CONFIG.intro.calloutEndStagger]);button.style.opacity=opacity;leader.line.style.opacity=leader.dot.style.opacity=opacity;button.style.left=lx+'px';button.style.top=ly+'px';leader.line.setAttribute('points',name==='laptop'?`${x},${y} ${Math.abs(ly-y)>10?lx:lx+(lx>x?-1:1)*button.offsetWidth/2},${Math.abs(ly-y)>10?ly+button.offsetHeight/2:ly}`:`${x},${y} ${lx},${ly+18} ${lx+36},${ly+18}`);leader.dot.setAttribute('cx',x);leader.dot.setAttribute('cy',y);
}
}
const closeupViews=new Set(['desk','bed','otherBed','side','fridge','stools','details','zoom']);
let closeupView=null,firstCloseupSeen=false,zoomExitDelta=0,lastZoomOut=0;
const backToRoom=document.getElementById('back-to-room');
function isCloseup(){return closeupView!==null;}
function updateBackControl(){backToRoom.hidden=!isCloseup()||laptopOpen||resumeOpen;}
function returnToRoom(){if(laptopOpen||resumeOpen)return;activate('angle');}
backToRoom.addEventListener('click',returnToRoom);
function arrivalCaption(view){if(closeupViews.has(view)&&!firstCloseupSeen){firstCloseupSeen=true;return DRAFTING_CONFIG.interaction.firstCloseupHint;}return viewCaptions[view]||defaultCaption;}
let cameraMove=null,queuedCameraAction=null;
function cancelCameraMove(){cancelAnimationFrame(animation);animation=0;cameraMove=null;queuedCameraAction=null;if(moving)currentView='custom';moving=false;showCaption();announceView('custom');}

function navigate(view,onArrive){
if(!introDone)finishIntro();resetParallax();stopSway();bakeSway();

cancelCameraMove();currentView=view;closeupView=closeupViews.has(view)?view:null;zoomExitDelta=0;lastZoomOut=0;moving=true;const move=cameraMove={onArrive};clearHighlight();
announceView(view);
const p=presets[view],start={yaw,pitch,radius,fov:camera.fov,target:target.clone()},destination=new THREE.Vector3(...p.target),time=performance.now();
hideCaption();
const reduced=reducedMotion();
function tick(now){if(cameraMove!==move)return;const t=reduced?1:Math.min((now-time)/900,1);const k=t*t*(3-2*t);yaw=start.yaw+(p.yaw-start.yaw)*k;pitch=start.pitch+(p.pitch-start.pitch)*k;radius=start.radius+((['angle','front','desk'].includes(view)?fittedRadius(p.radius):p.radius)-start.radius)*k;camera.fov=start.fov+((p.fov||38)-start.fov)*k;camera.updateProjectionMatrix();target.lerpVectors(start.target,destination,k);if(t===1){moving=false;showCaption(arrivalCaption(view));noteInput();}render();if(t<1)animation=requestAnimationFrame(tick);else{const callback=move.onArrive,action=queuedCameraAction;cameraMove=null;queuedCameraAction=null;animation=0;if(callback)callback();if(action)activate(action);}}animation=requestAnimationFrame(tick);
}
// Requests from the nav (room:go). The room owns the camera, so it decides how to get there.
const announceView=view=>document.dispatchEvent(new CustomEvent('room:view',{detail:{view}}));
document.addEventListener('room:go',({detail:{view}})=>{if(laptopOpen)document.dispatchEvent(new CustomEvent('laptop:close'));if(resumeOpen)document.dispatchEvent(new CustomEvent('resume:close'));navigate(view);});
function screenHover(active){screenFace.material.color.setScalar(active?LIUOS_CONFIG.screen.hoverBrightness:LIUOS_CONFIG.screen.brightness);}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&moving&&!laptopOpen&&!resumeOpen){event.preventDefault();cancelCameraMove();pointer=null;render();}});

// Clicking the résumé paper zooms the camera in on it, then opens the résumé viewer.
// Closing it always goes back to the shelves view ("details"), where the desk is in view.
let resumeReturnFocus=null;
function openResume(opener=document.activeElement){if(moving||resumeOpen)return;resumeReturnFocus=opener;navigate('resume',()=>document.dispatchEvent(new CustomEvent('resume:open')));}
document.addEventListener('resume:opened',()=>{resumeOpen=true;updateBackControl();});
document.addEventListener('resume:closed',()=>{resumeOpen=false;navigate('details',()=>{if(resumeReturnFocus instanceof HTMLElement&&resumeReturnFocus.isConnected)resumeReturnFocus.focus({preventScroll:true});});});
// The room asks LiuOS to open only when the camera is at the desk.
function requestLaptop(opener=document.activeElement){if(currentView!=='desk'||moving)return;document.dispatchEvent(new CustomEvent('laptop:open',{detail:{opener}}));}
document.addEventListener('laptop:opened',()=>{laptopOpen=true;updateBackControl();cancelAnimationFrame(waterFrame);resetParallax();});
document.addEventListener('laptop:closed',()=>{laptopOpen=false;render();if(waterOn&&!document.hidden&&!reducedMotion())waterFrame=requestAnimationFrame(animateWater);});
// LiuOS paints its own screen picture; the room only displays it on the 3D laptop.
let screenTexture=null;
document.addEventListener('laptop:screen',({detail})=>{laptopScreenPowered=detail.powered;if(!screenTexture){screenTexture=new THREE.CanvasTexture(detail.canvas);screenTexture.colorSpace=THREE.SRGBColorSpace;screenTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();screenTexture.minFilter=THREE.LinearMipmapLinearFilter;screenTexture.magFilter=THREE.LinearFilter;screenFace.material.map=screenTexture;screenFace.material.needsUpdate=true;}else if(detail.redrawn)screenTexture.needsUpdate=true;render();});
function activate(view){if(view==='lamp'){toggleLamp();return;}if(moving){queuedCameraAction=view;return;}if(view==='faucet')toggleFaucet();else if(view==='laptop')requestLaptop();else if(view==='resume')openResume();else navigate(view);}
hotspotButtons.forEach(button=>button.addEventListener('click',()=>{if(button.dataset.destination==='desk'){navigate('desk');return;}activate(button.dataset.destination);}));
// Hold the sway still while a label is under the pointer or focused, so it's easy to click.
hotspotButtons.forEach(button=>{for(const [event,hovering] of [['pointerenter',true],['focus',true],['pointerleave',false],['blur',false]])button.addEventListener(event,()=>{sway.hovering=hovering;noteInput();});});
// Mesh picking keeps navigation discoverable without extra room controls.
const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
const hoverOutline=new THREE.Box3Helper(new THREE.Box3(),DRAFTING_CONFIG.interaction.hoverColor);hoverOutline.material.transparent=true;hoverOutline.material.opacity=DRAFTING_CONFIG.interaction.hoverOpacity;hoverOutline.material.depthWrite=false;hoverOutline.visible=false;hoverOutline.userData.pickThrough=true;hoverOutline.raycast=()=>{};scene.add(hoverOutline);
function clearHighlight(){hoverOutline.visible=false;stage.style.cursor='grab';screenHover(false);}
function firstHit(event){const bounds=stage.getBoundingClientRect();mouse.set((event.clientX-bounds.left)/bounds.width*2-1,1-(event.clientY-bounds.top)/bounds.height*2);raycaster.setFromCamera(mouse,camera);
return raycaster.intersectObjects([modelRoot],true).find(h=>{let node=h.object;while(node){if(node.visible===false||node.userData?.pickThrough)return false;node=node.parent;}return true;})||null;}
function pick(event,hit=firstHit(event)){if(!hit)return null;
if(DRAFTING_CONFIG.interaction.debugPicking&&event.type==='pointerup')console.debug('Room pick',hit.object.name,hit.object.geometry?.type);let obj=hit.object;while(obj){
if(lampMeshes.includes(obj))return {view:'lamp',root:obj};
if(obj===faucet)return {view:'faucet',root:faucet};
if(obj===resumePaper)return {view:'resume',root:resumePaper};
if([laptopBase,screen,screenFace,keys].includes(obj))return {view:currentView==='desk'?'laptop':'desk',root:obj};
if(obj===refrigerator||obj===fridgeTrim)return {view:'fridge',root:refrigerator};
if(stools.includes(obj))return {view:'stools',root:obj};
if(obj===yourBed)return {view:'bed',root:obj};
if(obj===otherBed)return {view:'otherBed',root:obj};
if(obj.parent===desk){if(deskFurniture.has(obj))return isCloseup()?null:{view:'desk',root:obj};return {view:'details',root:obj};}
if(obj.parent===kitchenObjects||obj===kitchenObjects)return {view:'side',root:obj===kitchenObjects?hit.object:obj};
obj=obj.parent;
}return null;
}
function toggleLamp(){lampOn=!lampOn;cancelAnimationFrame(lampFadeFrame);const from=lampLight.intensity,to=lampOn?1800:0,started=performance.now();lampLight.visible=true;function frame(now){const t=reducedMotion()?1:Math.min(1,(now-started)/DRAFTING_CONFIG.interaction.lampFadeMs),k=t*t*(3-2*t);lampLight.intensity=from+(to-from)*k;emitterMat.emissiveIntensity=lampLight.intensity/900;if(t===1)lampLight.visible=lampOn;render();if(t<1)lampFadeFrame=requestAnimationFrame(frame);}lampFadeFrame=requestAnimationFrame(frame);}
let pointer=null;
stage.addEventListener('pointerdown',event=>{if(!introDone){finishIntro();render();return;}resetParallax();noteInput();pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,started:performance.now(),dragged:false};stage.setPointerCapture(event.pointerId);});
stage.addEventListener('pointermove',event=>{
if(!pointer){if(event.pointerType==='touch'){clearHighlight();return;}if(moving||!introDone)return;if(event.pointerType==='mouse'&&currentView==='angle'&&DRAFTING_CONFIG.parallax.enabled&&!reducedMotion()&&matchMedia('(hover: hover) and (pointer: fine)').matches){parallax.targetX=(event.clientX/stage.clientWidth-.5)*2*DRAFTING_CONFIG.parallax.yaw;parallax.targetY=(event.clientY/stage.clientHeight-.5)*2*DRAFTING_CONFIG.parallax.pitch;requestParallax();}const selected=pick(event);clearHighlight();if(selected){if(selected.view==='laptop')screenHover(true);stage.style.cursor='pointer';hoverOutline.box.setFromObject(selected.root);hoverOutline.visible=true;}render();return;}
if(pointer.id!==event.pointerId)return;
if(Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)<DRAFTING_CONFIG.interaction.clickPixels&&!pointer.dragged)return;
if(!pointer.dragged){bakeSway();cancelCameraMove();}pointer.dragged=true;currentView='custom';clearHighlight();yaw-=(event.clientX-pointer.x)*.007;pitch=Math.max(-.1,Math.min(1.569,pitch+(event.clientY-pointer.y)*.007));pointer.x=event.clientX;pointer.y=event.clientY;announceView('custom');render();
});
stage.addEventListener('pointerup',event=>{const click=pointer&&pointer.id===event.pointerId&&!pointer.dragged&&Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)<DRAFTING_CONFIG.interaction.clickPixels&&performance.now()-pointer.started<DRAFTING_CONFIG.interaction.clickMs;pointer=null;noteInput();if(click&&!laptopOpen){const hit=firstHit(event),selected=pick(event,hit);if(selected){renderer.domElement.focus({preventScroll:true});activate(selected.view);}else if(hit)zoomInto(hit.point);else if(currentView!=='angle')returnToRoom();}});
// Clicking empty space inside the room moves in closer on that spot. Close-ups switch to the
// overview's angle; otherwise the current angle is kept.
function zoomInto(point){if(laptopOpen||resumeOpen)return;const keep=!closeupView||closeupView==='zoom',a=presets.angle;
presets.zoom={yaw:keep?yaw+sway.offset:a.yaw,pitch:keep?pitch:a.pitch,radius:fittedRadius(a.radius)/DRAFTING_CONFIG.interaction.clickZoom,target:[point.x,Math.min(point.y,40),point.z]};
if(moving){queuedCameraAction='zoom';return;}navigate('zoom');}
for(const event of ['pointercancel','lostpointercapture'])stage.addEventListener(event,()=>{pointer=null;noteInput();});
stage.addEventListener('pointerleave',()=>{parallax.targetX=parallax.targetY=0;requestParallax();clearHighlight();render();});
function zoomRoom(event){event.preventDefault();noteInput();if(moving||laptopOpen)return;const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?stage.clientHeight:1),now=performance.now();
if(isCloseup()){const cfg=DRAFTING_CONFIG.interaction,base=closeupView==='desk'?fittedRadius(presets[closeupView].radius):presets[closeupView].radius,limit=base*cfg.zoomLimitRatio,next=radius*Math.exp(delta*.001);
if(delta>0&&next>=limit){if(now-lastZoomOut>cfg.zoomExitWindowMs)zoomExitDelta=0;zoomExitDelta+=delta;lastZoomOut=now;if(zoomExitDelta>=cfg.zoomExitDelta){returnToRoom();return;}}else zoomExitDelta=0;
cancelCameraMove();radius=Math.max(18,Math.min(limit,next));render();return;}
cancelCameraMove();radius=Math.max(18,Math.min(DRAFTING_CONFIG.camera.maxRadius,radius*Math.exp(delta*.001)));render();}
stage.addEventListener('wheel',zoomRoom,{passive:false});
renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();status.textContent='Graphics connection lost. Reload this page to restore the model.';status.hidden=false;});
screenHover(false);document.dispatchEvent(new CustomEvent('laptop:screen-request'));applyIntro(0);resize();status.hidden=true;startDraftingIntro();
window.deskStudy={measured,estimated,room,scene,camera,renderer,refrigerator,aboveFridge,aboveCounter,aboveStove,fridgePartition};
}catch(error){status.hidden=false;status.textContent='The 3D view could not load. Check your internet connection and WebGL support, then reload. ';console.error(error);}
