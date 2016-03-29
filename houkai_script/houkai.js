
// 勲章リスト
var m_medalList = [];
// スキル種別リスト
var m_skillTypeList = [];

// スキル種別NO_防御
var SKILL_TYPE_NO_DIFFECE = 1;
// スキル種別NO_クリ率
var SKILL_TYPE_NO_CRITICAL = 3;
// スキル種別NO_追加ダメージ
var SKILL_TYPE_NO_TUIKA_DAMAGE = 9;
// スキル種別NO_移動速度攻撃
var SKILL_TYPE_NO_SPEED_DAMAGE = 12;
// スキル種別_なし
var SKILL_TYPE_NONE = "NONE";

$(document).ready(function(){

	// 選択している勲章(0は装備無し)
	var m_medal1 = new MedalInfo(0);
	var m_medal2 = new MedalInfo(0);
	var m_medal3 = new MedalInfo(0);
	// 読み込みファイル数
	var m_loadFileMax = 2;
	var m_loadFileNow = 0;

	
	// ----------------------
	// CSVの読み込み
	// ----------------------
	$("#loading").show();
	$.get('houkai_script/medal_list.csv',function(data){
		m_medalList = $.csv()(data);
		addLoadFile();
	});
	$.get('houkai_script/skill_type_list.csv',function(data){
		m_skillTypeList = $.csv()(data);
		addLoadFile();
	});
	function addLoadFile(){
		m_loadFileNow++;
		if (m_loadFileNow == m_loadFileMax) {
			// 全ファイル読み込み完了したら
			// セレクトボックスの初期化
			initSelectBox();
			// セレクトボックスを表示する
			$("#loading").fadeOut(function() {
				$("#inputItem").show();
			});
		}
	}
	// ----------------------
	// セレクトボックス変更イベント
	// ----------------------
	$(function(){
		$('select').change(function(){
			// 入力値収集
			getSelectInfo();
			// 装備情報表示
			equipInfoView();
			// 組合せ計算処理
			main();
			// 計算結果表示
			$("#output").show();
		});
	});

	$(function(){
		$('input').on("keyup",function(){
			// 入力値収集
			getSelectInfo();
			// 装備情報表示
			equipInfoView();
			// 組合せ計算処理
			main();
			// 計算結果表示
			$("#output").show();
		});
	});
	// ----------------------
	// セレクトボックスの初期化
	// ----------------------
	function initSelectBox(){
		var count = 0;
		$(m_medalList).each(function(i){
			if (i == 0) return true;
			var itemNo = this[0];
			var itemName = this[1];
			var text = '<option value="'+ i + '">No' + itemNo + " " + itemName +"</option>";
				// セレクトボックスに読み込んだ内容をセット
				$('#medalSelect1').append(text);
				$('#medalSelect2').append(text);
				$('#medalSelect3').append(text);
		});
		// 入力フォームの整列
		var max = 0;
		$("span.label").each(function(){
			if ($(this).width() > max) max = $(this).width();
		});
		$("span.label").width(max).css({"float":"left", "clear":"both", "padding":"0px 0px 0px 0px"});
	}
	// ----------------------
	// 入力値収集
	// ----------------------
	function getSelectInfo(){
		var medalSelect1No = $('#medalSelect1').val();
		var medalSelect2No = $('#medalSelect2').val();
		var medalSelect3No = $('#medalSelect3').val();
		m_medal1 = new MedalInfo(medalSelect1No);
		m_medal2 = new MedalInfo(medalSelect2No);
		m_medal3 = new MedalInfo(medalSelect3No);
	}
	// ----------------------
	// 装備情報表示
	// ----------------------
	function equipInfoView(){
		var output = "";
		// 勲章１
		output += getEquipInfoString(m_medal1);
		output += '<br>';
		// 勲章２
		output += getEquipInfoString(m_medal2);
		output += '<br>';
		// 勲章３
		output += getEquipInfoString(m_medal3);
		// 画面出力
		$('#equip_info').html(output);
	}
	// ----------------------
	// 装備情報取得
	// ----------------------
	function getEquipInfoString(medal){
		var output = "";
		// 勲章１
		output += medal.getName() + '<br>';
		output += medal.getSkill1Name();
		if(SKILL_TYPE_NONE != medal.getSkill1Type1()){
			output += "：" + medal.getSkill1Type1();
			output +=  medal.getSkill1Percentage1();
			// 追加ダメなら%表示しない
			if(medal.getSkill1TypeNo1() != SKILL_TYPE_NO_TUIKA_DAMAGE){
				output += "%";
			}
		}
		if(SKILL_TYPE_NONE != medal.getSkill1Type2()){
			output += "：" + medal.getSkill1Type2();
			output +=  medal.getSkill1Percentage2();
			// 追加ダメなら%表示しない
			if(medal.getSkill1TypeNo2() != SKILL_TYPE_NO_TUIKA_DAMAGE){
				output += "%";
			}
		}
		output += '<br>';
		output += medal.getSkill2Name();
		if(SKILL_TYPE_NONE != medal.getSkill2Type1()){
			output += "：" + medal.getSkill2Type1();
			output +=  medal.getSkill2Percentage1();
			// 追加ダメなら%表示しない
			if(medal.getSkill2TypeNo1() != SKILL_TYPE_NO_TUIKA_DAMAGE){
				output += "%";
			}
		}
		if(SKILL_TYPE_NONE != medal.getSkill2Type2()){
			output += "：" + medal.getSkill2Type2();
			output +=  medal.getSkill2Percentage2();
			// 追加ダメなら%表示しない
			if(medal.getSkill2TypeNo2() != SKILL_TYPE_NO_TUIKA_DAMAGE){
				output += "%";
			}
		}
		return output;
	}
	// ----------------------
	// ユニークスキルで重複していた場合は除外して配列を作成する
	// ----------------------
	function getUniArray(){
		// ユニークスキルが重複していたら上書きする
		var uniArray = {};
		var uniKey = "";
		uniKey = "A_" + m_medal1.getId() + "_" + m_medal1.getSkill1Name();
		uniKey1 = uniKey + "1";
		uniKey2 = uniKey + "2";
		if(m_medal1.getSkill1Name().indexOf("(ユニーク)") == -1){
			// ユニークでないならキーを追加して上書きされないようにする
			uniKey1 = uniKey1 + "_0";
			uniKey2 = uniKey2 + "_1";
		}
		uniArray[uniKey1]  = [m_medal1.getSkill1TypeNo1(), m_medal1.getSkill1Percentage1()];
		uniArray[uniKey2]  = [m_medal1.getSkill1TypeNo2(), m_medal1.getSkill1Percentage2()];
		
		uniKey = "A_" + m_medal1.getId() + "_" + m_medal1.getSkill2Name();
		uniKey1 = uniKey + "1";
		uniKey2 = uniKey + "2";
		if(m_medal1.getSkill2Name().indexOf("(ユニーク)") == -1){
			// ユニークでないならキーを追加して上書きされないようにする
			uniKey1 = uniKey1 + "_2";
			uniKey2 = uniKey2 + "_3";
		}
		uniArray[uniKey1]  = [m_medal1.getSkill2TypeNo1(), m_medal1.getSkill2Percentage1()];
		uniArray[uniKey2]  = [m_medal1.getSkill2TypeNo2(), m_medal1.getSkill2Percentage2()];
		
		uniKey = "A_" + m_medal2.getId() + "_" + m_medal2.getSkill1Name();
		uniKey1 = uniKey + "1";
		uniKey2 = uniKey + "2";
		if(m_medal2.getSkill1Name().indexOf("(ユニーク)") == -1){
			// ユニークでないならキーを追加して上書きされないようにする
			uniKey1 = uniKey1 + "_4";
			uniKey2 = uniKey2 + "_5";
		}
		uniArray[uniKey1]  = [m_medal2.getSkill1TypeNo1(), m_medal2.getSkill1Percentage1()];
		uniArray[uniKey2]  = [m_medal2.getSkill1TypeNo2(), m_medal2.getSkill1Percentage2()];
		
		uniKey = "A_" + m_medal2.getId() + "_" + m_medal2.getSkill2Name();
		uniKey1 = uniKey + "1";
		uniKey2 = uniKey + "2";
		if(m_medal2.getSkill2Name().indexOf("(ユニーク)") == -1){
			// ユニークでないならキーを追加して上書きされないようにする
			uniKey1 = uniKey1 + "_6";
			uniKey2 = uniKey2 + "_7";
		}
		uniArray[uniKey1]  = [m_medal2.getSkill2TypeNo1(), m_medal2.getSkill2Percentage1()];
		uniArray[uniKey2]  = [m_medal2.getSkill2TypeNo2(), m_medal2.getSkill2Percentage2()];
		
		uniKey = "A_" + m_medal3.getId() + "_" + m_medal3.getSkill1Name();
		uniKey1 = uniKey + "1";
		uniKey2 = uniKey + "2";
		if(m_medal3.getSkill1Name().indexOf("(ユニーク)") == -1){
			// ユニークでないならキーを追加して上書きされないようにする
			uniKey1 = uniKey1 + "_8";
			uniKey2 = uniKey2 + "_9";
		}
		uniArray[uniKey1]  = [m_medal3.getSkill1TypeNo1(), m_medal3.getSkill1Percentage1()];
		uniArray[uniKey2]  = [m_medal3.getSkill1TypeNo2(), m_medal3.getSkill1Percentage2()];
		
		uniKey = "A_" + m_medal3.getId() + "_" + m_medal3.getSkill2Name();
		uniKey1 = uniKey + "1";
		uniKey2 = uniKey + "2";
		if(m_medal3.getSkill2Name().indexOf("(ユニーク)") == -1){
			// ユニークでないならキーを追加して上書きされないようにする
			uniKey1 = uniKey1 + "_10";
			uniKey2 = uniKey2 + "_11";
		}
		uniArray[uniKey1] = [m_medal3.getSkill2TypeNo1(), m_medal3.getSkill2Percentage1()];
		uniArray[uniKey2] = [m_medal3.getSkill2TypeNo2(), m_medal3.getSkill2Percentage2()];

		return uniArray;
	}
	// ----------------------
	// 組合せ計算処理
	// ----------------------
	function main(){
		var output = "";
		var addingArray = [];
		// 初期値の100%を設定
		addingArray[ m_medal1.getSkill1TypeNo1()] = 100;
		addingArray[ m_medal1.getSkill1TypeNo2()] = 100;
		addingArray[ m_medal1.getSkill2TypeNo1()] = 100;
		addingArray[ m_medal1.getSkill2TypeNo2()] = 100;
		addingArray[ m_medal2.getSkill1TypeNo1()] = 100;
		addingArray[ m_medal2.getSkill1TypeNo2()] = 100;
		addingArray[ m_medal2.getSkill2TypeNo1()] = 100;
		addingArray[ m_medal2.getSkill2TypeNo2()] = 100;
		addingArray[ m_medal3.getSkill1TypeNo1()] = 100;
		addingArray[ m_medal3.getSkill1TypeNo2()] = 100;
		addingArray[ m_medal3.getSkill2TypeNo1()] = 100;
		addingArray[ m_medal3.getSkill2TypeNo2()] = 100;
		// クリ率は初期値0
		addingArray[ SKILL_TYPE_NO_CRITICAL] = 0;
		// 追加ダメは初期値0
		if(( SKILL_TYPE_NO_TUIKA_DAMAGE in addingArray)) {
			addingArray[ SKILL_TYPE_NO_TUIKA_DAMAGE] = 0;
		}
		// 移動速度攻撃は初期値0
		addingArray[ SKILL_TYPE_NO_SPEED_DAMAGE] = 0;
		// ダメージカット
		addingArray[SKILL_TYPE_NO_DIFFECE] = 0;
		
		// 加算分を計算
		var uniArray = getUniArray();
		for (var uniItem in uniArray) {
			if ( uniArray[uniItem][0] == SKILL_TYPE_NO_DIFFECE ){
				// 防御は全て乗算
				addingArray[SKILL_TYPE_NO_DIFFECE] = 100 - ((100 - addingArray[SKILL_TYPE_NO_DIFFECE]) * (1 - uniArray[uniItem][1] / 100));
				continue;
			}
			addingArray[uniArray[uniItem][0]] += uniArray[uniItem][1];
		}

		// 乗算分を計算
		// 初期化
		var multiplicationArray = [];
		// 初期値の1倍を設定
		for (var key in m_skillTypeList) {
			var typeName = m_skillTypeList[key][3];
			multiplicationArray[typeName] = 1;
		}
		// 武器攻撃力の設定
		multiplicationArray["攻撃力"] = parseFloat($('input[name=textBoxAttack]').val());
		// 移動速度の設定
		multiplicationArray["移動速度"] = parseFloat($('input[name=textBoxSpeed]').val()) /100;
		
		
		// 計算優先順位１のものだけを先に実行
		for (key in addingArray) {
			var typeName = m_skillTypeList[key][3];
			var getOrderNo = m_skillTypeList[key][4];
			if(getOrderNo != 1) continue;
			multiplicationArray[typeName] *= (addingArray[key] / 100);
		}
		
		var criticalPercentage = multiplicationArray["クリ率"] + $('input[name=textBoxCritical]').val() / 100;
		criticalPercentage = Math.min(criticalPercentage,1);
		output += "クリ率 " + Math.round(criticalPercentage * 100*100)/100 + "%、";
		output += "移動速度 " + Math.round((multiplicationArray["移動速度"] + multiplicationArray["移動速度条件付き"] - 1)*100* 100)/100 + "%、";
		output += "ダメージカット率 " + Math.round(multiplicationArray["防御力"]*100*100)/100 + '%<br>';
		var damage = multiplicationArray["攻撃力"] * ((multiplicationArray["移動速度"] -1) * multiplicationArray["速度攻撃力"]+1);
		var damageCri = damage + (damage * multiplicationArray["クリ攻撃力"]);
		
		// 計算優先順位２以降のものを順番に実行
		// (優先順位はクロノスの計算を正しく行うために作成、
		// 通常の勲章は優先順位１でCSVを作成すること)
		for (var orderNo = 2; orderNo < 10; orderNo++) {
			var count = 0;
			for (key in addingArray) {
				var typeName = m_skillTypeList[key][3];
				var getOrderNo = m_skillTypeList[key][4];
				if(getOrderNo != orderNo) continue;
				if(typeName == "攻撃力"){
					damage *= (addingArray[key] / 100);
					damageCri *= (addingArray[key] / 100);
					count ++;
				}else if(typeName == "追加ダメ"){
					damage += addingArray[key];
					damageCri += addingArray[key];
					count ++;
				}
			}
			// 処理対象が無くなったら抜ける
			if(count == 0)break;
		}
		var damageKitai = damage * (1-criticalPercentage) + (damageCri * criticalPercentage);
		output += "ダメージ通常時 " + Math.round(damage*100)/100 + '<br>';
		output += "ダメージクリ時 " + Math.round(damageCri*100)/100 + '<br>';
		output += "ダメージ期待値 " + Math.round(damageKitai*100)/100 + '<br>';

		// 画面出力
		$('#result').html(output);
	}
});



// ----------------------
// 勲章情報クラス
// ----------------------
MedalInfo = function(medalSelectNo) {
	// 装備ID,装備名,スキル1名,スキル1百分率1,スキル1種別1,スキル1百分率2,スキル1種別2,スキル2名,スキル2百分率1,スキル2種別1,スキル2百分率2,スキル2種別2
	this.id = 0;
	this.name = "なし";
	this.skill1Name = "";
	this.skill1Percentage1 = 0;
	this.skill1Percentage2 = 0;
	this.skill2Name = "";
	this.skill2Percentage1 = 0;
	this.skill2Percentage2 = 0;
	this.skill1TypeNo1 = 0;
	this.skill1Type1 = SKILL_TYPE_NONE;
	this.skill1TypeNo2 = 0;
	this.skill1Type2 = SKILL_TYPE_NONE;
		
	this.skill2TypeNo1 = 0;
	this.skill2Type1 = SKILL_TYPE_NONE;
	this.skill2TypeNo2 = 0;
	this.skill2Type2 = SKILL_TYPE_NONE;
	if (0 < medalSelectNo) {
		this.id = m_medalList[medalSelectNo][0].trim();
		this.name = m_medalList[medalSelectNo][1];
		this.skill1Name = m_medalList[medalSelectNo][2];
		this.skill1Percentage1 = parseFloat(m_medalList[medalSelectNo][3]);
		this.skill1TypeNo1 = m_medalList[medalSelectNo][4];
		this.skill1Type1 = m_skillTypeList[this.skill1TypeNo1][2];
		this.skill1Percentage2 = parseFloat(m_medalList[medalSelectNo][5]);
		this.skill1TypeNo2 = m_medalList[medalSelectNo][6];
		this.skill1Type2 = m_skillTypeList[this.skill1TypeNo2][2];
		
		this.skill2Name = m_medalList[medalSelectNo][7];
		this.skill2Percentage1 = parseFloat(m_medalList[medalSelectNo][8]);
		this.skill2TypeNo1 = m_medalList[medalSelectNo][9];
		this.skill2Type1 = m_skillTypeList[this.skill2TypeNo1][2];
		this.skill2Percentage2 = parseFloat(m_medalList[medalSelectNo][10]);
		this.skill2TypeNo2 = m_medalList[medalSelectNo][11];
		this.skill2Type2 = m_skillTypeList[this.skill2TypeNo2][2];
	}
};
MedalInfo.prototype.getId = function() {return this.id;};
MedalInfo.prototype.getName = function() {return this.name;};
MedalInfo.prototype.getSkill1Name = function() {return this.skill1Name;};
MedalInfo.prototype.getSkill1Percentage1 = function() {return this.skill1Percentage1;};
MedalInfo.prototype.getSkill1Percentage2 = function() {return this.skill1Percentage2;};
MedalInfo.prototype.getSkill1TypeNo1 = function() {return this.skill1TypeNo1;};
MedalInfo.prototype.getSkill1Type1 = function() {return this.skill1Type1;};
MedalInfo.prototype.getSkill1TypeNo2 = function() {return this.skill1TypeNo2;};
MedalInfo.prototype.getSkill1Type2 = function() {return this.skill1Type2;};
		
MedalInfo.prototype.getSkill2Name = function() {return this.skill2Name;};
MedalInfo.prototype.getSkill2Percentage1 = function() {return this.skill2Percentage1;};
MedalInfo.prototype.getSkill2Percentage2 = function() {return this.skill2Percentage2;};
MedalInfo.prototype.getSkill2TypeNo1 = function() {return this.skill2TypeNo1;};
MedalInfo.prototype.getSkill2Type1 = function() {return this.skill2Type1;};
MedalInfo.prototype.getSkill2TypeNo2 = function() {return this.skill2TypeNo2;};
MedalInfo.prototype.getSkill2Type2 = function() {return this.skill2Type2;};

// ----------------------
// CSV取得ライブラリ
// ----------------------
/* Usage:
 *  jQuery.csv()(csvtext)				returns an array of arrays representing the CSV text.
 *  jQuery.csv("\t")(tsvtext)			uses Tab as a delimiter (comma is the default)
 *  jQuery.csv("\t", "'")(tsvtext)		uses a single quote as the quote character instead of double quotes
 *  jQuery.csv("\t", "'\"")(tsvtext)	uses single & double quotes as the quote character
 */
;
jQuery.extend({
	csv: function(delim, quote, lined) {
		delim = typeof delim == "string" ? new RegExp( "[" + (delim || ","   ) + "]" ) : typeof delim == "undefined" ? ","	: delim;
		quote = typeof quote == "string" ? new RegExp("^[" + (quote || '"'   ) + "]" ) : typeof quote == "undefined" ? '"'	: quote;
		lined = typeof lined == "string" ? new RegExp( "[" + (lined || "\r") + "]+") : typeof lined == "undefined" ? "\r" : lined;
		function splitline (v) {
			// Split the line using the delimitor
			var arr  = v.split(delim),
				out = [], q;
			for (var i=0, l=arr.length; i<l; i++) {
				if (q = arr[i].match(quote)) {
					for (j=i; j<l; j++) {
						if (arr[j].charAt(arr[j].length-1) == q[0]) { break; }
					}
					var s = arr.slice(i,j+1).join(delim);
					out.push(s.substr(1,s.length-2));
					i = j;
				}
				else { out.push(arr[i]); }
			}
			return out;
		}
		return function(text) {
			var lines = text.split(lined);
			for (var i=0, l=lines.length; i<l; i++) {
				lines[i] = splitline(lines[i]);
			}
			return lines;
		};
	}
});