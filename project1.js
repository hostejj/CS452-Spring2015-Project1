var gl;
var points = [];
var colors = [];
var shipCent = [0,0] // holds the position of the center of the ship;
var shipSpeed = 0.04;
var bulletSpeed = 0.01;
var alienSpeed = 0.002;
var mvMatrix;
var mvMatrixL;

var forw = true; //if forward shooting bullets are active
var gameOn = false;

var score = 0;
var health = 10;
var levelCount = 0;

var maxBullets = 3;
var fBulletList = [];
var lBulletList = [];
var rBulletList = [];

var wAliens = [];
var sAliens = [];
var alienChance = 0.005;
var strChance = 0.33;
var diffIncC = 0.002;
var diffIncS = 0.0005;
var diffIncStr = 0.03;

var basicColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 1.0, 1.0, 1.0, 1.0 ],  // white
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
	[ 0.7, 0.7, 0.7, 1.0 ],  //light gray
	[ 0.3, 0.3, 0.3, 1.0 ],   //dark gray
	[ 1.0, 0.5, 0.0, 1.0 ] //orange
];

var ship = [
	vec2( 2 ,10 ),
	vec2( 7 , 0 ),
	vec2( 2 , 0 ),
	vec2(-2 ,10 ),
	vec2(-7 , 0 ),
	vec2(-2 , 0 ),
	vec2( 2 ,12 ),
	vec2( 2 ,-1 ),
	vec2(-2 ,-1 ),
	vec2( 2 ,12 ),
	vec2(-2 ,-1 ),
	vec2(-2 ,12 ),
	vec2( 2 , 3 ),
	vec2( 7 , 0 ),
	vec2( 2 , 0 ),
	vec2(-2 , 3 ),
	vec2(-7 , 0 ),
	vec2(-2 , 0 ),
	vec2(-1 ,-1 ),
	vec2( 0 ,-2 ),
	vec2( 1 ,-1 ),
	vec2(-2 ,12 ),
	vec2( 0 ,14 ),
	vec2( 2 ,12 )
];

var bullet = [
	vec2(-0.5,15),
	vec2(-0.5,16),
	vec2(0.5,15),
	vec2(0.5,15),
	vec2(-0.5,16),
	vec2(0.5,16)
];
var sideXmod = 0.06;
var sideYmod = 0.1;

var scoreLine = [
	vec2(-100, -80),
	vec2(100, -80),
	vec2(100, -82),
	vec2(-100, -80),
	vec2(-100,-82),
	vec2(100, -82)
];

var alien = [
	vec2(-6,-6),
	vec2(6,-6),
	vec2(6,6),
	vec2(-6,-6),
	vec2(-6,6),
	vec2(6,6)
];
var aXdist = 0.14; //width of the alien
var aYdist = 0.12; //height of the alien
var collXmod = 0.07; //width modifier to detect bullet collision
var collYmod = 0.20; //height modifier to detect bullet collision

window.onload = function init(){
	var canvas = document.getElementById( "gl-canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }
	
	document.getElementById("scorel").innerHTML = score;
	
	//configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	
	// Load shaders and initialize attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	drawScoreLine();
	drawShip();
	drawBullet();
	drawAliens();
	
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
    mvMatrixL = gl.getUniformLocation( program, "mvMatrix" );					
	
	render();	
	
			//event listeners for keyboard 
	window.onkeydown = function(event) {
		var key = String.fromCharCode(event.keyCode);
		switch (key) {			
			case "W":
				// move up
				shipCent[0] += shipSpeed;
				if(shipCent[0] > 0.85){
					shipCent[0] = 0.85;
				}
				break;
			case "A":
				//move left
				shipCent[1] -= shipSpeed;
				if(shipCent[1] < -0.9){
					shipCent[1] = -0.9;
				}
				break;
			case "S":
				//move down
				shipCent[0] -= shipSpeed;
				if(shipCent[0] < -0.95){
					shipCent[0] = -0.95;
				}
				break;
			case "D":
				//move right
				shipCent[1] += shipSpeed;
				if(shipCent[1] > 0.9){
					shipCent[1] = 0.9;
				}
				break;
			case "L":
				if(forw){
					if(fBulletList.length > maxBullets){ 
						fBulletList.splice(0,1);
					}
					fBulletList.push(vec2(shipCent[0],shipCent[1]));
				} else {
					if(lBulletList.length > maxBullets){ 
						lBulletList.splice(0,1);
					}
					if(rBulletList.length > maxBullets){ 
						rBulletList.splice(0,1);
					}
					lBulletList.push(vec2((shipCent[0] - sideYmod),(shipCent[1] + sideXmod)));
					rBulletList.push(vec2((shipCent[0] - sideYmod),(shipCent[1] - sideXmod)));
				}
				break;
			case "T":
				// toggle bullet direction
				if(forw){
					forw = false;
				} else {
					forw = true;
				}
				break;	
		}
	};
};

function drawScoreLine(){
    for ( var i = 0; i < 6; i++ ) {
		points.push(scoreLine[i]);
		colors.push(basicColors[2]);
	}
}

function drawBullet(){
	for ( var i = 0; i < bullet.length; i++ ) {
		points.push(bullet[i]);
		colors.push(basicColors[6]);
	}
}

function updateAliens(){
	for ( var i = 0; i < wAliens.length; i++ ){
		wAliens[i][0] -= alienSpeed;
		if(wAliens[i][0] < -0.9){
			wAliens.splice(i, 1);
			health--;
		}
	}
	for ( var i = 0; i < sAliens.length; i++ ){
		sAliens[i][0] -= alienSpeed;
		if(sAliens[i][0] < -0.9){
			sAliens.splice(i, 1);
			health--;
			health--;
		}
	}
}

function updateBullets(){
	for ( var i = 0; i < fBulletList.length; i++ ){
		fBulletList[i][0] += bulletSpeed;
		if(fBulletList[i][0] > 1){
			fBulletList.splice(i, 1);
		}
	}
	
	for ( var i = 0; i < lBulletList.length; i++ ){
		lBulletList[i][1] += bulletSpeed;
		if(lBulletList[i][1] > 1){
			lBulletList.splice(i, 1);
		}
	}
	
	for ( var i = 0; i < rBulletList.length; i++ ){
		rBulletList[i][1] -= bulletSpeed;
		if(rBulletList[i][1] < -1){
			rBulletList.splice(i, 1);
		}
	}
}

function drawShip(){
    for ( var i = 0; i < 6; i++ ) {
		points.push(ship[i]);
		colors.push(basicColors[8]);
	}
	
	for ( var i = 6; i < 12; i++ ) {
		points.push(ship[i]);
		colors.push(basicColors[9]);
	}
	
	for ( var i = 12; i < 18; i++ ) {
		points.push(ship[i]);
		colors.push(basicColors[4]);
	}
	
	for ( var i = 18; i < 21; i++ ) {
		points.push(ship[i]);
		colors.push(basicColors[1]);
	}
	
	for ( var i = 21; i < 24; i++ ) {
		points.push(ship[i]);
		colors.push(basicColors[10]);
	}
}

function drawAliens(){
	for ( var i = 0; i < alien.length; i++ ) {
		points.push(alien[i]);
		colors.push(basicColors[3]);
	}
	for ( var i = 0; i < alien.length; i++ ) {
		points.push(alien[i]);
		colors.push(basicColors[5]);
	}
}

function makeAliens(){
	if(Math.random() < alienChance){
		var horz = (Math.random()*1.8)-0.9;
		if(Math.random() < strChance){
			sAliens.push(vec2(0.99,horz));
		} else {
			wAliens.push(vec2(0.99,horz));
		}
	}	
}

function checkCollisions(){
	//check each alien
	for ( var i = 0; i < wAliens.length; i++ ){
		//check each bullet in the forward bullet list
		for( var j = 0; j < fBulletList.length; j++ ){
			//check all four sides
			if((fBulletList[j][0] + collYmod) > wAliens[i][0] ){
				if((fBulletList[j][0] + collYmod) < (wAliens[i][0] + aYdist)){
					if((fBulletList[j][1] + collXmod) > wAliens[i][1]){
						if((fBulletList[j][1] + collXmod) < (wAliens[i][1] + aXdist)){
							wAliens.splice(i,1);
							fBulletList.splice(j,1);
							score++;
							levelCount++;
							break;
						}
					}
				}
			}
		}
	}
	//check each alien
	for ( var i = 0; i < wAliens.length; i++ ){
		//check each bullet in the leftward bullet list
		for( var j = 0; j < lBulletList.length; j++ ){
			//check all four sides
			if((lBulletList[j][0] + collYmod) > wAliens[i][0] ){
				if((lBulletList[j][0] + collYmod) < (wAliens[i][0] + aYdist)){
					if((lBulletList[j][1] + collXmod) > wAliens[i][1]){
						if((lBulletList[j][1] + collXmod) < (wAliens[i][1] + aXdist)){
							wAliens.splice(i,1);
							lBulletList.splice(j,1);
							score++;
							levelCount++;
							break;
						}
					}
				}
			}
		}
	}
	//check each alien
	for ( var i = 0; i < wAliens.length; i++ ){
		//check each bullet in the rightward bullet list
		for( var j = 0; j < rBulletList.length; j++ ){
			//check all four sides
			if((rBulletList[j][0] + collYmod) > wAliens[i][0] ){
				if((rBulletList[j][0] + collYmod) < (wAliens[i][0] + aYdist)){
					if((rBulletList[j][1] + collXmod) > wAliens[i][1]){
						if((rBulletList[j][1] + collXmod) < (wAliens[i][1] + aXdist)){
							wAliens.splice(i,1);
							rBulletList.splice(j,1);
							score++;
							levelCount++;
							break;
						}
					}
				}
			}
		}
	}
	
	//check each alien
	for ( var i = 0; i < sAliens.length; i++ ){
		//check each bullet in the forward bullet list
		for( var j = 0; j < fBulletList.length; j++ ){
			//check all four sides
			if((fBulletList[j][0] + collYmod) > sAliens[i][0] ){
				if((fBulletList[j][0] + collYmod) < (sAliens[i][0] + aYdist)){
					if((fBulletList[j][1] + collXmod) > sAliens[i][1]){
						if((fBulletList[j][1] + collXmod) < (sAliens[i][1] + aXdist)){
							wAliens.push(vec2(sAliens[i][0],sAliens[i][1]));
							sAliens.splice(i,1);
							fBulletList.splice(j,1);
							score++;
							levelCount++;
							break;
						}
					}
				}
			}
		}
	}
	//check each alien
	for ( var i = 0; i < sAliens.length; i++ ){
		//check each bullet in the leftward bullet list
		for( var j = 0; j < lBulletList.length; j++ ){
			//check all four sides
			if((lBulletList[j][0] + collYmod) > sAliens[i][0] ){
				if((lBulletList[j][0] + collYmod) < (sAliens[i][0] + aYdist)){
					if((lBulletList[j][1] + collXmod) > sAliens[i][1]){
						if((lBulletList[j][1] + collXmod) < (sAliens[i][1] + aXdist)){
							wAliens.push(vec2(sAliens[i][0],sAliens[i][1]));
							sAliens.splice(i,1);
							lBulletList.splice(j,1);
							score++;
							levelCount++;
							break;
						}
					}
				}
			}
		}
	}
	//check each alien
	for ( var i = 0; i < sAliens.length; i++ ){
		//check each bullet in the rightward bullet list
		for( var j = 0; j < rBulletList.length; j++ ){
			//check all four sides
			if((rBulletList[j][0] + collYmod) > sAliens[i][0] ){
				if((rBulletList[j][0] + collYmod) < (sAliens[i][0] + aYdist)){
					if((rBulletList[j][1] + collXmod) > sAliens[i][1]){
						if((rBulletList[j][1] + collXmod) < (sAliens[i][1] + aXdist)){
							wAliens.push(vec2(sAliens[i][0],sAliens[i][1]));
							sAliens.splice(i,1);
							rBulletList.splice(j,1);
							score++;
							levelCount++;
							break;
						}
					}
				}
			}
		}
	}
}

function updateStatus(){
	document.getElementById("scorel").innerHTML = score;	
	document.getElementById("healthl").innerHTML = health;	
	if(levelCount > 15){
		levelCount = 0;
		alienChance += diffIncC;
		alienSpeed += diffIncS;
		strChance += diffIncStr;
	}
	if(health < 0){
		alert("Game Over. Score = " + score);
		resetG();
	}
}

function resetG(){
	score = 0;
	health = 10;
	alienChance = 0.005;
	alienSpeed = 0.002;
	strChance = 0.33;
	wAliens = [];
	sAliens = [];
	fBulletList = [];
	lBulletList = [];
	rBulletList = [];
	gameOn = false;
}

function startG(){
	resetG();
	gameOn = true;
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
	mvMatrix = mat4(vec4(0.01, 0.0, 0.0, 0.0),
					vec4(0.0, 0.01, 0.0, 0.0),
					vec4(0.0, 0.0, 1.0, 0.0),
					vec4(0.0, 0.0, 0.0, 1.0)); 
					
	gl.uniformMatrix4fv( mvMatrixL, false, flatten(mvMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, scoreLine.length );
						
	mvMatrix = mat4(vec4(0.01, 0.0, 0.0, shipCent[1]),
					vec4(0.0, 0.01, 0.0, shipCent[0]),
					vec4(0.0, 0.0, 1.0, 0.0),
					vec4(0.0, 0.0, 0.0, 1.0));
					
	gl.uniformMatrix4fv( mvMatrixL, false, flatten(mvMatrix) );
    gl.drawArrays( gl.TRIANGLES, scoreLine.length, ship.length );

	for( var i = 0; i < fBulletList.length; i++ ){
		mvMatrix = mat4(vec4(0.01, 0.0, 0.0, fBulletList[i][1]),
						vec4(0.0, 0.01, 0.0, fBulletList[i][0]),
						vec4(0.0, 0.0, 1.0, 0.0),
						vec4(0.0, 0.0, 0.0, 1.0)); 
					
		gl.uniformMatrix4fv( mvMatrixL, false, flatten(mvMatrix) );
		gl.drawArrays( gl.TRIANGLES, (scoreLine.length + ship.length), bullet.length );
	}
	
	for( var i = 0; i < lBulletList.length; i++ ){
		mvMatrix = mat4(vec4(0.01, 0.0, 0.0, lBulletList[i][1]),
						vec4(0.0, 0.01, 0.0, lBulletList[i][0]),
						vec4(0.0, 0.0, 1.0, 0.0),
						vec4(0.0, 0.0, 0.0, 1.0)); 
					
		gl.uniformMatrix4fv( mvMatrixL, false, flatten(mvMatrix) );
		gl.drawArrays( gl.TRIANGLES, (scoreLine.length + ship.length), bullet.length );
	}
	
	for( var i = 0; i < rBulletList.length; i++ ){
		mvMatrix = mat4(vec4(0.01, 0.0, 0.0, rBulletList[i][1]),
						vec4(0.0, 0.01, 0.0, rBulletList[i][0]),
						vec4(0.0, 0.0, 1.0, 0.0),
						vec4(0.0, 0.0, 0.0, 1.0)); 
					
		gl.uniformMatrix4fv( mvMatrixL, false, flatten(mvMatrix) );
		gl.drawArrays( gl.TRIANGLES, (scoreLine.length + ship.length), bullet.length );
	}
	
	for( var i = 0; i < wAliens.length; i++ ){
		mvMatrix = mat4(vec4(0.01, 0.0, 0.0, wAliens[i][1]),
					vec4(0.0, 0.01, 0.0, wAliens[i][0]),
					vec4(0.0, 0.0, 1.0, 0.0),
					vec4(0.0, 0.0, 0.0, 1.0)); 
					
		gl.uniformMatrix4fv( mvMatrixL, false, flatten(mvMatrix) );
		gl.drawArrays( gl.TRIANGLES, (scoreLine.length + ship.length + bullet.length), alien.length );
	}
	
	for( var i = 0; i < sAliens.length; i++ ){
		mvMatrix = mat4(vec4(0.01, 0.0, 0.0, sAliens[i][1]),
					vec4(0.0, 0.01, 0.0, sAliens[i][0]),
					vec4(0.0, 0.0, 1.0, 0.0),
					vec4(0.0, 0.0, 0.0, 1.0)); 
					
		gl.uniformMatrix4fv( mvMatrixL, false, flatten(mvMatrix) );
		gl.drawArrays( gl.TRIANGLES, (scoreLine.length + ship.length + bullet.length + alien.length), alien.length );
	}
	
	updateBullets();
	
	if(gameOn){
		makeAliens();
		updateAliens();
		checkCollisions();
		updateStatus();
	}
	requestAnimFrame(render);
}
