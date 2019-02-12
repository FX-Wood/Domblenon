

google.charts.load('current', {packages:["corechart"]});
google.charts.setOnLoadCallback(drawPies)

var maxPie, minPie, maxTable, minTable, pieTracker, kingdomSize, dom, kingdomChoices;
var players = [];


var maxOptions = {

    pieSliceText: "value",
    legend: {position: "none"},
    tooltip: {text:"value", textStyle: {fontSize: '12'}},
    chartArea: {left: '2.5%', top: '2.5%', height: '95%', width: '95%'},
    pieHole: 0.6

}
var minOptions = {

    pieSliceText: "value",
    legend: {position: "none"},
    tooltip: {text: "value", textStyle: {fontSize: '12'}},
    chartArea: {left: '5%', top: '5%', height: '90%', width: '90%'},

}

var maxData = [
    ['Card', 'num'],
    ['Dominion MAX', 6],
    ['Adventures MAX', 2],
    ['Prosperity MAX', 2],
]

var minData = [
    ['Card', 'num'],
    ['Dominion MIN', 4],
    ['Adventures MIN', 1],
    ['Prosperity MIN', 1]
]
function refreshData() {
    minData = dom.mins.map(el => {
        if (typeof el.value === 'undefined') {
            return null;
        }
        return [el.name, parseInt(el.value)]
    })
    .filter(tuple => {
        // console.log(tuple[1], !!tuple[1])
        if (tuple[1]) {
            return true
        } else {
            return false
        }
    })
    .sort(pair => {
        return pair[2] - pair[1];
    })
    // console.log(minData)
    minData.unshift(['Card', 'Num'])
    // console.log(minData)
    minTable = google.visualization.arrayToDataTable(minData);
    
    maxData = dom.maxs.map(el => {
        if (typeof el.value === 'undefined') {
            return null;
        }
        return [el.name, parseInt(el.value)]
    })
    .filter(tuple => {
        // console.log(tuple[1], !!tuple[1])
        if (tuple[1]) {
            return true
        } else {
            return false
        }
    })
    .sort(pair => {
        return pair[2] - pair[1];
    })
    maxData.unshift(['Card', 'Num'])
    // console.log(maxData)
    maxTable = google.visualization.arrayToDataTable(maxData);
}

function drawPies() {
    let hook1 = document.getElementById('setPie');
    let hook2 = document.getElementById('setPie2');
    maxTable = google.visualization.arrayToDataTable(maxData);
    minTable = google.visualization.arrayToDataTable(minData);
    maxTable.addColumn({type: 'string', role:'tooltip'})
    if (!pieTracker) {
        pieTracker = true;
        maxPie = new google.visualization.PieChart(hook1);
        minPie = new google.visualization.PieChart(hook2);
    }
    maxPie.draw(maxTable, maxOptions);
    minPie.draw(minTable, minOptions);
    // remove their background boxes from the svg
    let rect1 = hook1.querySelector('rect')
    rect1.parentElement.removeChild(rect1)
    let rect2 = hook2.querySelector('rect')
    rect2.parentElement.removeChild(rect2)
}

function selectListener(e) {
    if (e.target.className.includes('max')) {
        let minEl = e.target.previousElementSibling.previousElementSibling
        let maxEl = e.target
        if (parseInt(maxEl.value) < parseInt(minEl.value)) {
            minEl.selectedIndex = parseInt(maxEl.value) + 1
        }
     }
    if (e.target.className.includes('min')) {
        let maxEl = e.target.nextElementSibling.nextElementSibling
        let minEl = e.target
        if (parseInt(maxEl.value) < parseInt(minEl.value)) {
            maxEl.selectedIndex = parseInt(minEl.value) + 1
        }
    }
    kingdomSizer();
    refreshData();
    drawPies();
}

function checkBoxListener2(e) {
    console.log('clicked')
    console.log(e.target.nextElementSibling)
    let minEl = e.target.nextElementSibling.nextElementSibling;
    let maxEl = minEl.nextElementSibling.nextElementSibling;
    if (e.target.checked) {
        console.log(e.target)
        minEl.removeAttribute('disabled')
        maxEl.removeAttribute('disabled');
        minEl.selectedIndex = '2';
        maxEl.selectedIndex = '3';
    }
    if (!e.target.checked) {
        minEl.selectedIndex = '0';
        maxEl.selectedIndex = '0';
        minEl.setAttribute('disabled', 'disabled');
        maxEl.setAttribute('disabled', 'disabled')
    }
    kingdomSizer();
    refreshData();
    drawPies();
}

function kingdomSizer(e) {
    kingdomSize = parseInt(e.target.value);
    let minSum = dom.mins.map(el => parseInt(el.value)).reduce((a, b) => {return a + b}, 0)
    console.log(minSum)
}

document.addEventListener('DOMContentLoaded', e => {
    document.querySelectorAll('input[name="select-set"]')
    .forEach(checkbox => {
        checkbox.addEventListener('click', checkBoxListener2)
    })
    document.getElementById('kingdom-size').addEventListener('input', kingdomSizer)
    document.getElementById('kingdom-cruncher-btn').addEventListener('click', selectKingdom)
    kingdomSize = 10;
    dom = {
        mins: Array.from(document.querySelectorAll('select.min')),
        maxs: Array.from(document.querySelectorAll('select.max')),
        addPlayerBtn: document.getElementById('add-a-player'),
        playersBox: document.getElementById('players-box')
    }

    window.addEventListener('resize', drawPies)
    dom.mins.concat(dom.maxs).forEach(select => {
        select.addEventListener('change', selectListener)
    })

    dom.addPlayerBtn.addEventListener('click', newPlayer)
    newPlayer();
})

function updateName(e) {
    
    let name = e.target.value;
    console.log(e.target.value)
    console.log(e.target.parentElement.parentElement.id.match(/\d+/g)[0])
    let num = parseInt(e.target.parentElement.parentElement.id.match(/\d+/g)[0])
    console.log('num', num, 'name', name, 'players', players)
    players[num][1] = name;

    window.localStorage.setItem('players', JSON.stringify(players));
}

function toggleAi(e) {
    console.log('clicked ai toggle');
    let aibox = e.target.parentElement.parentElement
    console.log(aibox)
    aibox.classList.toggle('ai')

}
function removePlayer(e) {
    console.log('clicked remove player');
    console.log(e.target)
    e.target.parentElement.parentElement.removeChild(e.target.parentElement);
}
function newPlayer() {
    let container = document.createElement('div');
    let switchBox = document.createElement('div');
    let switchInput = document.createElement('input');
    let switchTrack = document.createElement('span');
    let icon = document.createElement('img');
    let nameBox = document.createElement('div');
    let nameInput = document.createElement('input');
    let nameLabel = document.createElement('span')
    let nameBorder = document.createElement('span');
    let removeBtn = document.createElement('button');

    // container
    playerNum = dom.playersBox.children.length
    playerId = 'player-' + playerNum;
    container.id = playerId;
    container.className = "player-container";
    dom.playersBox.appendChild(container)

    // player icon
    icon.src = './img/' + 'player' + playerNum + '.png';
    icon.className = 'player-icon--human';
    container.appendChild(icon);
    
    // switch
    switchBox.className = 'ai-switch-box';
    container.appendChild(switchBox)

    switchInput.id = playerId + '-ai-switch';
    switchInput.className = 'ai-switch-input';
    switchInput.type = 'checkbox';
    switchInput.checked = true;
    switchBox.appendChild(switchInput);
    switchInput.addEventListener('click', toggleAi);

    switchTrack.className = 'ai-switch-track';
    switchBox.appendChild(switchTrack);
    switchTrack.addEventListener('click', e=> {
        switchInput.click();
    })

    nameBox.for = playerId + '-name';
    nameBox.className = 'name-box';
    container.appendChild(nameBox)

    nameInput.type = 'text';
    nameInput.id = playerId + '-name';
    nameInput.className = 'name-field';
    nameInput.placeholder = String.fromCharCode(160);
    nameBox.appendChild(nameInput);
    nameInput.addEventListener('change', updateName)

    nameLabel.className = 'name-label';
    nameLabel.textContent = 'player ' + playerNum;
    nameBox.appendChild(nameLabel);

    nameBorder.className = 'name-border';
    nameBox.appendChild(nameBorder);


    removeBtn.textContent = '-';
    removeBtn.className = 'remove-player-btn';
    container.appendChild(removeBtn);
    removeBtn.addEventListener('click', removePlayer)
    
    players.push([playerNum, playerId])
    window.localStorage.setItem('players', JSON.stringify(players));
}


function selectKingdom() {
    let kingdom = document.getElementById('kingdom');
    while(kingdom.firstChild) {
        kingdom.removeChild(kingdom.firstChild);
    }
    let options = [
            "Artisan",
            "Chapel",
            "CouncilRoom",
            "Festival",
            "Gardens",
            "Laboratory",
            "Market",
            "Mine",
            "Moneylender",
            "Remodel",
            "Smithy",
            "Village",
            "Witch",
            "Workshop"
        ];
    kingdomChoices = [];
    console.log({options, kingdomChoices, kingdomSize})
    for (let i = 0; i < kingdomSize; i++) {
        // this is me being clever -- I'm putting the chosen ones back on the end of the array
        // I won't double-pick them because I'm limiting the options to that many fewer than 
        // the length of the array.
        let pick = Math.floor(Math.random() * (options.length - i))
        let choice = options.splice(pick, 1)[0]
        options.push(choice)
        kingdomChoices.push(choice)
        console.log({i, pick, choice, kingdomChoices, options})
    }
    console.log({options, kingdomChoices})

    kingdomChoices.forEach((choice, i) => {
        let row;
        if (i % 5 === 0) {
            row = document.createElement('div');
            row.className = 'card__scroll';
            row.id = 'row ' + i / 5;
            kingdom.appendChild(row);
        } else (
            row = document.getElementById('row ' + Math.floor(i / 5))
        )
        console.log('i', i, 'i % 5', i % 5, 'i / 5', Math.floor(i / 5), 'row', row)
        let card = new Card(...CARDS[choice])
        card.render(row, 'pick' + i, "trash")
    })
    window.localStorage.setItem('kingdom', (JSON.stringify(kingdomChoices)))
}

function startGame() {
    if (kingdomChoices) {
        if (players) {
            if (window.localStorage.players)
                if (window.localStorage.kingdomChoices) {
                    window.location.href = 'game.html';
                }
        }
    }
}