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

dm @sorenbs in slack to have this activated. Include the following meta information:

 - ProjectId
 - Name of user model. Oftehn this is User
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

## Resources

See the official facebook documentation https://developers.facebook.com/docs/facebook-login
