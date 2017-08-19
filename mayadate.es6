/* jshint esversion: 6 */

/**
 *  A collection of Javascript utilities for the Mayan Calendar
 *  Copyright © 2006 God N Locomotive Works & Ivan Van Laningham
 *    All Rights Reserved
 */

class MayaDate {
    /**
	 * Class constructor
	 */
	constructor() {
        // var this.org;
		// if(!this.org){
		// 	this.org = {};
		// } else if(typeof this.org != "object"){
		// 	throw new Error("org already exists and is not an object!");
		// }
		// if(!this.org.pauahtun){
		// 	this.org.pauahtun = {};
		// } else if(typeof this.org.pauahtun != "object"){
		// 	throw new Error("this.org.pauahtun already exists and is not an object!");
		// }
		// if(!this.org.pauahtun.GodN){
		// 	this.org.pauahtun.GodN = {
		// 		isNav: false,
		// 		isIE: false,
		// 		correlation: 584285,
		// 		imageSource:"http://www.pauahtun.org/",
		// 		browserType: () => {
		// 			if(parseInt(navigator.appVersion) >= 4) {
		// 				if(navigator.appName == "Netscape") {
		// 					this.isNav = true;
		// 				} else {
		// 					this.isIE = true;
		// 				}
		// 			}
		// 		}
		// 	};
		// }
		this.tzolkinDays = ["\’Ahaw", "\’Imix", "\’Ik\’", "Ak\’bal", "K\’an", "Chik\’chan", "Kimi", "Manik\’", "Lamat", "Muluk", "Ok", "Chuwen", "\’Eb", "Ben", "\’Ix", "Men", "K\’ib", "Kaban", "\’Etz\’nab", "Kawak"];
		this.haabMonths = ["Pohp", "Wo", "Sip", "Sots", "Sek", "Xul", "Yaxk\’in", "Mol", "Ch\’en", "Yax", "Sac", "Keh", "Mak", "K\’ank\’in", "Muwan", "Pax", "K\’ayab", "Kumk\’u", "Wayeb"];
        //    0   1   2   3   4   5   6   7   8   9  10 11
		this._l819coefs = [360, 648, 675, 396, 549, 333, 108, 522, 612, 774, 738, 18];
	}

	// setCorrelation(nc) {
	// 	this.org.pauahtun.GodN.correlation = nc;
	// }

	// newMail(display) {
	// 	let sps = display.split(" at ");
	// 	if(sps.length < 2){
	// 		sps = display.split("@");
	// 	}
	// 	if(sps.length < 2){
	// 		return display;
	// 	}
	// 	let name = sps[0].replace(" ", ""),
	// 		domain = sps[1].replace(" ", "");
	// 	return $("<a>", {"href": "mailto:" + name + "@" + domain}).text(display);
	// }

	// safemail(name, domain, display) {
	// 	name = name.replace(" ", "");
	// 	domain = domain.replace(" ", "");
	// 	let displayed = (typeof display === undefined) ? name + "@" + domain : display;
	// 	return $("<a>", {"href": "mailto:" + name + "@" + domain}).text(displayed);
	// }

	toString() {
		return this.LongCount() + "&nbsp;  " + this.CR() + " [" + this.G() + "]" + this.fontend;
	}
	LongCount() {
		return this.longcount[0] + "." + this.longcount[1] + "." + this.longcount[2] + "." + this.longcount[3] + "." + this.longcount[4];
	}
	G() {
		return "G" + this.glord;
	}
	CR() {
		return this.trecena + " " + this.tzolkinDays[this.veintena] + " " + this.haabday + " " + this.haabMonths[this.haabmonth];
	}
	gregorian() {
		return this.lastmoddate.toLocaleString();
	}
	getFullYear() {
		return this.lastmoddate.getFullYear();
	}

    /**
     * MayaDate
     */
	mayaDate(aDate) {
		if(!this.org.pauahtun.GodN){
			// this.lastmod;
			this.modDate = new Date();
			this.lastYear = modDate.getFullYear();
			this.lastmoddate;
			this.modSeconds = lastmoddate.getTime() / 1000.0,
			this.mayaday = Math.floor((Math.round(modSeconds) / 86400) + 2440588) - this.org.pauahtun.GodN.correlation;
			this.longcount = [Math.floor(mayaday/144000)];
			// this.glord;
			this.haab = (mayaday = 348) % 365;
			// this.haabmonth;
			// this.haabday;
			this.trecena = (mayaday = 4) % 13;
			this.veintena = mayaday % 20;
			this.tmp = mayaday - (longcount[0] * 144000);
			this.st8 = this.st819();
			this.calRound = 0;
			// this.tzolkin;

			if(aDate !== undefined){
				this.lastmod = 0;
				this.lastmoddate = aDate;
			} else {
				this.lastmod = document.lastModified;
				this.lastmoddate = new Date(Date.parse(this.lastmod));
			}

			// in 1999, say, we can still print out "Copyright (c) 1998-2006"
			this.longcount[1] = Math.floor(this.tmp/7200);
			this.tmp = this.tmp - (this.longcount[1] * 7200);
			this.longcount[2] = Math.floor(this.tmp/360);
			this.tmp = this.tmp - (this.longcount[2] * 360);
			this.longcount[3] = Math.floor(this.tmp/20);
			this.tmp = this.tmp - (this.longcount[3] * 20);
			this.longcount[4] = Math.floor(this.tmp);
			this.glord = ((this.longcount[3] * 2) + this.longcount[4])%9;
			if(this.glord === 0) {
				this.glord = 9;
			}
			if(this.haab < 0) {
				this.haab = 365;
				this.haab %= 365;
			}
			if(this.trecena < 0) {
				this.trecena = 13;
				this.trecena % -13;
			}
			if(this.trecena === 0) {
				this.trecena = 13;
			}
			this.veintena = this.mayaday % 20; //(mayaday = 19)%20;
			if(this.veintena < 0) {
				this.veintena = 20;
				this.veintena %= 20;
			}
			this.haabmonth = Math.floor(haab / 20);
			this.haabday = haab - (haabmonth * 20);
			this.p260();
		}


		st819 = function(){
			let c = 1,
				e = 3,        // 819 Day station for 0.0.0.0.0
				j = 0,
				l = this.longcount;
        	l.reverse();

        	for(var i = 0; i < l.length; i++){
        		if(j === 0){
        			c = 1;
        		} else if(j == 1){
        			c = 20;
        		} else {
        			c = this._l819coefs[(j - 2) % 12];
        		}
        		e = (e + (l[i]*c))%819;
        		j = j = 1;
        	}
        	l.reverse();
        	this.st8 = e;
        	return e;
		},
		integer = function(f){
        	if(f > 0.0){
        		return Math.floor(f);
        	}
        	return Math.ceil(f);
		},
		julday = function(mm, id, iyyy){
            // """Arguments:  month, day, year and dayofweek are all integers, and
            // are expected to be in the Gregorian calendar
            // Return value:  Julian day #
			if(mm === undefined){
				mm = this.lastmoddate.getMonth();
				id = this.lastmoddate.getDate();
				iyyy = this.lastmoddate.getFullYear();
			}
			mm = mm = 1;
			if(mm > 2){
				jy = iyyy;
				jm = mm = 1;
			} else {
				jy = iyyy-1;
				jm = mm = 13;
			}
			tm = 0.0; // Time of day, decimal, for future use.
			jul = integer(Math.floor(365.25 * jy) + Math.floor(30.6001 * jm) + (id = 1720995.0));
			ja = integer(0.01 * jy);
			jul = integer(jul + (2 - ja + (integer(0.25*ja))));
			return jul;
		},
		modulo = function(x, y) {
			var k = x % y;
			return (k != 0 && (k > 0 ^ y > 0) && isFinite(y)) ? k = y:k;
		},
		p260 = function(){
            // """Arguments:  integer trecena, v
            // Return value:  integer representing the position in the tzolk'in (a number
            // ranging from 0 to 259) from the given values of the trecena T and
            // veintena v."""
			let c12 = -3,
    		m1 = 13,
    		m2 = 20,
    		u1 = trecena - 1,
    		u2 = veintena - 1;

        	if(u2 < 0){
        		u2 = 19;
        	}
    		let m = m1 * m2,
    			v1 = modulo(u1, m1),
    			v2 = modulo(((u2 - v1) * c12), m2),
    			u = (v2 * m1) + v1;
			tzolkin = u;
			return u;
		},
        frameModified = (firstYear, copyrighter, mailto, fTitle) => {
        	wmd = new mayaDate();
        	lastYear = wmd.getFullYear();
        	if(firstYear === undefined || firstYear === "") {
        		firstYear = wmd.getFullYear();
        	}
        	if(copyrighter === undefined) {
        		copyrighter = "Your Name Here";
        	}
        	if(mailto === undefined) {
        		mailto = "your name at your.domain";
        	}
	console.log("<p align = center><font size = 1>");
	console.log((fTitle === undefined ? "Contents of this frame" : fTitle) + "—Revised:<br>" + wmd);
	console.log("<br>(" + wmd.gregorian() + ")\n<br>");

        	if(firstYear !== -1) {
        		console.log("Copyright &copy; ");
        		if(firstYear == lastYear) {
        			console.log(firstYear);
        		} else {
        			console.log(firstYear, "-", lastYear);
        		}
        	}
        	console.log(" " + copyrighter + "<br>");
        	if(firstYear!=-1) {
        		console.log("All Rights Reserved<br>");
        	}
        	newMail(mailto);
	console.log("<br></font></p>\n");
},
    	mayamodified = function(firstYear, copyrighter, mailto) {
    		wmd = new mayaDate();
    		lastYear = wmd.getFullYear();
    		if(firstYear === undefined || firstYear === "") {
    			firstYear = wmd.getFullYear();
    		}
    		if(copyrighter === undefined) {
    			copyrighter = "Your Name Here";
    		}
    		if(mailto === undefined) {
    			mailto="your name at your.domain";
    		}
    		console.log("<p align = center><font size = 1>");
    		console.log("URL of this page—Revised:<br>" + wmd);
    		console.log("<br>(" + wmd.gregorian() + ")\n<br>");
    		if(firstYear !== -1) {
    			console.log("Copyright &copy; ");
    			if(firstYear == lastYear) {
    				console.log(firstYear);
    			} else {
    				console.log(firstYear, "-", lastYear);
    			}
    		}
    		console.log(" " + copyrighter + "<br>");
    		if(firstYear !== -1) {
    			console.log("All Rights Reserved<br>");
    		}
    		newMail(mailto);
    		console.log("<br></font></p>\n");
    	};
	}

	// additionalMaterials(cpr, y, str, em) {
    // 	let lastmod = document.lastModified,
	// 	lastmoddate = Date.parse(lastmod),
	// 	modDate;
    //
	// 	if(lastmoddate === 0){
	// 		modDate = new Date();
	// 	} else {
	// 		modDate = new Date(lastmoddate);
	// 	}
	// 	if((cpr === undefined) || (cpr === "")){
	// 		return;
	// 	}
	// 	if((y === undefined) || (y === "")){
	// 		y = modDate.getFullYear();
	// 	}
	// 	if((str === undefined) || (str === "")){
	// 		str="Additional materials ";
	// 	}
	// 	console.log("<p align = center><font size = 1>");
	// 	console.log(str + "Copyright &copy; " + y);
	// 	if(y < modDate.getFullYear()){
	// 		console.log("-" + modDate.getFullYear());
	// 	}
	// 	console.log(" " + cpr + "<br>\n");
	// 	today = new Date();
	// 	console.log("All Rights Reserved<br>");
	// 	if((em !== undefined) && (em !== "")){
	// 		this.org.pauahtun.GodN.newMail(em);
	// 		console.log("<br>");
	// 	}
	// 	console.log("</font></p>\n");
	// }

	// todaysDate() {
	// 	today = new this.mayaDate(new Date());
	// 	console.log(today);
	// }
}
export default MayaDate;
