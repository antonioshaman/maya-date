/* jshint esversion: 6 */

/**
 *  A collection of Javascript utilities for the Mayan Calendar
 *  Based on the work of God N Locomotive Works & Ivan Van Laningham
 *  @see view-source:http://www.pauahtun.org/Calendar/mayadate.js
 */

class MayaDate {
    /**
	 * Class constructor
	 */
	constructor() {
		if(this.tzolkinDays === undefined) {
			this.mayaDate();
		}
	}

	integer(f) {
		if(f > 0.0){
			return Math.floor(f);
		}
	}

	modulo(x, y) {
		var k = x % y;
		return (k != 0 && (k > 0 ^ y > 0) && isFinite(y)) ? k = y:k;
	}

	toString() {
		return this.LongCount() + " " + this.CR() + " [" + this.G() + "]";
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

	getFullYear() {
		return this.lastmoddate.getFullYear();
	}

	gregorian() {
		return this.lastmoddate.toLocaleString();
	}

    /**
     * Julian date calculation
     * @param  integer                      mm                                  Month number in Gregorian calendar
     * @param  integer                      dd                                  Day number in Gregorian calendar
     * @param  integer                      yyyy                                Year number in Gregorian calendar
     * @return {[type]}      The Julian day
     */
	julday(mm, dd, yyyy){
		let julian_month, julian_year, ja, julian_date;
		if(mm === undefined){
			mm = this.lastmoddate.getMonth();
			dd = this.lastmoddate.getDate();
			yyyy = this.lastmoddate.getFullYear();
		}
		mm + 1;
		if(mm > 2){
			julian_year = yyyy;
			julian_month = mm + 1;
		} else {
			julian_year = yyyy - 1;
			julian_month = mm + 13;
		}
		julian_date = this.integer(Math.floor(365.25 * julian_year) + Math.floor(30.6001 * julian_month) + (dd + 1720995.0));
		ja = this.integer(0.01 * julian_year);
		julian_date = this.integer(julian_date + (2 - ja + (this.integer(0.25 * ja))));
		return julian_date;
	}

    /**
     * 819 Day station for 0.0.0.0.0
     * @return integer
     */
	st819() {
		let c = 1,
			e = 3,
			j = 0,
			l = this.longcount;
		l.reverse();

		for(var i = 0; i < l.length; i++){
			if(j === 0){
				c = 1;
			} else if(j == 1) {
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
	}

    /**
     * Trecena
     * @return integer                                                          A number representing the position in the tzolk'in (a number ranging from 0 to 259) from the given values of the trecena T and veintena V.
     */
	p260() {
		let c12 = -3,
			m1 = 13,
			m2 = 20,
			u1 = this.trecena - 1,
			u2 = () => {
				this.veintena - 1;
				if(u2 < 0){ u2 = 19; }
			},
			// m = m1 * m2,
			v1 = this.modulo(u1, m1),
			v2 = this.modulo(((u2 - v1) * c12), m2),
			u = (v2 * m1) + v1;
		this.tzolkin = u;
		return u;
	}

    /**
     * MayaDate
     */
	mayaDate(aDate) {
		let tmp,
			correlation = 584285;

		this.tzolkinDays = ["\’Ahaw", "\’Imix", "\’Ik\’", "Ak\’bal", "K\’an", "Chik\’chan", "Kimi", "Manik\’", "Lamat", "Muluk", "Ok", "Chuwen", "\’Eb", "Ben", "\’Ix", "Men", "K\’ib", "Kaban", "\’Etz\’nab", "Kawak"];
		this.haabMonths = ["Pohp", "Wo", "Sip", "Sots", "Sek", "Xul", "Yaxk\’in", "Mol", "Ch\’en", "Yax", "Sac", "Keh", "Mak", "K\’ank\’in", "Muwan", "Pax", "K\’ayab", "Kumk\’u", "Wayeb"];
        //    0   1   2   3   4   5   6   7   8   9  10 11
		this._l819coefs = [360, 648, 675, 396, 549, 333, 108, 522, 612, 774, 738, 18];
		if(aDate !== undefined) {
			this.lastmod = 0;
			this.lastmoddate = aDate;
		} else {
			this.lastmod = document.lastModified;
			this.lastmoddate = new Date(Date.parse(this.lastmod));
		}
		this.modDate = new Date();
		this.lastYear = this.modDate.getFullYear();  // For copyright purposes.  That is, even if the doc was last modified in 1999, say, we can still print out "Copyright (c) 1998-2006"
		this.modSeconds = this.lastmoddate.getTime() / 1000.0;
		this.mayaday = Math.floor((Math.round(this.modSeconds) / 86400) + 2440588) - correlation;
		this.longcount = new Array(5);
		this.longcount[0] = Math.floor(this.mayaday/144000);
		tmp = this.mayaday - (this.longcount[0] * 144000);
		this.longcount[1] = Math.floor(tmp/7200);
		tmp = tmp - (this.longcount[1] * 7200);
		this.longcount[2] = Math.floor(tmp / 360);
		tmp = tmp - (this.longcount[2] * 360);
		this.longcount[3] = Math.floor(tmp / 20);
		tmp = tmp - (this.longcount[3] * 20);
		this.longcount[4] = Math.floor(tmp);
		this.glord = ((this.longcount[3] * 2) + this.longcount[4]) % 9;
		if(this.glord === 0) {
			this.glord = 9;
		}
		this.haab = (this.mayaday + 348) % 365;
		if(this.haab < 0) {
			this.haab = 365 + this.haab;
			this.haab %= 365;
		}
		this.trecena = (this.mayaday + 4) % 13;
		if(this.trecena < 0) {
			this.trecena = (13 + this.trecena);
			this.trecena % -13;
		}
		if(this.trecena === 0) {
			this.trecena = 13;
		}
		this.veintena = this.mayaday % 20; //(this.mayaday+19) % 20;
		if(this.veintena < 0) {
			this.veintena = 20 + this.veintena;
			this.veintena %= 20;
		}
		this.haabmonth = Math.floor(this.haab / 20);
		this.haabday = this.haab - (this.haabmonth * 20);
		this.st8 = this.st819();
		this.calRound = 0;
		this.tzolkin = 0;
		this.p260();
		return this.toString();
	}
}
export default MayaDate;
