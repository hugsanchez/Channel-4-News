import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  HashRouter as Router,
  Link,
  Switch,
  Route,
  withRouter,
} from 'react-router-dom';
import { attemptLogin } from '../store/actions/userActions/getCurUser';
import Chores from './chores/ChoresView';
import ChildProfile from './child components/ChildProfile';
import JoinOrCreateFamily from './forms/JoinOrCreateFamily';
import LogIn from './forms/LogIn';
import Register from './forms/Register';
import NavBar from './NavBar';
import WishList from './wishListComponents/WishList';
import ChildLandingPage from './child components/ChildLandingPage';
import Chatroom from './chatComponents/Chatroom';
import EditChildInfo from './forms/EditChildInfo';
import Dummy from './dummyPage/dummy';
import Home from './Home';
import LinkPlaid from './PlaidLink';
import VirtualCard from './forms/VirtualCard';
import CreateCard from './forms/CreateCard';
import ParentLandingPage from './parentComponents/ParentLandingPage';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

//For testing purposes
import SortNotifications from './notifications/SortNotifications';
import store from '../store/store';
import { sendNotification } from '../store/actions/notificationActions/sendNotification';
import websocket from '../store/actions/notificationActions/sendNotification';
import ReactNotification from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import { cashWithdrawl, choreSuccess } from './notifications/notificationUtils';

//Thunk Import
import { loadNotificationsThunk } from '../store/actions/notificationActions/loadNotification';
import { updateAllowance } from '../store/actions/allowance/updateAllowance';
import { setAllowance } from '../store/actions/allowance/setAllowance';
import { getKids } from '../store/actions/parentActions/getKids';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
    };
  }

  async componentDidMount() {
    await this.props.attemptLogin();
    await this.setState({ ...this.state, user: this.props.currUser });
    websocket.addEventListener('message', (ev) => {
      const action = JSON.parse(ev.data);
      if (action.notification?.firstName) {
        store.dispatch(
          updateAllowance(
            action.notification.balance,
            action.notification.daysToAllowance
          )
        );
      }
      if (action.id) {
        action.isChoreCompleted
          ? choreSuccess(action.text, action.amount)
          : action.isCash
            ? cashWithdrawl(action.text, action.amount)
            : '';
        store.dispatch(sendNotification(action));
      }
    });
  }

  componentDidUpdate() {
    if (this.props.currUser) {
      this.props.setAllowance(
        this.props.currUser.balance,
        this.props.currUser.allowanceInterval
      );
    }
    if (this.props.currUser.status === 'Parent') {
      this.props.getKids(this.props.currUser.id);
    }
    if (this.props.currUser.status !== this.state.user.status) {
      this.setState({ ...this.state, user: this.props.currUser });
      if (this.props.currUser.status === 'Parent') {
        this.props.loadNotifications();
      }
      if (websocket.readyState === 1) {
        websocket.send(
          JSON.stringify({
            token: window.localStorage.getItem('userToken'),
          })
        );
      }
      websocket.addEventListener('open', () => {
        websocket.send(
          JSON.stringify({
            token: window.localStorage.getItem('userToken'),
          })
        );
      });
    }
  }

  render() {
    const parentTheme = createMuiTheme({
      palette: {
        primary: {
          light: '#e6f2f9',
          main: '#c9d4db',
          dark: '#b4bfc6',
          contrastText: '#fff',
        },
        secondary: {
          light: '#62efff',
          main: '#00bcd4',
          dark: '#008ba3',
          contrastText: '#000',
        },
      },
    });

    const kidTheme = createMuiTheme({
      palette: {
        primary: {
          light: '#8199ff',
          main: '#3e6bff',
          dark: '#0041cb',
          contrastText: '#fff',
        },
        secondary: {
          light: '#ff8262',
          main: 'rgb(252, 77, 54)',
          dark: '#c1010b',
          contrastText: '#fff',
        },
      },
    });

    return (
      <ThemeProvider
        theme={this.state.user.status === 'Parent' ? parentTheme : kidTheme}
      >
        <ReactNotification />
        <Router>
          <NavBar user={this.state.user} />
          <div id="mainAppContent">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/signup" component={Register} />
              <Route exact path="/login" component={LogIn} />
              <Route
                exact
                path="/createfamily"
                component={JoinOrCreateFamily}
              />
              <Route exact path="/chores" component={Chores} />
              <Route exact path="/childprofile" component={ChildProfile} />
              <Route
                exact
                path="/notifications"
                component={SortNotifications}
              />
              {/* {this.state.user.status === 'Child'} */}
              <Route
                exact
                path="/home"
                component={() =>
                  this.state.user.status === 'Child' ? (
                    <ChildLandingPage />
                  ) : (
                    <ParentLandingPage />
                  )
                }
              />
              <Route exact path="/editchildinfo" component={EditChildInfo} />
              <Route exact path="/wishlist" component={WishList} />
              <Route exact path="/dummy" component={Dummy} />
              <Route exact path="/link" component={LinkPlaid} />
              <Route exact path="/card" component={VirtualCard} />
              <Route exact path="/createcard" component={CreateCard} />
              <Route
                exact
                path="/chatroom"
                component={() => <Chatroom user={this.state.user} />}
              />
            </Switch>
          </div>
        </Router>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currUser: state.currUser,
    notifications: state.notifications,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    attemptLogin: () => dispatch(attemptLogin()),
    loadNotifications: () => dispatch(loadNotificationsThunk()),
    setAllowance: (balance, allowanceInterval) =>
      dispatch(setAllowance(balance, allowanceInterval)),
    getKids: (id) => dispatch(getKids(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
