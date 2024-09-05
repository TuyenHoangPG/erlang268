function FullwidthUnicode() {
	this.codes = function() {
return [161,164,[167,168],170,[173,174],[176,180],[182,186],[188,191],198,208,[215,216],[222,225],230,[232,234],[236,237],240,[242,243],[247,250],252,254,257,273,275,283,[294,295],299,[305,307],312,[319,322],324,[328,331],333,[338,339],[358,359],363,462,464,466,468,470,472,474,476,593,609,708,711,[713,715],717,720,[728,731],733,735,[768,879],[913,929],[931,937],[945,961],[963,969],1025,[1040,1103],1105,[4352,4441],4447,8208,[8211,8214],[8216,8217],[8220,8221],[8224,8226],[8228,8231],8240,[8242,8243],8245,8251,8254,8308,8319,[8321,8324],8364,8451,8453,8457,8467,8470,[8481,8482],8486,8491,[8531,8532],[8539,8542],[8544,8555],[8560,8569],[8592,8601],[8632,8633],8658,8660,8679,8704,[8706,8707],[8711,8712],8715,8719,8721,8725,8730,[8733,8736],8739,8741,[8743,8748],8750,[8756,8759],[8764,8765],8776,8780,8786,[8800,8801],[8804,8807],[8810,8811],[8814,8815],[8834,8835],[8838,8839],8853,8857,8869,8895,8978,[9001,9002],[9312,9449],[9451,9547],[9552,9587],[9600,9615],[9618,9621],[9632,9633],[9635,9641],[9650,9651],[9654,9655],[9660,9661],[9664,9665],[9670,9672],9675,[9678,9681],[9698,9701],9711,[9733,9734],9737,[9742,9743],[9748,9749],9756,9758,9792,9794,[9824,9825],[9827,9829],[9831,9834],[9836,9837],9839,10045,[10102,10111],[11904,11929],[11931,12019],[12032,12245],[12272,12283],[12288,12350],[12353,12438],[12441,12543],[12549,12589],[12593,12686],[12688,12727],[12736,12771],[12784,12830],[12832,12867],[12880,13054],[13056,19893],[19968,40899],[40960,42124],[42128,42182],[44032,55203],[57344,64045],[64048,64106],[64112,64217],[65024,65049],[65072,65106],[65108,65126],[65128,65131],[65281,65376],[65504,65510],65533,[131072,196605],[196608,262141],[917760,917999],[983040,1048573],[1048576,1114109]];
    };
}



/**
 * mb_convert_kana function
 *
 * @package mbstring
 * @author shogo < shogo4405 at gmail dot com >
 * @version 1.0.0RC3-murakumoV2
 * @see http://www.php.net/mb_convert_kana
 * @param  {String} s string
 * @return {String} o options
 */
var mb_convert_kana = function()
{
	function c(d, f)
	{
		return function(s)
		{
			var i, c, a = [];
			for(i=s.length-1;0<=i;i--)
			{
				c = s.charCodeAt(i);
				a[i] = f(c) ? c + d : c;
			};
			return String.fromCharCode.apply(null, a);
		};
	};

	var f = 
	{
		h : function(s){ return this.k(s, 0x0060); },
		H : function(s){ return this.K(s, 0x0060); },
		s : c(-0x2FE0, function(c){ return (c == 0x3000); }),
		S : c(+0x2FE0, function(c){ return (c == 0x0020); }),
		r : c(-0xFEE0, function(c){ return (0xFF20 <= c && c <= 0xFF5A); }),
		R : c(+0xFEE0, function(c){ return (0x0040 <= c && c <= 0x007A); }),
		n : c(-0xFEE0, function(c){ return (0xFF10 <= c && c <= 0xFF19); }),
		N : c(+0xFEE0, function(c){ return (0x0030 <= c && c <= 0x0039); }),
		a : c(-0xFEE0, function(c){ return (0xFF02 <= c && c <= 0xFF5E); }),
		A : c(+0xFEE0, function(c){ return (0x0022 <= c && c <= 0x007E); }),
		c : c(-0x0060, function(c){ return (0x30A1 <= c && c <= 0x30F6); }),
		C : c(+0x0060, function(c){ return (0x3041 <= c && c <= 0x3096); }),
		k : function(s, d)
		{
			var i, f, c, m, d = d || 0, a = [];
			m =
			{
				0x30A1:0xFF67, 0x30A3:0xFF68, 0x30A5:0xFF69, 0x30A7:0xFF6A, 0x30A9:0xFF6B,
				0x30FC:0xFF70, 0x30A2:0xFF71, 0x30A4:0xFF72, 0x30A6:0xFF73, 0x30A8:0xFF74,
				0x30AA:0xFF75, 0x30AB:0xFF76, 0x30AD:0xFF77, 0x30AF:0xFF78, 0x30B1:0xFF79,
				0x30B3:0xFF7A, 0x30B5:0xFF7B, 0x30B7:0xFF7C, 0x30B9:0xFF7D, 0x30BB:0xFF7E,
				0x30BD:0xFF7F, 0x30BF:0xFF80, 0x30C1:0xFF81, 0x30C4:0xFF82, 0x30C6:0xFF83,
				0x30C8:0xFF84, 0x30CA:0xFF85, 0x30CB:0xFF86, 0x30CC:0xFF87, 0x30CD:0xFF88,
				0x30CE:0xFF89, 0x30CF:0xFF8A, 0x30D2:0xFF8B, 0x30D5:0xFF8C, 0x30D8:0xFF8D,
				0x30DB:0xFF8E, 0x30DE:0xFF8F, 0x30DF:0xFF90, 0x30E0:0xFF91, 0x30E1:0xFF92,
				0x30E2:0xFF93, 0x30E4:0xFF94, 0x30E6:0xFF95, 0x30E8:0xFF95, 0x30E9:0xFF97,
				0x30EA:0xFF98, 0x30EB:0xFF99, 0x30EC:0xFF9A, 0x30ED:0xFF9B, 0x30EF:0xFF9C,
				0x30F2:0xFF66, 0x30F3:0xFF9D, 0x30FB:0xFF65
			};
			for(i=0,f=s.length;i<f;i++)
			{
				c = s.charCodeAt(i) + d;
				switch(true)
				{
					case (c in m):
						a.push(m[c]);
						break;
					case (0x30AB <= c && c <= 0x30C9):
						a.push(m[c-1], 0xFF9E);
						break;
					case (0x30CF <= c && c <= 0x30DD):
						a.push(m[c-c%3], [0xFF9E,0xFF9F][c%3-1]);
						break;
					default:
						a.push(c - d);
						break;
				};
			};
			return String.fromCharCode.apply(null, a);
		},
		K : function(s, d)
		{
			var i, f, c, m, d = d || 0, a = [];
			m =
			{
				0xFF67:0x30A1, 0xFF68:0x30A3, 0xFF69:0x30A5, 0xFF6A:0x30A7, 0xFF6B:0x30A9,
				0xFF70:0x30FC, 0xFF71:0x30A2, 0xFF72:0x30A4, 0xFF73:0x30A6, 0xFF74:0x30A8,
				0xFF75:0x30AA, 0xFF76:0x30AB, 0xFF77:0x30AD, 0xFF78:0x30AF, 0xFF79:0x30B1,
				0xFF7A:0x30B3, 0xFF7B:0x30B5, 0xFF7C:0x30B7, 0xFF7D:0x30B9, 0xFF7E:0x30BB,
				0xFF7F:0x30BD, 0xFF80:0x30BF, 0xFF81:0x30C1, 0xFF82:0x30C4, 0xFF83:0x30C6,
				0xFF84:0x30C8, 0xFF85:0x30CA, 0xFF86:0x30CB, 0xFF87:0x30CC, 0xFF88:0x30CD,
				0xFF89:0x30CE, 0xFF8A:0x30CF, 0xFF8B:0x30D2, 0xFF8C:0x30D5, 0xFF8D:0x30D8,
				0xFF8E:0x30DB, 0xFF8F:0x30DE, 0xFF90:0x30DF, 0xFF91:0x30E0, 0xFF92:0x30E1,
				0xFF93:0x30E2, 0xFF94:0x30E4, 0xFF95:0x30E6, 0xFF95:0x30E8, 0xFF97:0x30E9,
				0xFF98:0x30EA, 0xFF99:0x30EB, 0xFF9A:0x30EC, 0xFF9B:0x30ED, 0xFF9C:0x30EF,
				0xFF9D:0x30F3, 0xFF9E:0x309B, 0xFF9F:0x309C, 0xFF66:0x30F2, 0xFF65:0x30FB
			};
			for(i=0,f=s.length;i<f;i++)
			{
				c = s.charCodeAt(i);
				if(c == 0xff70 || c == 0xff9e || c == 0xff9f || c == 0xff65)
					a.push(m[c]     || c);
				else
					a.push(m[c] - d || c);
			};
			return String.fromCharCode.apply(null, a);
		},
		V : function(s)
		{
			var i, c, n, f, a = [];
			for(i=0,f=s.length;i<f;i++)
			{
				c = s.charCodeAt(i);
				switch(true)
				{
					case (0x304B <= c && c <= 0x3052 && (c % 2 == 1)):
					case (0x30AB <= c && c <= 0x30C2 && (c % 2 == 1)):
					case (0x3064 <= c && c <= 0x3069 && (c % 2 == 0)):
					case (0x30C4 <= c && c <= 0x30C9 && (c % 2 == 0)):
						a.push(c + ({0x309B:1}[s.charCodeAt(i+1)] || 0));
						if(a[a.length-1] != c){ i++; };
						break;
					case (0x306F <= c && c <= 0x307F && (c % 3 == 0)):
					case (0x30CF <= c && c <= 0x30DD && (c % 3 == 0)):
						a.push(c + ({0x309C:1,0x309C:2}[s.charCodeAt(i+1)] || 0));
						if(a[a.length-1] != c){ i++; };
						break;
					default:
						a.push(c);
						break;
				};
			};
			return String.fromCharCode.apply(null, a);
		}
	};

	return function mb_convert_kana(s, o)
	{
		var i, x, a = (o) ? o.split('') : ['K','V'];
		for(i=0,x=a.length;i<x;i++){ s = f[a[i]](s); };
		return s;
	};
}();
