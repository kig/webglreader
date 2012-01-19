window.onload = function() {
  var renderer = new THREE.WebGLRenderer({antialias: true});
  document.body.appendChild(renderer.domElement);

  var camera = new THREE.PerspectiveCamera(45,1,1,10000);
  camera.setLens(35);

  window.onresize = function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  window.onresize();

  var radius = 60;

  var scene = new THREE.Scene();
  camera.position.z = radius;
  scene.add(camera);

  var light = new THREE.PointLight(0xffffff);
  light.position.x = 100;
  light.position.z = 100;
  light.position.y = 100;
  scene.add(light);

  var fsz = 16;
  var tsz = 16;
  var c = document.createElement('canvas');
  c.width = c.height = fsz*tsz;
  var ctx = c.getContext('2d');
  ctx.font = fsz+'px Monospace';
  var i=0;

  for (var y=0; y<tsz; y++) {
    for (var x=0; x<tsz; x++,i++) {
      var ch = String.fromCharCode(i);
      ctx.fillText(ch, x*fsz, -(8/32)*fsz+(y+1)*fsz);
    }
  }
  
  var tex = new THREE.Texture(c);
  tex.needsUpdate = true;
  
  var mat = new THREE.MeshBasicMaterial({map: tex});
  mat.transparent = true;

  var geo = new THREE.Geometry();
  var str = BOOK;

  var j=0, ln=0;

  for (i=0; i<str.length; i++) {
    var code = str.charCodeAt(i);
    var cx = code % tsz;
    var cy = Math.floor(code / tsz);
    var v,t;
    geo.vertices.push(new THREE.Vertex(new THREE.Vector3( j*1.1+0.05, ln*1.1+0.05, 0 )));
    geo.vertices.push(new THREE.Vertex(new THREE.Vector3( j*1.1+1.05, ln*1.1+0.05, 0 )));
    geo.vertices.push(new THREE.Vertex(new THREE.Vector3( j*1.1+1.05, ln*1.1+1.05, 0 )));
    geo.vertices.push(new THREE.Vertex(new THREE.Vector3( j*1.1+0.05, ln*1.1+1.05, 0 )));
    var face = new THREE.Face4(i*4+0, i*4+1, i*4+2, i*4+3);
    geo.faces.push(face);
    var ox=cx/tsz, oy=cy/tsz, off=1/tsz;
    var sz = tsz*fsz;
    geo.faceVertexUvs[0].push([
      new THREE.UV( ox, oy+off ),
      new THREE.UV( ox+off, oy+off ),
      new THREE.UV( ox+off, oy ),
      new THREE.UV( ox, oy )
    ]);
    if (code == 10) {
      ln--;
      j=0;
    } else {
      j++;
    }
  }

  var top = new THREE.Object3D();

  var width = window.innerWidth,
      height = window.innerHeight;

  var uniforms = {
    time : { type: "f", value: 1.0 },
    size : { type: "v2", value: new THREE.Vector2(width,height) },
    map : { type: "t", value: 1, texture: tex },
    effectAmount : { type: "f", value: 0.0 },
    DRM : { type: "f", value: 0.0 },
    SOPA : { type: "f", value: 0.0 }
  };
  
  var shaderMaterial = new THREE.ShaderMaterial({
    uniforms : uniforms,
    vertexShader : document.querySelector('#vertex').textContent,
    fragmentShader : document.querySelector('#fragment').textContent
  });
  shaderMaterial.depthTest = false;

  var titleQuad = new THREE.Mesh(
    geo,
    shaderMaterial
  );
  titleQuad.doubleSided = true;
  top.add(titleQuad);
//  top.position.y = -40;

  scene.add(top);

  camera.position.y = 40;
  camera.lookAt(scene.position);

  var down = false;
  var sx = 0, sy = 0;
  window.onmousedown = function (ev){
    if (ev.target == renderer.domElement) {
      down = true;
      sx = ev.clientX;
      sy = ev.clientY;
    }
  };
  window.onmouseup = function(){ down = false; };
  var angle=Math.PI/2;
  window.onmousemove = function(ev) {
    if (down) {
      var dx = ev.clientX - sx;
      var dy = ev.clientY - sy;
      angle += dx/100;
      camera.position.x = Math.cos(angle)*radius;
      camera.position.y += dy*0.2;
      camera.position.z = Math.sin(angle)*radius;
      camera.lookAt(scene.position);
      sx += dx;
      sy += dy;
    }
  };

  var gui = new dat.GUI();
  var control = {
    effectAmount: 0,
    DRM: 0,
    SOPA: 0
  };
  gui.add(control, 'effectAmount', 0, 100);
  gui.add(control, 'DRM', 0, 100);
  gui.add(control, 'SOPA', 0, 100);
  
  var animate = function(t) {
    uniforms.time.value += 0.05;
    uniforms.effectAmount.value = control.effectAmount/100;
    uniforms.DRM.value = control.DRM;
    uniforms.SOPA.value = control.SOPA/100;
//    top.rotation.y -= 0.01;
    top.position.y += 0.03;
    renderer.render(scene, camera);
    requestAnimationFrame(animate, renderer.domElement);
  };
  animate(+new Date);
};
