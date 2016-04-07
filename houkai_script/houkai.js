
// 勲章リスト
var m_medalCsv = [];
// スキル種別リスト
var m_skillTypeCsv = [];
// 選択している勲章(0は装備無し)
var m_medal = [];

// スキル種別NO_防御
var SKILL_TYPE_NO_DIFFECE = 1;
// スキル種別NO_移動速度
var SKILL_TYPE_NO_SPEED = 2;
// スキル種別NO_条件付き移動速度
var SKILL_TYPE_NO_SPEED2 = 13;
// スキル種別NO_クリ率
var SKILL_TYPE_NO_CRITICAL = 3;
// スキル種別NO_移動速度攻撃
var SKILL_TYPE_NO_SPEED_DAMAGE = 12;
// スキル種別NO_戦神傲慢
var SKILL_TYPE_NO_IKUSA_GOMAN = 7;
// スキル種別_名称_勲章ダメージ
var SKILL_TYPE_NAME_MEDAL_DAMAGE = "勲章ダメージ";
// スキル種別_なし
var SKILL_TYPE_NONE = "NONE";
// 攻撃種別_汎用攻撃
var ATTACK_TYPE_ALL = "全て";
// ダメージ種別
var DAMAGE_TYPE_NAME_WEAPON = "武器ダメージ";
var DAMAGE_TYPE_NAME_MEDAL = "勲章ダメージ";

$(document).ready(function(){
	
	$('#medalSelect1').val(0).trigger("change");
	$('#medalSelect2').val(0).trigger("change");
	$('#medalSelect3').val(0).trigger("change");
	// 選択している勲章(0は装備無し)
	m_medal[0] = new MedalInfo(0);
	m_medal[1] = new MedalInfo(0);
	m_medal[2] = new MedalInfo(0);

	// 読み込みファイル数
	var m_loadFileMax = 2;
	var m_loadFileNow = 0;
	
	// オプション数が5つ以下の場合検索ボックスを表示させない。
	$(".js-example-basic-single").select2({
		minimumResultsForSearch: 5
	});
	//チェックボックスのデザインや色を指定します。
	$('input').iCheck({
		handle: 'checkbox',
		cursor: false,
		checkboxClass: 'icheckbox_square-blue'
	});
	// ----------------------
	// CSVの読み込み
	// ----------------------
	$("#inputItem").hide();
	$("#output").hide();
	$('#medalSkillMaxArea1').hide();
	$('#medalSkillMaxArea2').hide();
	$('#medalSkillMaxArea3').hide();
	$.get('houkai_script/medal_list.csv',function(data){
		m_medalCsv = $.csv()(data);
		addLoadFile();
	});
	$.get('houkai_script/skill_type_list.csv',function(data){
		m_skillTypeCsv = $.csv()(data);
		addLoadFile();
	});
	function addLoadFile(){
		m_loadFileNow++;
		if (m_loadFileNow == m_loadFileMax) {
			// 全ファイル読み込み完了したら
			// セレクトボックスを表示する
			$("#loading").fadeOut(function() {
				$("#inputItem").show();
				// セレクトボックスの初期化
				initSelectBox();
			});
		}
	}
	// ----------------------
	// セレクトボックス変更イベント
	// ----------------------
	$('select').change(function(){
		changeEvent();
		// スキルマ設定可能ならスキルマcheckBoxを表示する
		for(var i = 0; i < m_medal.length; i++){
			if(m_medal[i].getCanSetSkillMax()){
				$('#medalSkillMaxArea' + (i + 1)).show();
			}else{
				$('#medalSkillMaxArea' + (i + 1)).hide();
			}
		}
	});
	$("input[type=number]").on("change keyup",function(){
		changeEvent();
	});
	$("input[type=checkbox]").on("ifChecked ifUnchecked",function(){
		changeEvent();
	});
	function changeEvent(){
		// 入力値収集
		getSelectInfo();
		// 計算結果エリア表示
		$("#output").show();
		// 組合せ計算処理
		main();
		// 装備情報表示
		equipInfoView();
	}
	// ----------------------
	// セレクトボックスの初期化
	// ----------------------
	function initSelectBox(){
		$(m_medalCsv).each(function(i){
			if (i === 0) return true;
			var itemNo = this[0];
			var itemName = this[1];
			var text = '<option value="'+ i + '">No' + itemNo + " " + itemName +"</option>";
				// セレクトボックスに読み込んだ内容をセット
				$('#medalSelect1').append(text);
				$('#medalSelect2').append(text);
				$('#medalSelect3').append(text);
		});
	}
	// ----------------------
	// 入力値収集
	// ----------------------
	function getSelectInfo(){
		// 選択した勲章番号
		var medalSelect1No = $('#medalSelect1').val();
		var medalSelect2No = $('#medalSelect2').val();
		var medalSelect3No = $('#medalSelect3').val();
		// スキルマフラグ
		var medalSkillMax1Flag = $('#medalSkillMax1').prop('checked');
		var medalSkillMax2Flag = $('#medalSkillMax2').prop('checked');
		var medalSkillMax3Flag = $('#medalSkillMax3').prop('checked');
		// 入力値から勲章情報を作成する
		m_medal = [];
		m_medal[0] = new MedalInfo(medalSelect1No, medalSkillMax1Flag);
		m_medal[1] = new MedalInfo(medalSelect2No, medalSkillMax2Flag);
		m_medal[2] = new MedalInfo(medalSelect3No, medalSkillMax3Flag);
	}
	// ----------------------
	// 装備情報表示
	// ----------------------
	function equipInfoView(){
		var output = "";
		var medal;
		for(var medalNum = 0; medalNum < 3; medalNum++){
			medal = m_medal[medalNum];
			output += '<h5>' + medal.getName() + '</h5>';
			output += medal.getSkill()[0].getName();
			output += getEquipInfoString(medal, 0);
			output += getEquipInfoString(medal, 1);
			output += '<br>';
			output += medal.getSkill()[2].getName();
			output += getEquipInfoString(medal, 2);
			output += getEquipInfoString(medal, 3);
			output += '<br>';
		}
		// 画面出力
		$('#equip_info').html(output).trigger("create");

	}
	// ----------------------
	// 装備情報取得
	// ----------------------
	function getEquipInfoString(medal, skillNo){
		var output = "";
		var skillInfo = medal.getSkill()[skillNo];
		if(SKILL_TYPE_NONE != skillInfo.getTypeName()){
			output += "：" + skillInfo.getTypeName() + skillInfo.getPercentage();
			// 追加ダメなら%表示しない
			if(skillInfo.getTypeName().indexOf("ダメ") === -1){
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
		for(var medalNum = 0; medalNum < 3; medalNum++){
			var skillInfoArray = m_medal[medalNum].getSkill();
			for(var i = 0; i < skillInfoArray.length; i++){
				var skillInfo = skillInfoArray[i];
				var uniKey = skillInfo.getHashKey();
				if(uniKey in uniArray){
					//ユニーク重複時はスキルマを優先させるため
					//既にスキルマのスキルが登録されていた場合は上書きしない
					if(uniArray[uniKey].getIsSkillMax()){
						continue;
					}
				}
				uniArray[uniKey] = skillInfo;
			}
		}
		return uniArray;
	}
	// ----------------------
	// 組合せ計算_前半(長いので分割)
	// ----------------------
	function main(){
		var output = "";
		var addArray = [];

		// 初期値を設定 0%
		for(var i = 0; i < m_skillTypeCsv.length; i++){
			addArray[i] = 0;
		}
		// 装備している勲章に付いてるスキルを取得
		// （ユニークでかつ重複しているものは除外してある）
		var uniArray = getUniArray();
		// 同一種別のスキルタイプなら加算
		for (var uniItem in uniArray) {
			if ( uniArray[uniItem].getTypeNo() == SKILL_TYPE_NO_DIFFECE ){
				// 防御は全て乗算
				addArray[SKILL_TYPE_NO_DIFFECE] =
					100 - ((100 - addArray[SKILL_TYPE_NO_DIFFECE]) * (1 - uniArray[uniItem].getPercentage() / 100));
				continue;
			}
			addArray[uniArray[uniItem].getTypeNo()] += uniArray[uniItem].getPercentage();
		}
		// 移動速度は加算だけなのでここで求める
		var speed = parseFloat($('input[name=textBoxSpeed]').val()) + addArray[SKILL_TYPE_NO_SPEED];
		var speed2 = speed + addArray[SKILL_TYPE_NO_SPEED2];
		// バスクビール用 戦神傲慢とは加算になるようにする
		addArray[SKILL_TYPE_NO_IKUSA_GOMAN] += (speed - 100) * (addArray[SKILL_TYPE_NO_SPEED_DAMAGE]/100);

		// クリ率は加算だけなのでここで求める
		var criticalPercentage =
			addArray[SKILL_TYPE_NO_CRITICAL] + parseFloat($('input[name=textBoxCritical]').val());
		criticalPercentage = Math.min(criticalPercentage,100);
		// 防御
		var diffece = addArray[SKILL_TYPE_NO_DIFFECE];

		output += "クリ率" + Round(criticalPercentage) + "%、";
		output += "移動" + Round(speed2) + "%、";
		output += "被ダメ減少率" + Round(diffece) + '%<br>';

		output += main2(addArray, criticalPercentage);

		// 画面出力
		$('#result').html(output).trigger("create");
	}
	// ----------------------
	// 組合せ計算_後半(長いので分割)
	// ----------------------
	function main2(addArray, criticalPercentage){
		var output = "";
		var dotArray = {};
		//攻撃種別 元素攻撃や投擲など
		var atkTypeArray = [];
		// 攻撃種別リストを作成
		for(var i = 0; i < m_skillTypeCsv.length; i++){
			if(atkTypeArray.indexOf(m_skillTypeCsv[i][5]) === -1) {
				atkTypeArray[atkTypeArray.length] = m_skillTypeCsv[i][5];
			}
		}
		// ダメージ倍率の初期値を設定 1倍
		for(var i in atkTypeArray){
			dotArray[atkTypeArray[i]] = {};
			dotArray[atkTypeArray[i]]["ダメ倍率"] = 1;
			dotArray[atkTypeArray[i]]["クリダメ倍率"] = 1;
		}
		// 与えるダメージ
		var damage = {};
		var damageCri = {};
		var attackType = {};
		// 武器の基本攻撃力を設定
		damage[DAMAGE_TYPE_NAME_WEAPON] = parseFloat($('input[name=textBoxAttack]').val());
		attackType[DAMAGE_TYPE_NAME_WEAPON] = ATTACK_TYPE_ALL;
		
		// 計算優先順位１のものだけを先に実行
		var medalDamageCount = 0;
		for (var addKey in addArray) {
			var typeName = m_skillTypeCsv[addKey][3];
			var getOrderNo = m_skillTypeCsv[addKey][4];
			var atkType = m_skillTypeCsv[addKey][5];
			if(getOrderNo != 1) continue;
			if(typeName == "ダメ倍率" || typeName == "クリダメ倍率") {
				// 「ダメ倍率」と「クリダメ倍率」のみ乗算で計算する
				// （クリダメ倍率の乗算は存在しないが将来用に計算しておく）
				for(var i in atkTypeArray){
					if(atkTypeArray[i] != ATTACK_TYPE_ALL && 
						atkType != ATTACK_TYPE_ALL && 
						atkTypeArray[i].indexOf(atkType) === -1) continue;
					dotArray[atkTypeArray[i]][typeName] *= (1 + (addArray[addKey] / 100));
				}
			} else if (typeName == "勲章ダメージ") {
				// 勲章ダメ1～3の設定
				if(addArray[addKey] === 0)continue;
				medalDamageCount++;
				damage[DAMAGE_TYPE_NAME_MEDAL + medalDamageCount] = addArray[addKey];
				attackType[DAMAGE_TYPE_NAME_MEDAL + medalDamageCount] = atkType;
			}
		}
		// 通常ダメージ、クリティカル時のダメージの計算
		// （クリダメUP効果は、クリティカルで上乗せされたダメージにしか効果がない）
		for (var damageType in damage) {
			var atkType = attackType[damageType];
			damage[damageType] *= dotArray[atkType]["ダメ倍率"];
			damageCri[damageType] = damage[damageType] + (damage[damageType] * dotArray[atkType]["クリダメ倍率"]);
		}
		// 計算優先順位２以降のものを順番に実行
		// (優先順位はクロノスの計算を正しく行うために作成、
		// 通常の勲章は優先順位１でCSVを作成すること)
		for (var orderNo = 2; orderNo < 5; orderNo++) {
			for (var addKey in addArray) {
				var typeName = m_skillTypeCsv[addKey][3];
				var getOrderNo = parseInt(m_skillTypeCsv[addKey][4]);
				var atkType = m_skillTypeCsv[addKey][5];
				if(getOrderNo != orderNo) continue;
				if(typeName == "ダメ倍率"){
					for (var damageType in damage) {
						if(attackType[damageType] != ATTACK_TYPE_ALL && 
							atkType != ATTACK_TYPE_ALL && 
							attackType[damageType].indexOf(atkType) === -1) continue;
						// クロノスと乗算になる物はここで計算
						damage[damageType] *= (1 + (addArray[addKey] / 100));
						damageCri[damageType] *= (1 + (addArray[addKey] / 100));
					}
				}else if(typeName == "追加ダメ"){
					if(attackType[damageType] != ATTACK_TYPE_ALL && 
						atkType != ATTACK_TYPE_ALL && 
						attackType[damageType].indexOf(atkType) === -1) continue;
					// 現状クロノス用
					for (var damageType in damage) {
						damage[damageType] += addArray[addKey];
						damageCri[damageType] += addArray[addKey];
					}
				}
			}
		}
		// ダメージ期待値を求める
		// （通常ダメ x 否クリ確率 + クリダメ x クリ確率）
		var damageKitai = {};
		for (var damageType in damage) {
			damageKitai[damageType] = damage[damageType] * (1-criticalPercentage/100) + (damageCri[damageType] * criticalPercentage/100);

			output += '<h5>' + damageType + '</h5>';
			output += '通常時：<span id="black">' + Round(damage[damageType]) + '</span><br>';
			output += 'クリ時：<span id="red">' + Round(damageCri[damageType]) + '</span><br>';
			output += '期待値：<span id="purple">' + Round(damageKitai[damageType]) + '</span><br>';
		}
		return output;
	}
	// ----------------------
	// 四捨五入 小数点2位
	// ----------------------
	function Round(num){
		return Math.round(num * 100) / 100;
	}
	// googleアクセス解析
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	ga('create', 'UA-75854923-1', 'auto');
	ga('send', 'pageview');
});

// ----------------------
// 勲章情報クラス
//  selectNo:選択した勲章番号
//  skillMaxFlag:スキルマフラグ
// ----------------------
MedalInfo = function(selectNo, skillMaxFlag) {
	// 装備ID,装備名,スキル情報,スキルマ設定可能フラグ
	this.id = 0;
	this.name = "なし";
	this.skill = [];
	this.skill[0] = new SkillInfo(selectNo, skillMaxFlag, 0);
	this.skill[1] = new SkillInfo(selectNo, skillMaxFlag, 1);
	this.skill[2] = new SkillInfo(selectNo, skillMaxFlag, 2);
	this.skill[3] = new SkillInfo(selectNo, skillMaxFlag, 3);
	this.canSetSkillMax = false;
	for(var i in this.skill){
		if(this.skill[i].getCanSetSkillMax()){
			this.canSetSkillMax = true;
			break;
		}
	}

	if (0 < selectNo) {
		this.id = m_medalCsv[selectNo][0];
		this.name = m_medalCsv[selectNo][1];
	}
};
MedalInfo.prototype.getId = function() {return this.id;};
MedalInfo.prototype.getName = function() {return this.name;};
MedalInfo.prototype.getSkill = function() {return this.skill;};
MedalInfo.prototype.getCanSetSkillMax = function() {return this.canSetSkillMax;};

// ----------------------
// スキル情報クラス
//   selectNo:選択した勲章番号
//   skillMaxFlag:スキルマフラグ
//   skillNo:勲章内のスキル番号
// ----------------------
SkillInfo = function(selectNo,skillMaxFlag,skillNo) {
	//スキル名,スキル百分率,スキル種別,スキル種別名,計算順,ユニーク用hashkey,スキルマ設定可能フラグ,スキルマフラグ,攻撃種別
	this.name = "";
	this.percentage = 0;
	this.typeNo = 0;
	this.typeName = SKILL_TYPE_NONE;
	this.order = 0;
	this.hashKey = "_";
	this.canSetSkillMax = false;
	this.isSkillMax = false;
	this.isAttackType = ATTACK_TYPE_ALL;

	if (0 < selectNo) {
		this.name = m_medalCsv[selectNo][(1 < skillNo)?7:2];
		var celNo = skillNo * 2 + 3;
		if(1 < skillNo) celNo += 1;
		// スキルの効果値を取得
		var percentageString = m_medalCsv[selectNo][celNo];
		var percentageArray = percentageString.split("(");
		this.percentage = parseFloat(percentageArray[0]);
		// スキルマ設定可能フラグ
		this.canSetSkillMax = 1 < percentageArray.length;
		// スキルマフラグが立っている場合は括弧内の数値を設定する
		if( this.canSetSkillMax && skillMaxFlag ){
			this.percentage = parseFloat(percentageArray[1].replace(/[^0-9.\\-]/g,""));
		}
		this.isSkillMax = skillMaxFlag;

		this.typeNo = m_medalCsv[selectNo][celNo + 1];
		this.typeName = m_skillTypeCsv[this.typeNo][2];
		this.order = m_skillTypeCsv[this.typeNo][4];
		this.isAttackType = m_skillTypeCsv[this.typeNo][5];
		var uniqueFlag = (this.name.indexOf("(ユニーク)") != -1);
		// S_(勲章ID)_(スキルNO) でキーを作成
		// 同じ勲章なら重複する状態
		this.hashKey = "S_" + m_medalCsv[selectNo][0] + "_" + skillNo;
		if(!uniqueFlag){
			// ユニーク以外は重複させたくないのでキーを追加
			this.hashKey += "_" + m_medal.length;
		}
	}
};
SkillInfo.prototype.getName = function() {return this.name;};
SkillInfo.prototype.getPercentage = function() {return this.percentage;};
SkillInfo.prototype.getTypeNo = function() {return this.typeNo;};
SkillInfo.prototype.getTypeName = function() {return this.typeName;};
SkillInfo.prototype.getOrder = function() {return this.order;};
SkillInfo.prototype.getHashKey = function() {return this.hashKey;};
SkillInfo.prototype.getCanSetSkillMax = function() {return this.canSetSkillMax;};
SkillInfo.prototype.getIsSkillMax = function() {return this.isSkillMax;};
SkillInfo.prototype.getIsAttackType = function() {return this.isAttackType;};


// ----------------------
// CSV取得ライブラリ
// ----------------------
/* Usage:
 *  jQuery.csv()(csvtext)				returns an array of arrays representing the CSV text.
 *  jQuery.csv("\t")(tsvtext)			uses Tab as a delimiter (comma is the default)
 *  jQuery.csv("\t", "'")(tsvtext)		uses a single quote as the quote character instead of double quotes
 *  jQuery.csv("\t", "'\"")(tsvtext)	uses single & double quotes as the quote character
 */
jQuery.extend({
	csv: function(delim, quote, lined) {
		delim = typeof delim == "string" ? new RegExp( "[" + (delim || ","   ) + "]" ) : typeof delim == "undefined" ? ","	: delim;
		quote = typeof quote == "string" ? new RegExp("^[" + (quote || '"'   ) + "]" ) : typeof quote == "undefined" ? '"'	: quote;
		//lined = typeof lined == "string" ? new RegExp( "[" + (lined || "\r\n") + "]+") : typeof lined == "undefined" ? "\r\n" : lined;
		function splitline (v) {
			// Split the line using the delimitor
			var arr  = v.split(delim),
				out = [], q;
			for (var i=0, l=arr.length; i<l; i++) {
				if (q = arr[i].match(quote)) {
					var j;
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
			var lines = text.split(/\r\n|\r|\n/);  // 改行コードで分割
			for (var i=0, l=lines.length; i<l; i++) {
				lines[i] = splitline(lines[i]);
			}
			return lines;
		};
	}
});