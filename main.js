let config = {
	countRows: 6,
	countCols: 7,

	smileSize: 80,

	imagesSmile: ["img/smile1.png", "img/smile2.png", "img/smile3.png", "img/smile4.png", "img/smile5.png", "img/smile6.png", "img/smile7.png", "img/smile8.png"],

	smileClass:"smile",
	smileIdPrefix: "smile",
	gameStates: ["pick", "switch", "revert", "remove", "refill"],
	gameState: "",
	
	movingItems: 0,

	countScore: 0
}

let player = {
	selectedRow: -1,
	selectedCol: -1,
	posX: "",
	posY: ""
}

let components = {
	container : document.querySelector(".container"), 
	content : document.querySelector(".content"), 
	wrapper : document.querySelector(".wrapper"), 
	cursor : document.querySelector(".cursor"), 
	score : document.querySelector(".score"),
	btn : document.querySelector(".change__all"),
	smiles: new Array(),
}

const musicPlayer = {
	musicContainer : document.querySelector(".music__container"),
	playBtn : document.querySelector("#play"),
	prevBtn : document.querySelector("#prev"),
	nextBtn : document.querySelector("#next"),

	audio : document.querySelector("#audio"),

	songs : ["audio/bg-music1.mp3", "audio/bg-music2.mp3", "audio/bg-music3.mp3", "audio/bg-music4.mp3", "audio/bg-music5.mp3"],
	songIndex : 0,
	currTime : 0
};

createGrid();

components.btn.addEventListener("click", changeAllSmiles);

function cursorShow () {
	components.cursor.style.display = "block";
}
function cursorHide () {
	components.cursor.style.display = "none";
}
components.wrapper.addEventListener("click", function(event) { handlerTab(event, event.target) });

function updateScore () {
	components.score.innerHTML = config.countScore;
}

function scoreInt (count) {
	if (count >= 4) {
		count *= 2;
	} else if (count >= 5) {
		count = (count + 1) * 2;
	} else if (count >= 6) {
		count *= (count + 2) * 2;
	}

	config.countScore += count;
	updateScore();
}
function createSmile (top, left, row, col, img) {
	let smile = document.createElement("div");

	smile.classList.add(config.smileClass);
	smile.id = config.smileIdPrefix + "_" + row + "_" + col;
	smile.style.top = top + "px";
	smile.style.left = left + "px";
	smile.style.backgroundImage = `url(${img})`;
	
	components.wrapper.append(smile);
}
function createGrid () {
	for(let i = 0; i< config.countRows; i+=1) {
		components.smiles[i] = new Array();
		for ( let j = 0; j < config.countCols; j+=1) {
			components.smiles[i][j] = -1;
		}
	}

	for(let i = 0; i < config.countRows; i+=1) {
		for ( let j = 0; j < config.countCols; j+=1) {
			do{
				components.smiles[i][j] = Math.floor(Math.random() *8);
			} while (isStreak(i, j));
			createSmile(i*config.smileSize, j*config.smileSize, i, j, config.imagesSmile[components.smiles[i][j]]);
		}
	}
}
function isStreak( row, col ) {
	return isVerticalStreak( row, col ) || isHorizontalStreak( row, col );
}
function isVerticalStreak( row, col ) {
	let smileValue = components.smiles[row][col];
	let streak = 0;
	let tmp = row;

	while(tmp > 0 && components.smiles[tmp - 1][col] == smileValue){
		streak++;
		tmp--;
	}

	tmp = row;

	while(tmp < config.countRows - 1 && components.smiles[tmp + 1][col] == smileValue){
		streak++;
		tmp++;
	}

	return streak > 1;
}

function isHorizontalStreak( row, col ) {
	let smileValue = components.smiles[row][col];
	let streak = 0;
	let tmp = col;

	while(tmp > 0 && components.smiles[row][tmp - 1] == smileValue){
		streak++;
		tmp--;
	}

	tmp = col;

	while(tmp < config.countCols - 1 && components.smiles[row][tmp + 1] == smileValue){
		streak++;
		tmp++;
	}

	return streak > 1;
}

// click handler
function handlerTab (event, target) {
	if(target.classList.contains(config.smileClass) && config.gameStates[0]) {
		let row = parseInt(target.getAttribute("id").split("_")[1]);
		let col = parseInt(target.getAttribute("id").split("_")[2]);

		cursorShow();
		components.cursor.style.top = parseInt( target.style.top ) + "px";
		components.cursor.style.left = parseInt( target.style.left ) + "px";

		if (player.selectedRow == -1) {
			player.selectedRow = row;
			player.selectedCol = col;
		} else {
			if ((Math.abs(player.selectedRow - row) == 1 && player.selectedCol == col) || (Math.abs(player.selectedCol - col) == 1 && player.selectedRow == row)) {
				cursorHide();

				config.gameState = config.gameStates[1];

				player.posX = col;
				player.posY = row;

				smileSwitch();
			} else {
				player.selectedRow = row;
				player.selectedCol = col;
			}
		}
	}
};

function smileSwitch () {
	let yOffset = player.selectedRow - player.posY;
	let xOffset = player.selectedCol - player.posX;

	document.querySelector("#" + config.smileIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).classList.add("switch");
	document.querySelector("#" + config.smileIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).setAttribute("dir", "-1");

	document.querySelector("#" + config.smileIdPrefix + "_" + player.posY + "_" + player.posX).classList.add("switch");
	document.querySelector("#" + config.smileIdPrefix + "_" + player.posY + "_" + player.posX).setAttribute("dir", "1");

	$( ".switch" ).each( function() {
		config.movingItems +=1;

		$(this).animate( {
				left: "+=" + xOffset * config.smileSize * $(this).attr("dir"),
				top: "+=" + yOffset * config.smileSize * $(this).attr("dir")
			},
			{
				duration: 250,
				complete: function() {
					checkMoving();
				}
			}
		);

		$(this).removeClass("switch");
	});
	document.querySelector("#" + config.smileIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).setAttribute("id", "temp");
	document.querySelector("#" + config.smileIdPrefix + "_" + player.posY + "_" + player.posX).setAttribute("id", config.smileIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol);
	document.querySelector("#temp").setAttribute("id",  config.smileIdPrefix + "_" + player.posY + "_" + player.posX);

	let temp = components.smiles[player.selectedRow][player.selectedCol];
	components.smiles[player.selectedRow][player.selectedCol] = components.smiles[player.posY][player.posX];
	components.smiles[player.posY][player.posX] = temp;
}

function checkMoving() {
	config.movingItems -=1;
	if (config.movingItems === 0) {
		switch(config.gameState) {
			case config.gameStates[1]:
			case config.gameStates[2]:
				if(!isStreak(player.selectedRow, player.selectedCol) && !isStreak (player.posY, player.posX)) {
					if (config.gameState != config.gameStates[2]) {
						config.gameState = config.gameStates[2];
						smileSwitch();
					} else {
						config.gameState = config.gameStates[0];
						player.selectedRow = -1;
						player.selectedCol = -1;
					}
				} else {
					config.gameState = config.gameStates[3];

					if (isStreak(player.selectedRow, player.selectedCol)) {
						removeSmiles(player.selectedRow, player.selectedCol);
					}
					if (isStreak(player.posY, player.posX)) {
						removeSmiles( player.posY, player.posX );
					}

					smileFade();
		} 
		break;
		
		case config.gameStates[3]:
			checkFalling();
			break;
		case config.gameStates[4]:
			placeNewSmiles();
			break;
		}
	}
};

function removeSmiles(row, col) {
	let smileValue = components.smiles[row][col];
	let tmp = row;

	document.querySelector( "#" + config.smileIdPrefix + "_" + row + "_" + col ).classList.add( "remove" );
	let countRemoveSmile = document.querySelectorAll( ".remove" ).length;

	if(isVerticalStreak(row, col)) {
		while (tmp > 0 && components.smiles[tmp - 1][col] == smileValue) {
			document.querySelector("#" + config.smileIdPrefix + "_" + ( tmp - 1) + "_" + col).classList.add("remove");
			components.smiles[tmp -1][col] = -1;
			tmp -= 1;
			countRemoveSmile += 1;
		}
		tmp = row;

		while (tmp < config.countRows - 1 && components.smiles[tmp + 1][col] == smileValue) {
			document.querySelector("#" + config.smileIdPrefix + "_" + (tmp + 1) + "_" + col).classList.add("remove");
			components.smiles[tmp + 1][col] = -1;
			tmp += 1;
			countRemoveSmile += 1;
		}
	}
	if ( isHorizontalStreak( row, col ) ) {
		tmp = col;

		while ( tmp > 0 && components.smiles[ row ][ tmp - 1 ] == smileValue ) {
			document.querySelector( "#" + config.smileIdPrefix + "_" + row + "_" + ( tmp - 1 ) ).classList.add( "remove" );
			components.smiles[ row ][ tmp - 1 ] = -1;
			tmp -= 1;
			countRemoveSmile += 1;
		}

		tmp = col;

		while( tmp < config.countCols - 1 && components.smiles[ row ][ tmp + 1 ] == smileValue ) {
			document.querySelector( "#" + config.smileIdPrefix + "_" + row + "_" + ( tmp + 1 ) ).classList.add( "remove" );
			components.smiles[ row ][ tmp + 1 ] = -1;
			tmp++;
			countRemoveSmile++;
		}
	}

	components.smiles[row][col] = -1;

	scoreInt(countRemoveSmile);

}

function smileFade () {
	$(".remove").each(function() {
		config.movingItems += 1;

		$(this).animate( {
			opacity: 0
		},
		{
			duration: 200,
			complete: function() {
				$(this).remove();
				checkMoving();
			}
		});
	});
};

function checkFalling() {
	let fellDown = 0;

	for (let i = 0; i < config.countCols; i += 1) {
		for (let j = config.countRows - 1; j > 0; j -= 1) {
			if (components.smiles[j][i] == -1 && components.smiles[j - 1][i] >= 0) {
				document.querySelector( "#" + config.smileIdPrefix + "_" + (j - 1) + "_" + i ).classList.add( "fall" );
				document.querySelector( "#" + config.smileIdPrefix + "_" + (j - 1) + "_" + i ).setAttribute( "id", config.smileIdPrefix + "_" + j + "_" + i );

				components.smiles[j][i] = components.smiles[j - 1][i];
				components.smiles[j - 1][i] = -1;
				fellDown += 1;
			}
		}
	}

	$(".fall").each(function() {
		config.movingItems += 1;

		$(this).animate( {
			top: "+=" + config.smileSize
		}, {
			duration: 100, 
			complete: function() {
				$(this).removeClass("fall");
				checkMoving();
			}
		});
	});

	if (fellDown == 0) {
		config.gameState = config.gameStates[4];
		config.movingItems = 1;
		checkMoving();
	}

};

function placeNewSmiles() {
	let smilesPlaced = 0;

	for( let i = 0; i < config.countCols; i += 1) {
		if (components.smiles[0][i] == -1) {
			components.smiles[0][i] = Math.floor(Math.random() *8);

			createSmile(0, i*config.smileSize, 0, i, config.imagesSmile[components.smiles[0][i]]);
			smilesPlaced += 1;
		}
	}

	if(smilesPlaced) {
		config.gameState = config.gameStates[3];
		checkFalling();
	} else {
		let combo = 0

		for (let i = 0; i < config.countRows; i++ ) {
			for (let j = 0; j < config.countCols; j++ ) {

				if ( j <= config.countCols - 3 && components.smiles[ i ][ j ] == components.smiles[ i ][ j + 1 ] && components.smiles[ i ][ j ] == components.smiles[ i ][ j + 2 ] ) {
					combo++;
					removeSmiles( i, j );
				}
				if ( i <= config.countRows - 3 && components.smiles[ i ][ j ] == components.smiles[ i + 1 ][ j ] && components.smiles[ i] [ j ] == components.smiles[ i + 2 ][ j ] ) {
					combo++;
					removeSmiles( i, j );
				}

			}
		}

		if( combo > 0 ) {
			config.gameState = config.gameStates[ 3 ];
			smileFade();
		} else { 
			config.gameState = config.gameStates[ 0 ];
			player.selectedRow= -1;
		}
	}
};

function changeAllSmiles() {
	for (let i = 0; i < config.countRows; i += 1) {
		for (let j = 0; j < config.countCols; j += 1) {
			document.querySelector( "#" + config.smileIdPrefix + "_" + i + "_" + j ).classList.add( "remove" );
		}
	}

	smileFade();
	createGrid();
};



function loadSong(song) {
	musicPlayer.audio.src = `${song}`;
	musicPlayer.musicContainer.classList.add("play"); 

	musicPlayer.audio.currentTime = musicPlayer.currTime;
	musicPlayer.playBtn.querySelector('i.fas').classList.remove("fa-play");
	musicPlayer.playBtn.querySelector('i.fas').classList.add("fa-pause");

	musicPlayer.audio.play();
};

function pauseSong() {
	musicPlayer.musicContainer.classList.remove("play");
	musicPlayer.currTime = musicPlayer.audio.currentTime;
	musicPlayer.playBtn.querySelector('i.fas').classList.remove("fa-pause");
	musicPlayer.playBtn.querySelector('i.fas').classList.add("fa-play");

	musicPlayer.audio.pause();
}

function playPrevSong() {
	musicPlayer.songIndex -= 1;

	if(musicPlayer.songIndex < 0) {
		musicPlayer.songIndex = musicPlayer.songs.length - 1;
	}

	musicPlayer.currTime = 0;
	loadSong(musicPlayer.songs[musicPlayer.songIndex]);
};

function playNextSong() {
	musicPlayer.songIndex += 1;

	if(musicPlayer.songIndex == musicPlayer.songs.length) {
		musicPlayer.songIndex = 0;
	}
	loadSong(musicPlayer.songs[musicPlayer.songIndex]);
};

musicPlayer.playBtn.addEventListener("click", () => {

	if(musicPlayer.musicContainer.classList.contains("play")) {
		pauseSong();
	} else {
		loadSong(musicPlayer.songs[musicPlayer.songIndex]);
	}
});

musicPlayer.prevBtn.addEventListener('click', playPrevSong);
musicPlayer.nextBtn.addEventListener('click', playNextSong);
