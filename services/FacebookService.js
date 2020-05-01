import React from 'react'
import FBSDK from 'react-native-fbsdk'

const { LoginButton, AccessToken, GraphRequest, GraphRequestManager } = FBSDK

class FacebookService {
  constructor() {}

  makeLoginButton(callback) {
    return (
      <LoginButton
        readPermissions={["public_profile", "user_birthday", "user_gender"]}
        onLoginFinished={(error, result) => {
          if (error) {

          } else if (result.isCancelled) {

          } else {
            AccessToken.getCurrentAccessToken()
              .then((data) => {
                  callback(
                    data.accessToken, 
                    `https://graph.facebook.com/${data.userID}/picture?height=400&width=400`
                    )
              })
              .catch(error => {
                console.log(error)
              })
          }
        }} />
    )
  }

  makeLogoutButton(callback) {
    return (
      <LoginButton onLogoutFinished={() => {
        callback()
      }} />
    )
  }

  async fetchProfile(callback) {
    
    return new Promise((resolve, reject) => {
      const request = new GraphRequest(
        '/me?fields=id,picture.type(large),name,gender',
        null,
        (error, result) => {
          if (result) {
            const profile = result
            //profile.avatar = `https://graph.facebook.com/${result.id}/picture?&height=400&width=400`;
            resolve(profile)
          } else {
            reject(error)
          }
        }
      )

      new GraphRequestManager().addRequest(request).start()
      
    })
  }
}

export const facebookService = new FacebookService()