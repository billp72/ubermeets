import React                     from 'react'
import Login                     from '../screens/Login';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer }    from 'react-navigation';

const LoginNav = createStackNavigator({
    Login: {
      screen: Login,
      navigationOptions: () => ({
          title: 'Metro Meet'
      })
    }
  });

const LoginContainer = createAppContainer(LoginNav);
export default LoginContainer;