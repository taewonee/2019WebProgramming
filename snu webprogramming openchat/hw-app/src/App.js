
//ESLINT가 없어서 죄송합니다 ㅠㅠㅠ 논리설계실험떄문에 바빠서...
//simple logout은 toggle button으로 구현
//로그인과 회원가입이 약간 애매해 일단 login과 별개로 우측 계정을 누르면 sign out 할 수 있음
//자기가한 말은 간단히 색깔만 변경
//login toggle을 누르면 login modal이 표시
//login 되어 있으면 알아서 가장 아래로 내려감
// 말풍선 크기는 그냥 제가 좋아보이는 크기 정도로 했습니다...
// 로그인 안한채로 채팅 or 전송안되면 한 말 지워지면 억울하니께 안지워지도록 했어요
//file 하나로 보내서 죄송합니다 좀 바빠서요!! 대신 열심히 주석 달았습니다 행복행복 충성충성!
//바빠서 스크롤링은 못했습니다. 유감.

import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';


const API_ENDPOINT = 'https://snu-web-random-chat.herokuapp.com';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    flexGrow: 1,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    multiline: "true",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "50%",
  },
}));

//skeleton code 그대로
class ChatMessage {
  constructor(userName, message, createdAt) {
    this.message = message;
    this.userName = userName;
    this.createdAt = createdAt;
    this.Hour = Math.floor((this.createdAt/(1000*60*60) + 9)%24);
    this.Minute = Math.floor(this.createdAt/(1000*60) % 60);
    this.Second = Math.floor(this.createdAt/1000%60);
  }
  print() {
    return (
      <div>
      <div>
        <span style = {{fontSize:"12px"}}> {this.userName} </span>
        <Grid container spacing={2} >
        <Grid item xs={5}>
        <Paper style = {{whiteSpace: 'pre-line', textAlign: 'center', background: (localStorage.getItem('__name') === this.userName) ? "#ffff00" : "#ebe2e3"}}>{this.message}</Paper>
        <span style ={{color:"gray", fontSize:"11px", float:"right", }}>{this.Hour}:{this.Minute}</span>
        </Grid>
        </Grid>
        </div>

      </div>
    );
  }
}


export default function App() {
  const classes = useStyles();                                                //material ui
  const [auth, setAuth] = useState(localStorage.getItem('__key'));            //로그인 토글
  const [loginmodal, setLoginmodal] = useState(! auth);                         //로그인 modal 생성
  const [anchorEl, setAnchorEl] = useState(null);                             //logout을 위하여 by material ui
  const [messageList, setMessageList] = useState([]);                         //by skeleton code
  const [name, setName] = useState(null);                                     
  const [messages, setMessages] = useState(null);

  const handleModalopen = () => {    setLoginmodal(true);  };
  const handleModalclose = () => {    setLoginmodal(false);  };
  const open = Boolean(anchorEl);
  const handleLoginchange = event => {   //login button을 켜면
    // 이전에 로그인이 되어있었나 체크
    if(! localStorage.getItem('__key')) //login x -> 모달 생성
        handleModalopen();

    setAuth(event.target.checked); //ui
        //로그인 화면으로 이동 -> 모달
  };

  const handleSignout = () => {
    localStorage.setItem('__key', "");
    localStorage.setItem('__name', "");
    window.location.reload();
  }

  const handleMenu = event => {    setAnchorEl(event.currentTarget);  };
  const handleClose = () => {    setAnchorEl(null);  };

  const onLogin = (e) => {
    e.preventDefault();
    if (!name)  return alert('input your name');
    if(! navigator.onLine)  alert("you are not online T.T Sorry");
    fetch(`${API_ENDPOINT}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `name=${name}`, 
    })
      .then((response) => response.json())
      .then(({ key }) => {
        if (key)
        {
          localStorage.setItem('__key', key);
          localStorage.setItem('__name', name);
          setAuth(true); //ui
        }
      })
      .catch((err) => console.error(err));
  };

  const onSend = (e) => {
if(! navigator.onLine)  alert("you are not online T.T Sorry");

    if(!messages) {return;}
    if (!auth){
      window.scrollTo(0,0);
      return alert('please login');
    }
    setMessages("");
    fetch(`${API_ENDPOINT}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Key ${localStorage.getItem('__key')}`,
      },
      body: `message=${messages}`,
    })
    .then((response) => response.json())
    .then(({message}) => {
      
      fetch(`${API_ENDPOINT}/chats?order=desc`)
        .then((res) => res.json())
        .then((messages) => {
          setMessageList(
            messages.reverse().map((message) => new ChatMessage(message.userName, message.message, message.createdAt)),
          );
        });
    })
    .catch((err) => console.error(err));
    
  


  }
   useEffect(() => {         //처음 한번 
    if(! navigator.onLine)  alert("you are not online T.T Sorry");
    fetch(`${API_ENDPOINT}/chats?order=desc`)
      .then((res) => res.json())
      .then((messages) => {      
        setMessageList(
          messages.reverse().map((message) => new ChatMessage(message.userName, message.message, message.createdAt)),
        );
        if(auth)  window.scrollTo(0,document.body.scrollHeight);
      });
  }, []);


  useEffect(() => {             //3초마다 한 번
    const interval = setInterval(() => {
      fetch(`${API_ENDPOINT}/chats?order=desc`)
      .then((res) => res.json())
      .then((messages) => {
        console.log("refreshing");
        setMessageList(
          messages.reverse().map((message) => new ChatMessage(message.userName, message.message, message.createdAt)),
        );
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const onLoginButtonClick = (e) => {
    onLogin(e);
    handleModalclose();
  }

  const keyPress = (e) => {         //shift enter or enter control
    if(e.keyCode === 13)
    {
      if(e.shiftKey)
      {
        e.preventDefault();
        e.target.value = e.target.value + "\n";
        setMessages(e.target.value);
      }
      else
      {
        e.preventDefault();
        onSend(e);
      }
    }
  }

return (
    <div>
      <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={loginmodal}
        onClose={handleModalclose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={loginmodal}>
          <div className={classes.paper}>
          <h2 id="transition-modal-title">Welcome to <br></br>Jin's Kingdom</h2>
            <p id="transition-modal-description">name yourself and be honored</p>
            <form id="loginWindow" onSubmit={onLoginButtonClick}>
            <input type="text" name="name" placeholder="type your name" onChange={(e) => setName(e.target.value)} />
            <input type="submit" value="login" />
            </form>
          </div>
        </Fade>
      </Modal>
    </div>
      
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
          <FormGroup>
          <FormControlLabel
            control={<Switch checked={auth} onChange={handleLoginchange} aria-label="login switch" />}
            label={auth ? 'Logout' : 'Login'}
          />
        </FormGroup>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            </IconButton>
            <Typography variant="h6" className={classes.title} align="center">
              SNU WebP OpenChat
            </Typography>
            {auth && (
              <div>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <div style = {{fontSize: "10px"}}>
                  <AccountCircle />
                  <p> {localStorage.getItem('__name')} </p>
                  </div>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleSignout}>Signout</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </div>

      <div className="chatList" style={{ padding: '20px' }}>
        {messageList.map((message) => message.print())}
      </div>

      <div>
        <form className={classes.container} noValidate autoComplete="off" onSubmit = {onSend}>
          <TextField
            name="messages"
            id="standard-multiline-flexible"
            label="  type your message"
            multiline = "true"
            value={messages}
            onChange={(e) => setMessages(e.target.value)}          className={classes.textField}
            onKeyDown = {(e) => keyPress(e)}
            margin="normal"
          />                
        <Button type="submit" color="secondary" >Send</Button>
        </form>
      </div>

    </div>
  );
}





