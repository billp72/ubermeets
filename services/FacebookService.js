import React from 'react'
import FBSDK from 'react-native-fbsdk'

const { LoginManager, AccessToken, GraphRequest, GraphRequestManager } = FBSDK

class FacebookService {
  constructor() {}

  makeLoginButton(callback) {
        LoginManager.logInWithPermissions(['public_profile', 'user_birthday', 'user_gender']).then(
          result => {
          if (result.isCancelled) {
            console.log(result.isCancelled)
          } else {
            AccessToken.getCurrentAccessToken()
              .then((data) => {
                  callback(
                    data.accessToken, 
                    `https://graph.facebook.com/${data.userID}/picture?height=400&width=400`
                    )
                  
              })
              .catch(err => {
                console.log(err)
              })
          }
        },
        error => {
          console.error(error)
        }) 
  }

  makeLogoutButton (callback) {
    callback()
    LoginManager.logOut();  
  }

  async fetchProfile(callback) {
    const PROFILE_REQUEST_PARAMS = {
      fields: {
        string: 'id,picture.type(large),name,gender,birthday',
      },
    };
    return new Promise((resolve, reject) => {
      AccessToken.getCurrentAccessToken().then((data) => {
          const token = data.accessToken
          const request = new GraphRequest(
            '/me',
            {token, parameters: PROFILE_REQUEST_PARAMS},
            (error, result) => {
              if (result) {
                const profile = result
                resolve(profile)
              } else {
                reject(error)
              }
            }
          )
    
          new GraphRequestManager().addRequest(request).start()
        })
        .catch(err => {
          console.log(err)
        })
    })
  }
}

export const facebookService = new FacebookService()