/*** Dots. (c) Bridget Lane 2015 bridgetlane.github.io ***/
window.onload = function() {    
    "use strict";
    var game = new Phaser.Game(
                                500, 600,           // Width, height of game in px
                                Phaser.AUTO,        // Graphic rendering
                                'game',     
                                { preload: preload, // Preload function
                                  create: create,   // Creation function
                                  update: update }  // Update function
                               );
    var decision; var GY; var RB;    
    var numGroups = 4;
    var totalSTATEset = 0;
    var green; var yellow; var blue; var red;
    var groups = [  // each color has its own group, accessible with GROUP - other data is the current group state, images, and members
                  green = {GROUP: 0, STATE: 0, NAME: "GREEN", IMAGES: ['green', 'green_select', 'green_finalSTATE'], MEMBERS: []},
                  yellow = {GROUP: 0, STATE: 0, NAME: "YELLOW", IMAGES: ['yellow', 'yellow_select', 'yellow_finalSTATE'], MEMBERS: []}, 
                  blue = {GROUP: 0, STATE: 0, NAME: "BLUE", IMAGES: ['blue', 'blue_select', 'blue_finalSTATE'], MEMBERS: []}, 
                  red = {GROUP: 0, STATE: 0, NAME: "RED", IMAGES: ['red', 'red_select', 'red_finalSTATE'], MEMBERS: []}
                  ];
    var row0; var row1; var row2; var row3;
    var rowTrack = [
                    row0 = {STATE: 0, NAME: "0", IMAGES: ['green', 'green_select', 'green_finalSTATE'], MEMBERS: []},
                    row1 = {STATE: 0, NAME: "1", IMAGES: ['yellow', 'yellow_select', 'yellow_finalSTATE'], MEMBERS: []},
                    row2 = {STATE: 0, NAME: "2", IMAGES: ['blue', 'blue_select', 'blue_finalSTATE'], MEMBERS: []},
                    row3 = {STATE: 0, NAME: "3", IMAGES: ['red', 'red_select', 'red_finalSTATE'], MEMBERS: []}
                    ];
    var color; var colorIndex = 0;
    var AIColors = [ 
                    color = { COLORS: [2, 3], IMAGE: "turnIndicator_RB" }
                    ];
    var playerColors = [ 
                        color = { COLORS: [0, 1], IMAGE: "turnIndicator_GY" }
                        ];
    var turnSprite; var info; var restart; var finalStateText;

    
    function preload(){
        game.load.image('green', 'assets/img/green.png');
        game.load.image('yellow', 'assets/img/yellow.png');
        game.load.image('blue', 'assets/img/blue.png');
        game.load.image('red', 'assets/img/red.png');
        game.load.image('green_select', 'assets/img/green_select.png');
        game.load.image('yellow_select', 'assets/img/yellow_select.png');
        game.load.image('blue_select', 'assets/img/blue_select.png');
        game.load.image('red_select', 'assets/img/red_select.png');
        game.load.image('green_finalSTATE', 'assets/img/green_finalSTATE.png');
        game.load.image('yellow_finalSTATE', 'assets/img/yellow_finalSTATE.png');
        game.load.image('blue_finalSTATE', 'assets/img/blue_finalSTATE.png');
        game.load.image('red_finalSTATE', 'assets/img/red_finalSTATE.png');
        game.load.image('turnIndicator_GY', 'assets/img/turnIndicator_GY.png');
        game.load.image('turnIndicator_RB', 'assets/img/turnIndicator_RB.png');
        game.load.image('turnIndicator_GY_initial', 'assets/img/turnIndicator_GY_initial.png');
        game.load.image('turnIndicator_RB_initial', 'assets/img/turnIndicator_RB_initial.png');
        game.load.image('info', 'assets/img/info.png');
        game.load.image('restart', 'assets/img/restart.png');
        game.load.image('white', 'assets/img/white.png');
    };
    
    function create(){
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.stage.backgroundColor = '#F8F8F8';
        
        pickAPlayer();
    };

    function update(){
        if (totalSTATEset >= numGroups*2) { computeWinner(); }
    };
    
    function pickAPlayer(){
        var numSlots = 4;
        var slot = 1;
        decision = game.add.text(game.world.centerX, (500/numSlots)*slot, "pick your colors: ", { font: "32px Arial", fill: "#000", align: "center" });
        decision.anchor.set(0.5); slot++;
        
        GY = game.add.sprite(game.world.centerX, (500/numSlots)*slot, 'turnIndicator_GY_initial');
        GY.anchor.set(0.5); slot++; GY.inputEnabled = true;
        GY.events.onInputDown.add(pick, this);
        
        RB = game.add.sprite(game.world.centerX, (500/numSlots)*slot, 'turnIndicator_RB_initial');
        RB.anchor.set(0.5); slot++; RB.inputEnabled = true;
        RB.events.onInputDown.add(pick, this);
    };
    
    function pick(button){
        if (button == RB){
            AIColors[colorIndex].COLORS = [0, 1];
            AIColors[colorIndex].IMAGE = "turnIndicator_GY";
            playerColors[colorIndex].COLORS = [2, 3];
            playerColors[colorIndex].IMAGE = "turnIndicator_RB";
            //console.log("RB, changed");
        }
        else{ 
            //console.log("GY, pre-set");
        } 
        decision.destroy();
        GY.destroy();
        RB.destroy();
        setMiniHUD();
        setCircles();
    };
    
    function setMiniHUD(){
        function displayInfo(){
            var bg = game.add.sprite(game.world.centerX, game.world.centerY, 'white');
            bg.width = 500; bg.height = 600; bg.anchor.set(0.5);
            bg.inputEnabled = true;
            bg.events.onInputDown.add(function(){ bg.destroy(); displayText.destroy(); }, this);
        
            var buffer = 500/4;
            var descrip = "Dots\n\nSelect or deselect ANY circle. If all 4 circles in a column or row are selected, the row will LOCK (become unchangeable).\n\nThe color of the LAST CIRCLE selected before LOCKING becomes the color of the whole col/row. When all circles are locked, the player (you or the computer) with the largest number of COMPLETED rows or columns of their colors WINS.\n\nClick anywhere to continue.";
            var displayText = game.add.text(game.world.centerX, game.world.centerY, descrip, { font: "12px Arial", background: "#FFF" });
            displayText.anchor.set(0.5);
            displayText.wordWrap = true; displayText.wordWrapWidth = 500 - buffer;
            displayText.inputEnabled = true;
            displayText.events.onInputDown.add(function(){ bg.destroy(); displayText.destroy(); }, this);
        };
        function restartGame(){
            groups[0].GROUP.destroy(true); groups[1].GROUP.destroy(true); groups[2].GROUP.destroy(true); groups[3].GROUP.destroy(true);
            turnSprite.destroy(); info.destroy(); restart.destroy(); finalStateText.destroy();
            totalSTATEset = 0;
            groups[0].STATE = 0; groups[0].MEMBERS.splice(0, groups[0].MEMBERS.length);
            groups[1].STATE = 0; groups[1].MEMBERS.splice(0, groups[1].MEMBERS.length);
            groups[2].STATE = 0; groups[2].MEMBERS.splice(0, groups[2].MEMBERS.length);
            groups[3].STATE = 0; groups[3].MEMBERS.splice(0, groups[3].MEMBERS.length);
            rowTrack[0].STATE = 0; rowTrack[0].MEMBERS.splice(0, rowTrack[0].MEMBERS.length);
            rowTrack[1].STATE = 0; rowTrack[1].MEMBERS.splice(0, rowTrack[1].MEMBERS.length);
            rowTrack[2].STATE = 0; rowTrack[2].MEMBERS.splice(0, rowTrack[2].MEMBERS.length);
            rowTrack[3].STATE = 0; rowTrack[3].MEMBERS.splice(0, rowTrack[3].MEMBERS.length);
            AIColors[colorIndex].COLORS = [2, 3]; AIColors[colorIndex].IMAGE = "turnIndicator_RB";
            playerColors[colorIndex].COLORS = [0, 1]; playerColors[colorIndex].IMAGE = "turnIndicator_GY";
            
            pickAPlayer();
        };
        finalStateText = game.add.text(game.world.centerX, 600 - (600/(numGroups*4)), "", { font: "24px Arial", background: "#FFF" });
        finalStateText.anchor.set(0.5);
        
        var multiple = 2;
        var hOffset = 600 - (600/(numGroups*multiple));
        turnSprite = game.add.sprite(game.world.centerX, hOffset, playerColors[colorIndex].IMAGE);
        turnSprite.anchor.set(0.5);
        
        info = game.add.sprite(game.world.centerX/3, hOffset, 'info');
        info.anchor.set(0.5); info.inputEnabled = true;
        info.events.onInputDown.add(displayInfo, this);
        
        restart = game.add.sprite(game.world.centerX + (game.world.centerX - (game.world.centerX/3)), hOffset, 'restart');
        restart.anchor.set(0.5); restart.inputEnabled = true;
        restart.events.onInputDown.add(restartGame, this);
    };
    
    function setCircles(){
        var dimension = 500/numGroups;
        var imgWidth = 50;
        var buffer = 10;
        var colPos = 1;
        var rowPos = 1;
        
        var i;
        for (i = 0; i < numGroups; i++){
            // iterate through groups to create a group for each color
            groups[i].GROUP = game.add.group();
            groups[i].GROUP.enableBody = true;
            
            var j;
            for (j = 0; j < numGroups; j++){
                // create all the circles belonging to the group
                var circle = groups[i].GROUP.create(
                                                      dimension*colPos - (imgWidth + buffer), // get the new circle position
                                                      dimension*rowPos - (imgWidth + buffer), 
                                                      groups[i].IMAGES[groups[i].STATE] // get the image, corresponding to the state (starting state = 0)
                                                      );
                circle.anchor.set(0.5);
                circle.body.immovable = true;
                circle.body.moves = false;
                circle.inputEnabled = true;
                circle.events.onInputDown.add(handle, this);
                circle.name = i.toString();  // use inherent Sprite name property to track GROUP INDEX of member: member.GROUP
                circle.health = groups[i].STATE;  // use inherent Sprite health property to track STATE of member: member.STATE
                groups[i].MEMBERS.push(circle);
                rowTrack[j].MEMBERS.push(circle);
                rowPos++;
            }
            colPos++;
            rowPos = 1;
        }
    };
    
    function handle(circle){
        var colPos = parseInt(circle.name); // get COL POSITION
        var rowPos = 0;
        for (var i = 0; i < groups[colPos].MEMBERS.length; i++){ // get ROW POSITION
            if (groups[colPos].MEMBERS[i] == circle) { rowPos = i; }
        }
    
        // adjust all STATES (circle, column, row)
        (circle.health === 0) ? circle.health++ : circle.health--;        
        (circle.health === 0) ? groups[colPos].STATE-- : groups[colPos].STATE++;
        (circle.health === 0) ? rowTrack[rowPos].STATE-- : rowTrack[rowPos].STATE++;
        
        // >>>>>>>>>>>>> use circle.name to calculate winner: change circle.name to the final color (what group it belongs)
        
        if (groups[colPos].STATE === numGroups){ // check if ALL OF COL is SELECTED
            totalSTATEset++; // increase total STATE of board
            groups[colPos].MEMBERS.forEach(
                function(member){ 
                    member.inputEnabled = false; 
                    member.health = 2;
                    member.loadTexture(groups[colPos].IMAGES[member.health]);
                    member.name = colPos.toString();
                }, this
            );
        }
        
        if (rowTrack[rowPos].STATE === numGroups){ // check if ALL OF ROW is SELECTED
            totalSTATEset++;
            rowTrack[rowPos].MEMBERS.forEach(
                function(member){ 
                    member.inputEnabled = false; 
                    member.health = 2;
                    member.loadTexture(groups[colPos].IMAGES[member.health]);
                    member.name = colPos.toString();
                }, this
            );
        }
        
        circle.loadTexture(groups[colPos].IMAGES[circle.health]);
        
        turn(); // AI PLAYER takes one turn
    };
    
    function turn(){
        game.input.enabled = false;
        //////////// BASIC ALGORITHM ////////////
        // if row/col can be completed and is not AIColor, complete it
        // if row/col can be completed and IS AIColor, and totalFINISHcouunt > 3, select it. <3, deselect it
        // Otherwise, select rand node that does not complete anything
        // otherwise, select or deselect any rand node.
        /////////////////////////////////////////
        //ISSUE: That algorithm does not lose. So add an element of RANDOM
    
        turnSprite.loadTexture(AIColors[colorIndex].IMAGE);
        
        // assignments/functions to get a new random circle
        // must be done outside of else-block due to STRICT MODE
        var groupIdx = game.rnd.integerInRange(0, numGroups-1);
        var memberIdx = game.rnd.integerInRange(0, numGroups-1);
        var cir = groups[groupIdx].MEMBERS[memberIdx];
        function getNewRandCir(){
            groupIdx = game.rnd.integerInRange(0, numGroups-1);
            memberIdx = game.rnd.integerInRange(0, numGroups-1);
            cir = groups[groupIdx].MEMBERS[memberIdx];
        }
        var randElm = [2, 4, 7, 8, 10, 12, 15, 16];
        
        if (totalSTATEset >= numGroups*2){ return true; } // if the player ended the game, don't take a turn
        else{
            if ((groups[playerColors[colorIndex].COLORS[0]].STATE + 1) === numGroups){
                //make cir the unselected member
                groups[playerColors[colorIndex].COLORS[0]].MEMBERS.forEach(
                    function(member){
                        if (member.health === 0){ 
                            cir = member; 
                            return true; 
                        }
                    }, this
                );
            }
            else if ((groups[playerColors[colorIndex].COLORS[1]].STATE + 1) === numGroups){
                //make cir the unselected member
                groups[playerColors[colorIndex].COLORS[1]].MEMBERS.forEach(
                    function(member){
                        if (member.health === 0){ 
                            cir = member; 
                            return true; 
                        }
                    }, this
                );
            }
            else if (totalSTATEset > 4){
                //if AICOLOR row/col can be completed, finish it
                if ((groups[AIColors[colorIndex].COLORS[0]].STATE + 1) === numGroups){
                    //make cir the unselected member
                    groups[AIColors[colorIndex].COLORS[0]].MEMBERS.forEach(
                        function(member){
                            if (member.health === 0){ 
                                cir = member; 
                                return true; 
                            }
                        }, this
                    );
                }
                else if ((groups[AIColors[colorIndex].COLORS[1]].STATE + 1) === numGroups){
                    //make cir the unselected member
                    groups[AIColors[colorIndex].COLORS[1]].MEMBERS.forEach(
                        function(member){
                            if (member.health === 0){ 
                                cir = member; 
                                return true; 
                            }
                        }, this
                    );
                }
            }
            else if ((totalSTATEset < 4) && (randElm[game.rnd.integerInRange(0, 7)]%2 === 0)){ // RAND ELM to give player chance of winning
                //if AICOLOR row/col can be completed, DESELECT NODE
                if ((groups[AIColors[colorIndex].COLORS[0]].STATE + 1) === numGroups){
                    //make cir some selected member
                    groups[AIColors[colorIndex].COLORS[0]].MEMBERS.forEach(
                        function(member){
                            if (member.health === 1){ 
                                cir = member; 
                                return true; 
                            }
                        }, this
                    );
                }
                else if ((groups[AIColors[colorIndex].COLORS[1]].STATE + 1) === numGroups){
                    //make cir some selected member
                    groups[AIColors[colorIndex].COLORS[1]].MEMBERS.forEach(
                        function(member){
                            if (member.health === 1){ 
                                cir = member; 
                                return true; 
                            }
                        }, this
                    );
                }
                else{
                    while (cir.health === 2){ getNewRandCir(); }
                }
            }
            else{
                // just selects ANY avail rand node
                while (cir.health === 2){ getNewRandCir(); }
            }
            
            // handle SELECT/DESELECT of cir
            setTimeout(function(){
                var colPos = parseInt(cir.name); // get COL POSITION
                var rowPos = 0;
                for (var i = 0; i < groups[colPos].MEMBERS.length; i++){ // get ROW POSITION
                    if (groups[colPos].MEMBERS[i] == cir) { rowPos = i; }
                }
            
                // adjust all STATES (circle, column, row)
                (cir.health === 0) ? cir.health++ : cir.health--;        
                (cir.health === 0) ? groups[colPos].STATE-- : groups[colPos].STATE++;
                (cir.health === 0) ? rowTrack[rowPos].STATE-- : rowTrack[rowPos].STATE++;
                
                if (groups[colPos].STATE === numGroups){ // check if ALL OF COL is SELECTED
                    totalSTATEset++; // increase total STATE of board
                    groups[colPos].MEMBERS.forEach(
                        function(member){ 
                            member.inputEnabled = false; 
                            member.health = 2;
                            member.loadTexture(groups[colPos].IMAGES[member.health]);
                            member.name = colPos.toString();
                        }, this
                    );
                }
                
                if (rowTrack[rowPos].STATE === numGroups){ // check if ALL OF ROW is SELECTED
                    totalSTATEset++;
                    rowTrack[rowPos].MEMBERS.forEach(
                        function(member){ 
                            member.inputEnabled = false; 
                            member.health = 2;
                            member.loadTexture(groups[colPos].IMAGES[member.health]);
                            member.name = colPos.toString();
                        }, this
                    );
                }
                cir.loadTexture(groups[colPos].IMAGES[cir.health]);
            }, 1000);
        }
        
        // END TURN
        setTimeout(function(){turnSprite.loadTexture(playerColors[colorIndex].IMAGE); game.input.enabled = true; }, 1000);
        return true;
    };
    
    function computeWinner(){    
        var lockedColors = [
                            green = {num: 0},
                            yellow = {num: 0},
                            blue = {num: 0},
                            red = {num: 0}
                            ];
    
        for (var i = 0; i < numGroups; i++){
            var lastCol = parseInt(groups[i].MEMBERS[0].name);
            var lastRow = parseInt(rowTrack[i].MEMBERS[0].name);
            groups[i].MEMBERS.forEach(
                function(member){ 
                    if (parseInt(member.name) === lastCol){ true; }
                    else{ lastCol = -1; }
                }, this
            );
            rowTrack[i].MEMBERS.forEach(
                function(member){ 
                    if (parseInt(member.name) === lastRow){ true; }
                    else{ lastRow = -1; }
                }, this
            );
            if (lastCol !== -1) { lockedColors[lastCol].num++; }
            if (lastRow !== -1) { lockedColors[lastRow].num++; }
        }
        
        var AITotal = lockedColors[AIColors[colorIndex].COLORS[0]].num + lockedColors[AIColors[colorIndex].COLORS[1]].num;
        var playerTotal = lockedColors[playerColors[colorIndex].COLORS[0]].num + lockedColors[playerColors[colorIndex].COLORS[1]].num;
        //console.log("AITotal: ", AITotal, " Player total: ", playerTotal);
        
        (playerTotal > AITotal) ? finalStateText.setText("you win") : finalStateText.setText("you lose");
        return false;
    };
};
