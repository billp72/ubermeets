import React, {Component}        from 'react';
import FBSDK                     from 'react-native-fbsdk'
import { createSwitchNavigator, createAppContainer } from 'react-navigation'
import LoginNav                  from './LoginNav';
import LoggedInNav               from './LoggedInNav';
import SplashScreen              from 'react-native-splash-screen';

const { AccessToken } = FBSDK; 

export default class AppContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      accessToken: null
    }
  }

  componentDidMount() {
    AccessToken.getCurrentAccessToken()
    .then((data) => {
      SplashScreen.hide();
      this.setState({
        accessToken: data.accessToken
      })
    })
    .catch(error => {
      console.log(error)
    })
  }
  getComponent() {
    const Navigator = makeRootNavigator(this.state.accessToken)
    return createAppContainer(Navigator)
  }
  render() {
    ComponentContainer = this.getComponent();
    return (<ComponentContainer />)
  }
}

const makeRootNavigator = (isLoggedIn) => {
  return createSwitchNavigator({
    LoginNav: {
      screen: LoginNav
    },
    LoggedInNav: {
      screen: LoggedInNav
    }
  },
  {
    initialRouteName: isLoggedIn ? 'LoggedInNav' : 'LoginNav'
    
  });
}

