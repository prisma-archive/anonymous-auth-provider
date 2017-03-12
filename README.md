# Graphcool developer notes

install serverless cli. Copy .envrc from 1pw.

Deploy with

```
serverless deploy
```

Url: `https://cmwww7ara1.execute-api.eu-west-1.amazonaws.com/dev/facebook-auth-provider/authenticateFacebookUser`

# facebook-auth-provider

## Features

### Interfaces

```graphql
interface FacebookUser {
  facebookUserId: String
  isVerified: Boolean!
}
```

### Mutations

```graphql
authenticateFacebookUser(fbToken: String!): authenticateFacebookUserPayload

type authenticateFacebookUserPayload {
  token: String!
}
```

## Installation

### Create a Facebook App

To use Facebook Login you need to create a facebook app. Follow this guide to create an app in a few minutes https://developers.facebook.com/docs/apps/register

> note: in order to test your web app locally you will need to include `localhost` in your App Domains and set the Site Url to something that includes localhost, for example `http://localhost:8000`

### Add the email permission

See https://developers.facebook.com/docs/facebook-login/permissions/#adding

By default you have access to the `public_profile` permission that includes information about the user such as name, age range and location. For this package to function properly you need to additionally ask for the `email` permission.

### Setup in Graphcool

dm @sorenbs in slack to have this activated. Include the following meta information:

 - ProjectId
 - Name of user model. Often this is `User`
 - facebook app id.
 
## Permissions

You should remove all Create User permissions. This ensures that users cannot be created manually and the `facebook-auth-provider` package will be able to create users anyway.

## Authentication flow in app

1. The user clicks authenticate with Facebook
2. Your app loads the Facebook ui to authenticate
3. Your app receives a Facebook Access Token
4. Your app calls the Graphcool mutation authenticateFacebookUser(fbToken: String!): {token: String!}
5. If the user doesn’t exist a new User will be created
6. Graphcool returns a valid token for the user
7. Your app stores the token and uses this for all further requests to Graphcool

## Merging accounts

> note: this is not supported yet

This package supports merging users created with different Auth Providers as long as the email mataches.

Here is a typical example:

1. A user signs up with the email/password based simple-auth-provider
2. The user verifies her email
3. At some later point the user signs in using Facebook

At this point `facebook-auth-provider` will try to merge the two accounts. Merging succeeds if:

 - The users primary email in Facebook matches the email stored in Graphcool
 - The user in Graphcool has verified the email.
 
Account merging is supported by all official Authentication Providers:

 - `facebook-auth-provider`
 - `google-auth-provider`
 - `simple-auth-provider`
 - `auth0-auth-provider`

Merging accounts with different emails is currently not supported

## Resources

See the official facebook documentation https://developers.facebook.com/docs/facebook-login
