// jshint esversion: 8
// jshint strict: global

"use strict";

const dbUrl = "db.json";
var jsonObj;

async function initPage() {
	let promise = await initJson( dbUrl );
	promise = await cleanUrlParam();
	promise = await initSeas();
	promise = await epList( getUrlParam( "s" ) - 1 );
	promise = await resList( getUrlParam( "s" ) - 1, getUrlParam( "e" ) - 1 );
	pageInit();
	loadVideo( getUrlParam( "s" ), getUrlParam( "e" ), getUrlParam( "res" ), 0 );
	document.getElementById( "jsCheck" ).innerHTML = "Video Resolution:&nbsp;";
	if ( getUrlParam( "lo" ) === 1 ) {
		turnOutTheLights( document.getElementById( "lightsOut" ) );
	}
}
async function initJson( jsonUrl ) {
	const response = await fetch( jsonUrl );
	const jsonData = await response.text();
	jsonObj = await JSON.parse( jsonData );
}
function addLang( seas, ep, player ) {
	for ( let i = 0; i < jsonObj.series.seasons[seas - 1].episodes[ep - 1].epSubs.length; i++ ) {
		let label = jsonObj.series.seasons[seas - 1].episodes[ep - 1].epSubs[i].label;
		let lang = jsonObj.series.seasons[seas - 1].episodes[ep - 1].epSubs[i].lang;
		let path = jsonObj.series.vttPath + "s" + String( seas ).padStart( 2, "0" ) + "e" + String( ep ).padStart( 2, "0" ) + "-" + lang + ".vtt";
		let track = document.createElement("track");
		track.kind = "subtitles";
		track.label = label;
		track.scrlang = lang;
		track.src = path;
		player.appendChild(track);
	}
}
function cleanUrlParam() {
	let seasNumParam = parseInt( getUrlParam( "s" ) );
	let epNumParam = parseInt( getUrlParam( "e" ) );
	let resParam = parseInt( getUrlParam( "res" ) );
	let lightsOutParam = parseInt( getUrlParam( "lo" ) );
	if ( seasNumParam > objectLen( jsonObj.series.seasons ) ) {
		seasNumParam = 1;
		addUrlParam( "s", 1 );
	}
	if ( epNumParam > objectLen( jsonObj.series.seasons[seasNumParam - 1].episodes ) ) {
		epNumParam = 1;
		addUrlParam( "e", 1 );
	}
	if ( jsonObj.series.seasons[seasNumParam - 1].episodes[epNumParam - 1].hasOwnProperty( "vidRes" ) ) {
		if ( jsonObj.series.seasons[seasNumParam - 1].episodes[epNumParam - 1].vidRes.indexOf( resParam ) < 0 ) {
			addUrlParam( "res", jsonObj.series.seasons[seasNumParam - 1].episodes[epNumParam - 1].vidRes[0] );
		}
	} else if ( jsonObj.series.vidRes.indexOf( resParam ) < 0 ) {
		addUrlParam( "res", jsonObj.series.vidRes[0] );
	}
	if ( lightsOutParam > 1 ) {
		addUrlParam( "lo", 0 );
	}
}
function clearLang( player ) {
	while ( player.getElementsByTagName( "track" ).length > 0 ) {
		player.getElementsByTagName( "track" )[0].parentNode.removeChild( player.getElementsByTagName( "track" )[0] );
	}
}
function initSeas() {
	const seasList = document.getElementById( "seasList" );
	for ( let i = 0; i < objectLen( jsonObj.series.seasons ); i++ ) {
		let seasOption = document.createElement( "option" );
		if ( jsonObj.series.seasons[i].hasOwnProperty( "seasName" ) ) {
			seasOption.text = jsonObj.series.seasons[i].seasName;
		} else {
			seasOption.text = "Season " + jsonObj.series.seasons[i].seasNum;
		}
		seasOption.value = i;
		seasList.add( seasOption );
	}
}
function epList( seasNum ) {
	const epList = document.getElementById( "epList" );
	for ( let i = epList.options.length - 1; i >= 0; i-- ) {
		epList.remove( i );
	}
	for ( let i = 0; i < objectLen( jsonObj.series.seasons[seasNum].episodes ); i++ ) {
		let epOption = document.createElement( "option" );
		if ( jsonObj.series.seasons[seasNum].hasOwnProperty( "seasName" ) && !jsonObj.series.seasons[seasNum].hasOwnProperty( "numberEps" ) ) {
			epOption.text = jsonObj.series.seasons[seasNum].episodes[i].epTitle;
		} else {
			epOption.text = jsonObj.series.seasons[seasNum].episodes[i].epNum + ". " + jsonObj.series.seasons[seasNum].episodes[i].epTitle;
		}
		epOption.value = i;
		epList.add( epOption );
	}
}
function resList( seasNum, epNum ) {
	const resList = document.getElementById( "playerRes" );
	for ( let i = resList.options.length - 1; i >= 0; i-- ) {
		resList.remove( i );
	}
	if ( jsonObj.series.seasons[seasNum].episodes[epNum].hasOwnProperty( "vidRes" ) ) {
		for ( let i = 0; i < objectLen( jsonObj.series.seasons[seasNum].episodes[epNum].vidRes ); i++ ) {
			let resOption = document.createElement( "option" );
			resOption.text = jsonObj.series.seasons[seasNum].episodes[epNum].vidRes[i] + "p";
			resOption.value = jsonObj.series.seasons[seasNum].episodes[epNum].vidRes[i];
			resList.add( resOption );
		}
		if ( jsonObj.series.seasons[seasNum].episodes[epNum].vidRes.indexOf( getUrlParam( "res" ) ) < 0 ) {
			resList.selectedIndex = 0;
		} else {
			resList.selectedIndex = jsonObj.series.seasons[seasNum].episodes[epNum].vidRes.indexOf( getUrlParam( "res" ) );
		}
	} else {
		for ( let i = 0; i < objectLen( jsonObj.series.vidRes ); i++ ) {
			let resOption = document.createElement( "option" );
			resOption.text = jsonObj.series.vidRes[i] + "p";
			resOption.value = jsonObj.series.vidRes[i];
			resList.add( resOption );
		}
		if ( jsonObj.series.vidRes.indexOf( getUrlParam( "res" ) ) < 0 ) {
			resList.selectedIndex = 0;
		} else {
			resList.selectedIndex = jsonObj.series.vidRes.indexOf( getUrlParam( "res" ) );
		}
	}
}
function pageInit() {
	let epName = jsonObj.series.seasons[getUrlParam( "s" ) - 1].episodes[getUrlParam( "e" ) - 1].epTitle;
	if ( jsonObj.series.seasons[getUrlParam( "s" ) - 1].hasOwnProperty( "seasName" ) ){
		document.title = epName + jsonObj.page.pageTitle;
	} else {
		document.title = jsonObj.series.titleAbbrev + " S" + String( getUrlParam( "s" ) ).padStart( 2, "0" ) + "E" + String( getUrlParam( "e" ) ).padStart( 2, "0" ) + jsonObj.page.pageTitle;
	}
	document.getElementById( "epName" ).innerHTML = epName;
	document.getElementById( "seasList" ).selectedIndex = getUrlParam( "s" ) - 1;
	document.getElementById( "epList" ).selectedIndex = getUrlParam( "e" ) - 1;
}
function loadVideo( seasNum, epNum, vidRes, autoPlay ) {
	const vidContainer = document.getElementById( "playerVid" );
	const vidElem = document.getElementById( "viewPort" );
	vidContainer.pause();
	let vidTime = vidContainer.currentTime;
	let vidPath = jsonObj.series.vidPath + "s" + String( seasNum ).padStart( 2, "0" ) + "e" + String( epNum ).padStart( 2, "0" ) + "-" + vidRes + "p.mp4";
	let enableTrack = 101;
	vidElem.setAttribute( "src", vidPath );

	for ( let i = 0; i < vidContainer.textTracks.length; i++ ) {
		if ( vidContainer.textTracks[i].mode === "showing" ) {
			enableTrack = i;
			break;
		}
	}

	clearLang( vidContainer );

	if ( jsonObj.series.seasons[seasNum - 1].episodes[epNum - 1].hasOwnProperty( "epSubs" ) ) {
		addLang( seasNum, epNum, vidContainer );

		if ( enableTrack < 101 ) {
			if ( enableTrack < vidContainer.textTracks.length ) {
				vidContainer.textTracks[enableTrack].mode = "showing";
			} else {
				vidContainer.textTracks[0].mode = "showing";
			}
		}
	}

	if ( jsonObj.series.seasons[seasNum - 1].episodes[epNum - 1].hasOwnProperty( "vidHeight" ) ) {
		if ( jsonObj.series.seasons[seasNum - 1].episodes[epNum - 1].vidHeight.hasOwnProperty( vidRes ) ) {
			vidRes = jsonObj.series.seasons[seasNum - 1].episodes[epNum - 1].vidHeight[vidRes];
		}
	}
	if ( jsonObj.series.seasons[seasNum - 1].episodes[epNum - 1].hasOwnProperty( "vidRatio" ) ) {
		vidContainer.style.width = Math.ceil( parseInt( vidRes ) * jsonObj.series.seasons[seasNum - 1].episodes[epNum - 1].vidRatio ) + "px";
	} else {
		vidContainer.style.width = Math.ceil( parseInt( vidRes ) * jsonObj.series.vidRatio ) + "px";
	}

	vidContainer.load();

	if ( autoPlay === 1 ) {
		vidContainer.currentTime = vidTime;
		vidContainer.play();
	}
}
function changeEp() {
	const seasNum = parseInt( document.getElementById( "seasList" ).value );
	const epNum = parseInt(  document.getElementById( "epList" ).value );
	resList( seasNum, epNum );
	const vidRes = parseInt( document.getElementById( "playerRes" ).value );
	const vidContainer = document.getElementById( "playerVid" );
	vidContainer.pause();
	addUrlParam( "s", seasNum + 1 );
	addUrlParam( "e", epNum + 1 );
	addUrlParam( "res", vidRes );
	cleanUrlParam();
	pageInit();
	setPlayerRes( vidRes );
}
function setPlayerRes( vidRes ) {
	loadVideo( getUrlParam( "s" ), getUrlParam( "e" ), parseInt( vidRes ), document.getElementById( "playerVid" ).paused ? 0 : 1 );
	addUrlParam( "res", vidRes );
}
function turnOutTheLights( elemButton ){
	const onOff = document.body.classList.contains( "lightsOut" );
	switch( onOff ){
		case false:
			document.body.classList.add( "lightsOut" );
			elemButton.value = "1";
			elemButton.innerHTML = "On";
			elemButton.classList.add( "on" );
			break;
		case true:
			document.body.classList.remove( "lightsOut" );
			elemButton.value = "0";
			elemButton.innerHTML="Off";
			elemButton.classList.remove( "on" );
			break;
	}
	addUrlParam( "lo", elemButton.value );
}
function objectLen( obj ) {
	return Object.keys( obj ).length;
}
function getUrlParam( arg ){
	let urlString = window.location.href;
	let url = new URL( urlString );
	let v = url.searchParams.get( arg );
	if ( v !== null ) {
		if ( Number.isInteger( parseInt( v ) ) ) {
			return parseInt( v );
		} else {
			return 500;
		}
	} else {
		return 500;
	}
}
function addUrlParam( key, value ) {
    if ( history.pushState ) {
        let searchParams = new URLSearchParams( window.location.search );
        searchParams.set( key , value );
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + searchParams.toString();
        window.history.pushState( {path: newurl} , "" , newurl );
    }
}
