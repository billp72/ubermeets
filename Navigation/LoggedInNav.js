//login navigation
import React                     from 'react';
import { Platform }              from 'react-native';
import Meet                      from '../screens/Meet';
import Map                       from '../screens/Map';
import Matches                   from '../screens/Matches';
import Profile                   from '../screens/Profile';
import FBProfile                 from '../screens/FBProfile';
import Chat                      from '../screens/Chat';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator }  from 'react-navigation-stack';

const Main = createMaterialTopTabNavigator({
    Map: {
      screen: Map
    },
    Matches: {
      screen: Matches
    },
    Profile: {
      screen: Profile
    },
  },{
    tabBarOptions:{
      style:{
        backgroundColor:'#3D6DCC',
        marginTop: Platform.OS === 'ios' ? (31) : (0)
      }
  }
  });

  const LoggedInNav = createStackNavigator({
    Tab: {
      screen: Main
    },
    Meet: {
      screen: Meet
    },
    Chat: {
      screen: Chat
    },
    FBProfile: {
      screen: FBProfile
    }
  },
  {
    defaultNavigationOptions: {
      header:null
    }
  }
  );
 

export default LoggedInNav;
//const LoggedInContainer = createAppContainer(LoggedInNav);
