// Wallpaper module contract: mount(host), setState({visible,covered,alternate}), dispose().
// Replace this module independently to introduce another wallpaper.
export function createWallpaper(THREE,config,motionPreference,colors){
 const renderer=new THREE.WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power'});
 renderer.setPixelRatio(1);renderer.domElement.className='os-wallpaper-canvas';renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.Camera();
 const rgb=value=>new THREE.Color(value).convertLinearToSRGB();
 const uniforms={uTime:{value:0},uCursor:{value:new THREE.Vector2()},uAspect:{value:1},uAlternate:{value:0},uBase:{value:rgb(colors.base)},uBlue:{value:rgb(colors.border)},uTeal:{value:rgb(colors.paperEdge)}};
 const material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,toneMapped:false,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`precision mediump float;
 varying vec2 vUv;uniform float uTime,uAspect,uAlternate;uniform vec2 uCursor;uniform vec3 uBase,uBlue,uTeal;
 float blob(vec2 p,vec2 center,float spread){vec2 delta=p-center;delta.x*=uAspect;return exp(-dot(delta,delta)/spread);}
 void main(){
  vec2 p=vUv+uCursor;
  vec2 a=vec2(.18+.11*sin(uTime*.63),.73+.12*cos(uTime*.48));
  vec2 b=vec2(.79+.10*cos(uTime*.51),.24+.11*sin(uTime*.57));
  vec2 c=vec2(.5+.13*sin(uTime*.37),.45+.12*cos(uTime*.31));
  float blue=blob(p,a,.48),teal=blob(p,b,.55),haze=blob(p,c,.65);
  vec3 first=mix(uBlue,uTeal,uAlternate),second=mix(uTeal,uBlue,uAlternate);
  vec3 color=mix(uBase,first,blue*.77);color=mix(color,second,teal*.58);
  color=mix(color,(first+second)*.5,haze*.12);
  color*=1.-.10*dot(vUv-.5,vUv-.5);
  gl_FragColor=vec4(color,1.);
 }`});
 const geometry=new THREE.PlaneGeometry(2,2);scene.add(new THREE.Mesh(geometry,material));
 let host=null,visible=false,covered=false,disposed=false,contextLost=false,frame=0,timer=0,last=0,elapsed=0;const cursor=new THREE.Vector2();
 function cancel(){clearTimeout(timer);cancelAnimationFrame(frame);timer=frame=0;last=0;}
 function draw(){if(host&&!disposed)renderer.render(scene,camera);}
 function schedule(){timer=setTimeout(()=>{frame=requestAnimationFrame(tick);},1000/Math.max(1,Math.min(30,config.maxFps)));}
 function tick(now){timer=frame=0;if(!canAnimate())return;const delta=last?Math.min(.1,(now-last)/1000):0;last=now;elapsed+=delta;uniforms.uTime.value=elapsed*config.speed;uniforms.uCursor.value.lerp(cursor,1-Math.exp(-config.cursorDamping*delta));draw();schedule();}
 function canAnimate(){return host&&visible&&!covered&&!document.hidden&&!motionPreference.matches&&!disposed&&!contextLost;}
 function refresh(){cancel();if(!host||!visible||document.hidden||contextLost)return;if(motionPreference.matches){uniforms.uTime.value=0;uniforms.uCursor.value.set(0,0);}draw();if(canAnimate())schedule();renderer.domElement.dataset.motion=motionPreference.matches?'static':covered?'paused':'running';}
 function resize(){if(!host||!host.clientWidth||!host.clientHeight)return;const w=host.clientWidth,h=host.clientHeight,scale=config.resolution*Math.min(devicePixelRatio,config.pixelRatioCap);renderer.setSize(Math.max(1,Math.round(w*scale)),Math.max(1,Math.round(h*scale)),false);uniforms.uAspect.value=w/h;refresh();}
 function move(event){if(event.pointerType!=='mouse'||motionPreference.matches)return;const r=host.getBoundingClientRect();cursor.set((event.clientX-r.left)/r.width-.5,.5-(event.clientY-r.top)/r.height).multiplyScalar(config.cursorStrength);}
 function leave(){cursor.set(0,0);}
 const observer=new ResizeObserver(resize);
 function mount(next){if(host===next)return;if(host){host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);observer.unobserve(host);}host=next;host.prepend(renderer.domElement);host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);observer.observe(host);cursor.set(0,0);resize();}
 document.addEventListener('visibilitychange',refresh);motionPreference.addEventListener('change',refresh);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;cancel();renderer.domElement.style.display='none';});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;renderer.domElement.style.display='';resize();});
 return {mount,setState(state){visible=state.visible;covered=state.covered;uniforms.uAlternate.value=state.alternate?1:0;refresh();},dispose(){disposed=true;cancel();observer.disconnect();document.removeEventListener('visibilitychange',refresh);motionPreference.removeEventListener('change',refresh);if(host){host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);}geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();}};
}
