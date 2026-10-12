// Wallpaper module contract: mount(host), setState({visible,covered,alternate}), dispose().
// Replace this module independently to introduce another wallpaper.
// Drafting paper: the site's paper gradient with a slowly drifting ruled grid; `alternate` switches to graph paper.
export function createWallpaper(THREE,config,motionPreference,colors){
 const renderer=new THREE.WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power'});
 renderer.setPixelRatio(1);renderer.domElement.className='os-wallpaper-canvas';renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.Camera();
 const rgb=value=>new THREE.Color(value).convertLinearToSRGB();
 // The drift wraps at this many CSS px; it must be a multiple of every grid cell size in the shader.
 const driftWrap=600;
 const uniforms={uTime:{value:0},uCursor:{value:new THREE.Vector2()},uSize:{value:new THREE.Vector2(1,1)},uPx:{value:1},uAlternate:{value:0},uBase:{value:rgb(colors.base)},uEdge:{value:rgb(colors.paperEdge)},uRule:{value:rgb(colors.border)}};
 const material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,toneMapped:false,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`precision highp float;
 varying vec2 vUv;uniform float uTime,uPx,uAlternate;uniform vec2 uCursor,uSize;uniform vec3 uBase,uEdge,uRule;
 float lines(vec2 pos,float cell){vec2 d=abs(fract(pos/cell+.5)-.5)*cell;return 1.-smoothstep(0.,uPx,min(d.x,d.y));}
 void main(){
  float r=length((vUv-vec2(.48,.57))/vec2(.52,.57))*.7071;
  vec3 color=mix(uBase,uEdge,clamp((r-.2)/.8,0.,1.));
  vec2 pos=(vUv+uCursor)*uSize+vec2(uTime,uTime*.6);
  float plain=lines(pos,24.)*.22;
  float graph=max(lines(pos,12.)*.12,lines(pos,60.)*.34);
  color=mix(color,uRule,mix(plain,graph,uAlternate));
  gl_FragColor=vec4(color,1.);
 }`});
 const geometry=new THREE.PlaneGeometry(2,2);scene.add(new THREE.Mesh(geometry,material));
 let host=null,visible=false,covered=false,disposed=false,contextLost=false,frame=0,timer=0,last=0,elapsed=0;const cursor=new THREE.Vector2();
 function cancel(){clearTimeout(timer);cancelAnimationFrame(frame);timer=frame=0;last=0;}
 function draw(){if(host&&!disposed)renderer.render(scene,camera);}
 function schedule(){timer=setTimeout(()=>{frame=requestAnimationFrame(tick);},1000/Math.max(1,Math.min(30,config.maxFps)));}
 function tick(now){timer=frame=0;if(!canAnimate())return;const delta=last?Math.min(.1,(now-last)/1000):0;last=now;elapsed+=delta;uniforms.uTime.value=(elapsed*config.speed)%driftWrap;uniforms.uCursor.value.lerp(cursor,1-Math.exp(-config.cursorDamping*delta));draw();schedule();}
 function canAnimate(){return host&&visible&&!covered&&!document.hidden&&!motionPreference.matches&&!disposed&&!contextLost;}
 function refresh(){cancel();if(!host||!visible||document.hidden||contextLost)return;if(motionPreference.matches){uniforms.uTime.value=0;uniforms.uCursor.value.set(0,0);}draw();if(canAnimate())schedule();renderer.domElement.dataset.motion=motionPreference.matches?'static':covered?'paused':'running';}
 function resize(){if(!host||!host.clientWidth||!host.clientHeight)return;const w=host.clientWidth,h=host.clientHeight,scale=config.resolution*Math.min(devicePixelRatio,config.pixelRatioCap);renderer.setSize(Math.max(1,Math.round(w*scale)),Math.max(1,Math.round(h*scale)),false);uniforms.uSize.value.set(w,h);uniforms.uPx.value=1/scale;refresh();}
 function move(event){if(event.pointerType!=='mouse'||motionPreference.matches)return;const r=host.getBoundingClientRect();cursor.set((event.clientX-r.left)/r.width-.5,.5-(event.clientY-r.top)/r.height).multiplyScalar(config.cursorStrength);}
 function leave(){cursor.set(0,0);}
 const observer=new ResizeObserver(resize);
 function mount(next){if(host===next)return;if(host){host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);observer.unobserve(host);}host=next;host.prepend(renderer.domElement);host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);observer.observe(host);cursor.set(0,0);resize();}
 document.addEventListener('visibilitychange',refresh);motionPreference.addEventListener('change',refresh);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;cancel();renderer.domElement.style.display='none';});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;renderer.domElement.style.display='';resize();});
 return {mount,setState(state){visible=state.visible;covered=state.covered;uniforms.uAlternate.value=state.alternate?1:0;refresh();},dispose(){disposed=true;cancel();observer.disconnect();document.removeEventListener('visibilitychange',refresh);motionPreference.removeEventListener('change',refresh);if(host){host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);}geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();}};
}
