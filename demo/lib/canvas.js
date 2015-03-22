// file: lib/canvas.js
//
// Copyright (c) 2011-2015 Mark Warren
//
// See the COPYRIGHT file in the bwip.js root directory
// for the extended copyright notice.

// Dynamically load the script.  Each script has a built-in callback into the
// BWIPJS object.
BWIPJS.load = function(path) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = path;
	document.head.appendChild(script);
};

BWIPJS.print = function(s) {
	var div = document.getElementById('output');
	if (div)
		div.innerHTML += s.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '<br>';
};

// Encapsulate the bitmap interface
function Bitmap() {
	var clr  = [0, 0, 0];
	var pts  = [];
	var minx = 0;	// min-x
	var miny = 0;	// min-y
	var maxx = 0;	// max-x
	var maxy = 0;	// max-y

	this.color = function(r, g, b) {
		clr = [r, g, b];
	}

	// a is the alpha-level of the pixel [0 .. 255]
	this.set = function(x,y,a) {
		x = Math.floor(x);
		y = Math.floor(y);
		pts.push([ x, y, clr, a ]);
		if (minx > x) minx = x;
		if (miny > y) miny = y;
		if (maxx < x) maxx = x;
		if (maxy < y) maxy = y;
	}

	this.show = function(cvsid, rot) {
		var cvs = document.getElementById(cvsid);
		if (pts.length == 0) {
			cvs.width  = 32;
			cvs.height = 32;
			cvs.getContext('2d').clearRect(0, 0, cvs.width, cvs.height);
			cvs.style.visibility = 'visible';
			return;
		}

		if (rot == 'R' || rot == 'L') {
			var h = maxx-minx+1;
			var w = maxy-miny+1;
		} else {
			var w = maxx-minx+1;
			var h = maxy-miny+1;
		}

		cvs.width  = w;
		cvs.height = h;

		var ctx = cvs.getContext('2d');
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, cvs.width, cvs.height);
		ctx.fillStyle = '#000';

		var id  = ctx.getImageData(0, 0, cvs.width, cvs.height);
		var dat = id.data;

		for (var i = 0; i < pts.length; i++) {
			// PostScript builds bottom-up, we build top-down.
			var x = pts[i][0] - minx;
			var y = pts[i][1] - miny;
			var c = pts[i][2];
			var a = pts[i][3];

			if (rot == 'N') {
				y = h - y - 1; 	// Invert y
			} else if (rot == 'I') {
				x = w - x - 1;	// Invert x
			} else {
				y = w - y; 	// Invert y
				if (rot == 'L') {
					var t = y;
					y = h - x - 1;
					x = t - 1;
				} else {
					var t = x;
					x = w - y;
					y = t;
				}
			}

			var idx = (y * id.width + x) * 4
			dat[idx++] = c[0] ;	// r
			dat[idx++] = c[1];	// g
			dat[idx++] = c[2];	// b
			dat[idx]   = a;
		}
		ctx.putImageData(id, 0, 0);
		cvs.style.visibility = 'visible';
	}
}