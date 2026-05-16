const rulesBut = document.querySelector('.rules-but');
const rulesBox = document.querySelector('.rules-box');
const rulesLang = document.querySelector('.rules-lang');
const rulesMain = document.querySelector('.rules-main');


// CORE MANAGMENT
async function load(url, target){
	const res = await fetch(url);
	target.innerHTML = await res.text();
}

function loadRules(rules){
	load(`./rules-html/${rules}.html`, rulesMain);
}

rulesBut.addEventListener('click', () => {
	if(rulesBox.classList.contains('none')){
		rulesBox.classList.remove('none');
	}
	if(rulesBox.classList.contains('hidden')){
		rulesBox.style.zIndex = 'initial';
		rulesBox.classList.remove('hidden');
	}else{
		rulesBox.classList.add('hidden');
		setTimeout(() => {
			rulesBox.style.zIndex = '-1';
		}, 600);
	}
});

rulesLang.addEventListener('click', () => {
	if(rulesMain.id === 'en'){
		loadRules('rules_cs');
		rulesMain.id = 'cs';
	}else if(rulesMain.id === 'cs'){
		loadRules('rules_en');
		rulesMain.id = 'en';
	}else{
		console.log('UNEXPECTED LANG OF RULES');
	}
});


// INITIAL SETUP
loadRules('rules_en');
rulesMain.id = 'en';
rulesBox.classList.add('hidden');
rulesBox.classList.add('none');
rulesBox.style.zIndex = '-1';
rulesBox.style.height = `${window.innerHeight/2}px`;
rulesBox.style.width = `${window.innerWidth/2}px`;
rulesBox.style.maxWidth = '720px';
