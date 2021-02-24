//simple logout은 toggle button으로 구현
//완전히 sign out 하는 건 우측 계정을 누르면 sign out 할 수 있음
//자기가한 말은 간단히 색깔만 변경
//login toggle을 누르면 login modal이 표시
//login 되어 있으면 알아서 가장 아래로 내려감
// 말풍선 크기는 그냥 제가 좋아보이는 크기 정도로 했습니다...

/* eslint-disable react/jsx-filename-extension */
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

const API_ENDPOINT = 'https://snu-web-random-chat.herokuapp.com';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paper: {
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

}));


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
        <Paper style = {{textAlign: 'center', background: (localStorage.getItem('__name') === this.userName) ? "#ffff00" : "#ebe2e3"}}>{this.message}</Paper>
        <span style ={{color:"gray", fontSize:"11px", float:"right", }}>{this.Hour}:{this.Minute}</span>
        </Grid>
        </Grid>
        </div>
      </div>
    );
  }
}

let started = 0;


export default function App() {
  const classes = useStyles();
  const [loginmodal, setLoginmodal] = useState(false);

  const handleModalopen = () => {
    console.log("handlemodalopen");
    setLoginmodal(true);
  };
  const handleModalclose = () => {
    console.log("handlemodalclose");
    setLoginmodal(false);
  };
  
  const [auth, setAuth] = useState(localStorage.getItem('__key'));
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleChange = event => {   //login button을 켜면
    console.log("handlechange");
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

  const handleMenu = event => {
    console.log("handleMenu");
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    console.log("setanchor");
    setAnchorEl(null);
  };


  const [messageList, setMessageList] = useState([]);
  const [name, setName] = useState(null);
  const [messages, setMessages] = useState(null);
  const onLogin = (e) => {
    e.preventDefault();
    if (!name)  return alert('input your name');

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
        }
      })
      .catch((err) => console.error(err));
  };

  const onSend = (e) => {
    e.preventDefault();
    document.getElementById('chatsubmit').value = '';
    if(!messages) {return;}
    if (!auth){
      window.scrollTo(0,0);
      return alert('please login');
    }
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
      
      console.log("send complete");
      
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
  /*
console.log(started);

  if(window.scrollY != 0)
  {
    console.log("moved");
    started = 1;
  }
*/

   useEffect(() => {
    console.log("only one time");
    fetch(`${API_ENDPOINT}/chats?order=desc`)
      .then((res) => res.json())
      .then((messages) => {
        setMessageList(
          messages.reverse().map((message) => new ChatMessage(message.userName, message.message, message.createdAt)),
        );
      });
  }, []);


  useEffect(() => {
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
          <h2 id="transition-modal-title">Welcome</h2>
            <p id="transition-modal-description">please nameyourself</p>
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
          control={<Switch checked={auth} onChange={handleChange} aria-label="login switch" />}
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
            <form onSubmit = {onSend}>
              <input type="text" name="messages" placeholder="messages" id="chatsubmit" onChange={(e) => setMessages(e.target.value)} />
              <input type="submit" value="send" />
            </form>
          </div>

    </div>
  );
}


