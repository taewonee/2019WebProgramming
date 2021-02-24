/*

벤처창업 웹프로그래밍1 중간과제 - 웹으로 지뢰찾기 만들기
전기정보공학부 2016-12161 이태원

ㅇ camelCase를 따르나, input으로 받거나 temporary한 함수는 under_bar 형식을 따랐음.

ㅇ Flag시 'F' 표시 되고 색깔 변경

ㅇ Hint 기능 추가 (Flag 되지 않은 지뢰하나 빨간색으로 표시.
        모든 지뢰가 다 Flag 되었는데도 게임이 안 끝났다면 Flag를 지우라는 alert))

ㅇ 그외 지뢰찾기에서 필요한 각종 예외처리 ex.
    * Flag로 지뢰를 모두 찾아도 게임 종료
    * '이 값으로 플레이하기'를 누르면 게임 중이어도 언제든 row cloumn 변경 가능
            - 이 때 데이터 확보 빛 게임 map을 새로 만들기 위해서 deconstruct function 제작
    * 게임 종료 시 답지를 보여주고, 점수 출력. 그 후 더이상의 게임 플레이가 불가능하게 함
    * random mine 생성시 중복방지
*/


const init = () => {
    let x_in = 0; // 가로 세로 값을 선언
    let y_in = 0;
    let z_in = 0;
    let timer = 0;
    const timeBox = document.getElementById('time-box');
    let started = false; // checking it's the first time or not => to deconstruct

    document.getElementById('setting-form').addEventListener('submit', (e) => {         //게임 시작 버튼 클릭
        e.preventDefault();
        x_in = document.getElementById('how-many-row').value;
        y_in = document.getElementById('how-many-column').value;
        z_in = document.getElementById('how-many-mine').value;
        if(x_in <5 || x_in >30 || y_in <5 || y_in > 30 || z_in <0 || z_in>x_in*y_in)    //input의 조건
        {
            alert('젊은 친구, 신사답게 행동해 \n' + '묻고 5x5 ~ 30x30 게임으로 가!');
            deconstruct();                      //기존에 하던 게임이 남아있다면 그 게임을 폐기
        }
        else                                    //input을 만족한다면
        {
            if(!started)
            {
                gamestart(x_in, y_in, z_in);        //게임 시작
                started = true;
                setInterval(() => {
                    timeBox.textContent = timer;
                    timer++;
                }, 1000);
            }
            else
            {
                deconstruct();
                timer = 0;
                gamestart(x_in, y_in, z_in);
            }
        }
    });

    document.getElementById('regame-form').addEventListener('submit', (e) => {              //리겜버튼 클릭
        e.preventDefault();
        deconstruct();
        timer = 0;
        gamestart(x_in, y_in, z_in);
    });
    
}


const gamestart = (x_length, y_length, z_length) => {           //실제 게임을 동작시키는 함수
    const revealGoal = x_length*y_length - z_length; //to see when the game's done with revealing the number;
    let howManyRevealed = 0;                        //to see when the game's done with revealing;
    
    //mine 개수는 z_length를 그대로 이용
    let mineSearched = 0;      // 실제 찾은 mine 개수
    let howManyFlag = 0;  // 플래그 꽂은 개수

    const mineLeftScore = document.getElementById('mineleft-box');      //화면에 표시될 잔여 마인 개수를 위해
    mineLeftScore.textContent = z_length - howManyFlag;

    const cells = [];                               // 빈 셀 생성
    const mine_location = [];                       // storing where the mine is - 힌트function에 사용하기 위해 mine이 어디있는지 index만 저장

    let howManyQuestioned = 0;                      // ? 표시 개수
    let gameControl = 'ongoing';                    //게임이 끝났는지 끝나지 않았는지 여부 체크

    for(let i = 0; i < x_length; i++) {             //creating map//           
        const cellsX = [];
        cells.push(cellsX);
        
        for(let j=0; j < y_length; j++) {
            const domElement = document.createElement('div');
            domElement.className = "mine-cell-box";
            domElement.style.top = 30*(i+1) + 'px';
            domElement.style.height = 25 + 'px';
            domElement.style.left = 35*(j+1) + 'px';

            domElement.setAttribute('where_x', i);
            domElement.setAttribute('where_y', j);
            domElement.setAttribute('isMine', false);       
            domElement.setAttribute('isOpen', false);
            domElement.setAttribute('flagState', 0);        //0-> nothing, 1-> flagged 2-> ? 마크

            cellsX.push(domElement);
            const cellsParent = document.getElementById("playing-map-box");
            cellsParent.appendChild(domElement);

            domElement.addEventListener('click', function(e) {          //this를 쓰기 위해 arrow를 쓰지 않음
                e.preventDefault();
                openCell(this); 
            });
            domElement.addEventListener('contextmenu', function (e) {     
                e.preventDefault();
                flagCell(this);
            });
        
        }
    }

    for(i =0; i<z_length;i++) {                                         //burying mine
        let temp = Math.floor(Math.random()*x_length*y_length);         //0~ MAXIMUM RANDOM NUMBER CREATED
        if(!mine_location.includes(temp))   mine_location.push(temp);   //random 시 중복 방지
        else{
            i--;
            continue;
        }

        loc_mine_x = parseInt(temp/y_length);                   //setting x;
        loc_mine_y = temp%y_length;                             //setting y;
        cells[loc_mine_x][loc_mine_y].setAttribute('isMine', true);         //mine set
    }

    // cell open
    const openCell = function(cell) {

        const x = parseInt(cell.getAttribute('where_x')); 
        const y = parseInt(cell.getAttribute('where_y'));        
        const flagState = parseInt(cell.getAttribute('flagState'));
        const isMine = cell.getAttribute('isMine');
        const isOpen = cell.getAttribute('isOpen');

        if(isOpen == 'true')    return;
        if(flagState) return;
        cell.setAttribute('isOpen', true);
        howManyRevealed++;

        if(isMine == 'true') {                                  // if it's mine
            gameOver();                                         //execute gameOver();
        }
        else {
            const neighborCells = getNeighborCells(x, y);       //checking the number of the mines, read neighborcells
            const mineCount = neighborCells.reduce((pv, cv) => {
                if(cv.getAttribute('isMine')=='true') pv++;
                return pv;
            } , 0);
            if(mineCount > 0) {
                cell.textContent = mineCount;
            } else { // mine is zero
                cell.style.backgroundColor = '#eee';
                neighborCells.forEach(neighborCell => openCell(neighborCell));
            }

        }
        if(howManyRevealed == revealGoal && gameControl == 'ongoing')   Win();      //check event to win
    };

    const flagCell = function(cell) {                  
        const flagState = parseInt(cell.getAttribute('flagState'));
        if(gameControl !='ongoing') return;                             //게임이 끝났다면 더이상 flag되지않음
        if(flagState == 0)
        {
            cell.setAttribute('flagState', 1);
            cell.textContent = 'F';
            cell.style.backgroundColor = '#ddd';
            howManyFlag++;
            mineLeftScore.textContent = z_length - howManyFlag;            
            if(cell.getAttribute('isMine')=='true') mineSearched++;
        }
        else if(flagState == 1)
        {
            cell.setAttribute('flagState', 2);
            cell.textContent = '?';
            howManyFlag --;
            mineLeftScore.textContent = z_length - howManyFlag;
            if(cell.getAttribute('isMine') == 'true' ) mineSearched--;
            howManyQuestioned++;
        }
        else
        {
            cell.setAttribute('flagState', 0);
            cell.textContent = '';
            howManyQuestioned--;
            cell.style.backgroundColor = 'white';
        }
        if(mineSearched == z_length && z_length == howManyFlag && gameControl == 'ongoing' && howManyQuestioned ==0)    Win();
    }

    const Win = function() {
        gameControl = 'win';
        openall();                                        //답지 생성
        alert("You win!! \n" + 'time you spent: ' + document.getElementById('time-box').innerText + ' seconds \n' + 'mine you found: ' + z_length);                              //game done with winning;
                                                        //try again?
    }

    const gameOver = function() {
        gameControl = 'lose';
        openall();                                          //답지 생성
        alert("Mine-Craft!! You lose T.T \n" + 'time you spent: ' + document.getElementById('time-box').innerText + ' seconds \n' + 'mine you found: ' + mineSearched + ' / ' + z_length);                              //game done with winning;

    }
    const openall = function() {
        cells.forEach(function(x_element) {
            x_element.forEach(function(y_element)
            {
                if(y_element.getAttribute('isMine') == 'false')     openCell(y_element);        //게임이 끝났을 때는 opencell function이 constant time이므로 그냥 opencell을 사용
                else
                {
                    y_element.textContent = '*';
                    y_element.setAttribute('flagState', 1);                                     //flag는 계손 순환하고, F처리가 아닌 *를 표시해야 해야하므로 직접 처리
                    y_element.style.backgroundColor='gray';             
                }
            })
        })
    }

const getNeighborCells = function(xin, yin)
    {
        curr_x = parseInt(xin);
        curr_y = parseInt(yin);

        neighborcell_temp = [];
        for(i = -1; i<2; i++)           // 위아래 한칸씩,
        {
            for(j = -1; j<2; j++)       //좌우 한칸씩, 총 9칸 확인
            {
                if(curr_x +i >= 0 && curr_y + j >=0 && curr_x + i < x_length && curr_y + j < y_length)
                {
                    neighborcell_temp.push(cells[curr_x+i][curr_y+j]);
                }
            }
        }
        return neighborcell_temp;
    }

    const changeCellColor = function(cell, color) {
        cell.style.backgroundColor = color;
    }

    document.getElementById('help-form').addEventListener('submit', (e) => {            //힌트생성
        e.preventDefault();
        let count = 0;
        if(gameControl == 'ongoing')                 //게임이 시작되지 않았거나, 끝났으면 hint가 보이지않음                                   
        {
            for(i = 0; i<mine_location.length; i++)
            {
                if(cells[parseInt(mine_location[i]/y_length)][mine_location[i]%y_length].getAttribute('flagState') != '1')
                {
                    changeCellColor(cells[parseInt(mine_location[i]/y_length)][mine_location[i]%y_length], 'red');
                    break;
                }
                else                count++;
            }
            if(count == z_length)   alert('you flagged all!! try to remove the flag!');
        }
    });

}

const deconstruct = function()  {
    let elements = document.getElementsByClassName('mine-cell-box');
    const iteratortemp = elements.length;
    for(i = 0; i<iteratortemp; i++)
    {
        elements[0].parentNode.removeChild(elements[0]);
    }
//    element.document.parentNode.removeChild(element[0]);
}


init();